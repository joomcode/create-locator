import {removeLocatorFromProperties} from '../index';
import type {Locator, Node} from '../index';

import {assert, type Test} from './index.spec';

type Component = (properties?: object) => object;

export const React = {
  createElement(ComponentOrTag: Component | string, properties: object, ...children: object[]) {
    properties = {children, ...properties};

    if (typeof ComponentOrTag === 'function') {
      return ComponentOrTag(properties);
    }

    return {tag: ComponentOrTag, properties};
  },
};

export const testRender: Test = ([createLocator, getLocatorParameters], environment) => {
  type FooLocator = Locator<{fooLeaf: {quux: string}}, {corge: string}>;
  type NodeLocator = Node<{subleaf: {baz: string}}, {qux: string}>;

  type RootLocator = Locator<
    {component: FooLocator; leaf: {foo: string}; node: NodeLocator},
    {bar: string}
  >;

  const rootLocator = createLocator<RootLocator>('root', {
    parameterAttributePrefix: 'data-prefix-',
    pathAttribute: 'data-path',
    pathSeparator: '.',
  });

  const Foo = (properties: FooLocator) => {
    const locator = createLocator(properties);
    const locatorParameters = getLocatorParameters(properties);

    locatorParameters.corge += '-grault';

    return (
      <div {...locator(locatorParameters)}>
        <span {...locator.fooLeaf({quux: 'garply'})}></span>
      </div>
    );
  };

  const Root = () => (
    <div {...rootLocator({bar: 'waldo'})}>
      <Foo {...rootLocator.component({corge: 'fred'})} />
      <span {...rootLocator.leaf({foo: 'plugh'})}>📌</span>
      <div {...rootLocator.node({qux: 'xyzzy'})}>
        <span {...rootLocator.node.subleaf({baz: 'thud'})}></span>
      </div>
    </div>
  );

  const expectedDevelopmentRoot = (
    <div data-path="root" data-prefix-bar="waldo">
      <div data-path="root.component" data-prefix-corge="fred-grault">
        <span data-path="root.component.fooLeaf" data-prefix-quux="garply"></span>
      </div>
      <span data-path="root.leaf" data-prefix-foo="plugh">
        📌
      </span>
      <div data-path="root.node" data-prefix-qux="xyzzy">
        <span data-path="root.node.subleaf" data-prefix-baz="thud"></span>
      </div>
    </div>
  );

  const expectedProductionRoot = (
    <div>
      <div>
        <span></span>
      </div>
      <span>📌</span>
      <div>
        <span></span>
      </div>
    </div>
  );

  const expectedRoot =
    environment === 'development' ? expectedDevelopmentRoot : expectedProductionRoot;

  assert(
    JSON.stringify(<Root />) === JSON.stringify(expectedRoot),
    'with custom options should render attributes correctly',
  );

  type ElementType = 'image' | 'text';

  type LabelLocator = Locator<{}, {level?: string; type?: ElementType}>;
  type LabelProperties = {level?: string; text: string} & LabelLocator;

  const Label = ({level = '3', text, ...rest}: LabelProperties) => {
    const locator = createLocator(rest);
    const locatorParameters = getLocatorParameters(rest);
    const locatorParametersWithDefaults = {
      level,
      type: (text.length > 5 ? 'text' : 'image') as ElementType,
      ...locatorParameters,
    };
    const restPropertiesWithoutLocator = removeLocatorFromProperties(rest);

    if ('children' in restPropertiesWithoutLocator) {
      delete restPropertiesWithoutLocator.children;
    }

    return (
      <span {...locator(locatorParametersWithDefaults)} {...restPropertiesWithoutLocator}>
        {text}
      </span>
    );
  };

  type HeaderLocator = Locator<{
    foo: LabelLocator;
    bar: LabelLocator;
  }>;
  type HeaderProperties = {text?: string} & HeaderLocator;

  const Header = (properties: HeaderProperties) => {
    const {text = 'foo'} = properties;
    const locator = createLocator(properties);

    return (
      <h1 {...locator()}>
        Header
        <Label text={text} {...locator.foo({})} />
        <Label text="foobar" {...locator.bar({})} />
      </h1>
    );
  };

  type RenderedLocator = Locator<{
    header: HeaderLocator;
  }>;

  type MainLocator = Locator<{
    header: HeaderLocator;
    rendered: RenderedLocator;
    text: {};
  }>;
  type MainProperties = {render: Function} & MainLocator;

  const Main = ({render, ...rest}: MainProperties) => {
    const locator = createLocator(rest);

    const rendered = render();

    return (
      <main {...locator()}>
        <Header {...locator.header()} />
        Some main text 📌
        {rendered}
      </main>
    );
  };

  type FooterLocator = Locator<{faq: {}}, {link: string}>;
  type FooterProperties = Partial<FooterLocator>;

  const Footer = (properties: FooterProperties) => {
    const locator = createLocator(properties);
    const propertiesWithoutLocator = removeLocatorFromProperties(properties);
    const locatorWithoutType = createLocator(propertiesWithoutLocator);

    const parameters = getLocatorParameters(properties);
    const parametersWithoutType = getLocatorParameters(propertiesWithoutLocator);

    assert(
      Object.keys(parameters).length === 0,
      'parameters are empty if the component is not marked with locator',
    );

    assert(
      parameters === parametersWithoutType,
      'parameters from all properties without locator is the same object',
    );

    return (
      <div {...locator(parameters)}>
        <a {...locator.faq()}>FAQ</a>
        <span {...locatorWithoutType()}></span>
      </div>
    );
  };

  type AppLocator = Locator<{
    header: HeaderLocator;
    label: LabelLocator;
    main: MainLocator;
    render: HeaderLocator;
  }>;

  const App = () => {
    const locator = createLocator<AppLocator>('app');

    const render = () => {
      return <Header {...locator.render()} />;
    };

    return (
      <div {...locator()}>
        Hello👋 world!
        <Header text="content" {...locator.header()} />
        <Main render={render} {...locator.main()} />
        <Label level="1" text="baz" {...locator.label({})} />
        <Footer />
      </div>
    );
  };

  const expectedDevelopmentApp = (
    <div data-testid="app">
      Hello👋 world!
      <h1 data-testid="app-header">
        Header
        <span data-testid="app-header-foo" data-test-level="3" data-test-type="text">
          content
        </span>
        <span data-testid="app-header-bar" data-test-level="3" data-test-type="text">
          foobar
        </span>
      </h1>
      <main data-testid="app-main">
        <h1 data-testid="app-main-header">
          Header
          <span data-testid="app-main-header-foo" data-test-level="3" data-test-type="image">
            foo
          </span>
          <span data-testid="app-main-header-bar" data-test-level="3" data-test-type="text">
            foobar
          </span>
        </h1>
        Some main text 📌
        <h1 data-testid="app-render">
          Header
          <span data-testid="app-render-foo" data-test-level="3" data-test-type="image">
            foo
          </span>
          <span data-testid="app-render-bar" data-test-level="3" data-test-type="text">
            foobar
          </span>
        </h1>
      </main>
      <span data-testid="app-label" data-test-level="1" data-test-type="image">
        baz
      </span>
      <div>
        <a>FAQ</a>
        <span></span>
      </div>
    </div>
  );

  const expectedProductionApp = (
    <div>
      Hello👋 world!
      <h1>
        Header
        <span>content</span>
        <span>foobar</span>
      </h1>
      <main>
        <h1>
          Header
          <span>foo</span>
          <span>foobar</span>
        </h1>
        Some main text 📌
        <h1>
          Header
          <span>foo</span>
          <span>foobar</span>
        </h1>
      </main>
      <span>baz</span>
      <div>
        <a>FAQ</a>
        <span></span>
      </div>
    </div>
  );

  const expectedApp =
    environment === 'development' ? expectedDevelopmentApp : expectedProductionApp;

  assert(
    JSON.stringify(<App />) === JSON.stringify(expectedApp),
    'with default options should render attributes correctly',
  );
};
