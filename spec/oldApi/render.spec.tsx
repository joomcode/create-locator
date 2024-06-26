import type {Locator, Mark, Node} from 'create-locator';

import {assert, RuntimeReact as React, type Test} from './utils.js';

export const testRender: Test = (
  [
    originalCreateLocator,
    originalCreateRootLocator,
    getLocatorParameters,
    removeMarkFromProperties,
  ],
  environment,
) => {
  const locatorsSet = new Set();

  const createLocator = ((...args: unknown[]) => {
    // @ts-expect-error
    const locator = originalCreateLocator(...args);

    locatorsSet.add(locator);

    return locator;
  }) as typeof originalCreateLocator;

  const createRootLocator = ((...args: unknown[]) => {
    // @ts-expect-error
    const locator = originalCreateRootLocator(...args);

    locatorsSet.add(locator);

    return locator;
  }) as typeof originalCreateRootLocator;

  type FooLocator = Locator<{fooLeaf: {quux: string}}, {corge: string}, 'sameParameters'>;
  type NodeLocator = Node<{subLeaf: {baz: string}}, {qux: string}>;

  type RootLocator = Locator<
    {component: FooLocator; leaf: {foo: string}; node: NodeLocator},
    {bar: string}
  >;

  const SYMBOL = Symbol();

  const rootLocator = createRootLocator<RootLocator>('root', {
    parameterAttributePrefix: 'data-prefix-',
    pathAttribute: 'data-path',
    pathSeparator: '.',
  });

  const Foo = (properties: Mark<FooLocator>) => {
    const locator = createLocator(properties);
    const locatorParameters = getLocatorParameters(properties);

    locatorParameters.corge += '-grault';

    // @ts-expect-error
    locatorParameters[SYMBOL] = 'baz';

    return (
      <div {...locator(locatorParameters)}>
        {/* @ts-expect-error */}
        <span {...locator.fooLeaf({quux: 'garply', [SYMBOL]: 'bar'})}></span>
      </div>
    );
  };

  const Root = () => (
    <div {...rootLocator({bar: 'waldo'})}>
      <Foo {...rootLocator.component({corge: 'fred'})} />
      <span {...rootLocator.leaf({foo: 'plugh'})}>📌</span>
      <div {...rootLocator.node({qux: 'xyzzy'})}>
        <span {...rootLocator.node.subLeaf({baz: 'thud'})}></span>
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
        <span data-path="root.node.subLeaf" data-prefix-baz="thud"></span>
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

  type LabelLocator = Locator<{}, {level?: string; type?: ElementType}, 'sameParameters'>;
  type LabelProperties = {children?: object[]; level?: string; text: string} & Mark<LabelLocator>;

  const Label = ({level = '3', text, ...rest}: LabelProperties) => {
    const locator = createLocator(rest);
    const locatorParameters = getLocatorParameters(rest);
    const locatorParametersWithDefaults = {
      level,
      type: (text.length > 5 ? 'text' : 'image') as ElementType,
      ...locatorParameters,
    };
    const {children, ...restPropertiesWithoutLocator} = removeMarkFromProperties(rest);

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
  type HeaderProperties = {text?: string} & Mark<HeaderLocator>;

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
  type MainProperties = {render: Function} & Mark<MainLocator>;

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

  type FooterLocator = Locator<{faq: {}}, {link: string}, 'sameParameters'>;
  type FooterProperties = Partial<Mark<FooterLocator>>;

  const Footer = (properties: FooterProperties) => {
    const locator = createLocator(properties);
    const propertiesWithoutLocator = removeMarkFromProperties(properties);
    // @ts-expect-error
    const locatorWithoutType = createLocator(propertiesWithoutLocator);

    const parameters = getLocatorParameters(properties);
    // @ts-expect-error
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
        {/* @ts-expect-error */}
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

  const appLocator = createRootLocator<AppLocator>('app');

  const App = () => {
    const render = () => {
      return <Header {...appLocator.render()} />;
    };

    return (
      <div {...appLocator()}>
        Hello👋 world!
        <Header text="content" {...appLocator.header()} />
        <Main render={render} {...appLocator.main()} />
        <Label level="1" text="baz" {...appLocator.label({})} />
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

  const numberOfLocators = locatorsSet.size;

  <App />;
  <Root />;

  assert(numberOfLocators === locatorsSet.size, 'locator tree is cached');
};
