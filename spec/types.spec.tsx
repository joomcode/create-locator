import {
  createLocator,
  getLocatorParameters,
  type Locator,
  type Node,
  removeLocatorFromProperties,
} from '../index';

import {React} from './render.spec';

/**
 * Returns true if types are exactly equal and false otherwise.
 * IsEqual<{foo: string}, {foo: string}> = true.
 * IsEqual<{readonly foo: string}, {foo: string}> = false.
 */
type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

type L1 = Locator<{}>;
type N1 = Node<{}>;

declare const SYMBOL: unique symbol;

/**
 * Base checks of Locator and Node type arguments.
 */
export type Checks = [
  Locator<{}, {}>,
  Locator<{foo: L1}, {}>,
  Locator<{foo: {}}, {bar: 'baz'}>,
  Locator<{foo: {qux: 'quux'}}, {bar: 'baz'}>,
  Locator<{foo: {qux: 'quux'}; bar: L1}>,
  Locator<{foo: {qux: 'quux'}; bar: L1; baz: N1}>,
  // @ts-expect-error
  Locator<{}, {}, {}>,
  // @ts-expect-error
  Locator<L1>,
  // @ts-expect-error
  Locator<N1>,
  // @ts-expect-error
  Locator<{foo: 2}>,
  // @ts-expect-error
  Locator<{foo: undefined}>,
  // @ts-expect-error
  Locator<{foo: unknown}>,
  // @ts-expect-error
  Locator<{foo: object}>,
  // @ts-expect-error
  Locator<{}, {foo: 2}>,
  // @ts-expect-error
  Locator<{}, {foo: {}}>,
  // @ts-expect-error
  Locator<{foo: {bar: 3}}>,
  // @ts-expect-error
  Locator<{}, {foo: L1}>,

  Node<{}, {}>,
  Node<{foo: L1}, {}>,
  Node<{foo: {}}, {bar: 'baz'}>,
  Node<{foo: {qux: 'quux'}}, {bar: 'baz'}>,
  Node<{foo: {qux: 'quux'}; bar: L1}>,
  Node<{foo: {qux: 'quux'}; bar: L1; baz: N1}>,
  // @ts-expect-error
  Node<{}, {}, {}>,
  // @ts-expect-error
  Node<L1>,
  // @ts-expect-error
  Node<N1>,
  // @ts-expect-error
  Node<{foo: 2}>,
  // @ts-expect-error
  Node<{}, {foo: 2}>,
  // @ts-expect-error
  Node<{foo: undefined}>,
  // @ts-expect-error
  Node<{foo: unknown}>,
  // @ts-expect-error
  Node<{foo: object}>,
  // @ts-expect-error
  Node<{}, {foo: {}}>,
  // @ts-expect-error
  Node<{foo: {bar: 3}}>,
  // @ts-expect-error
  Node<{}, {foo: L1}>,
];

/**
 * Base tests of component, element and node locator.
 */
export type LabelLocator = Locator<{}, {level: string}>;
type LabelProperties = {level?: string; text: string} & LabelLocator;

const Label = ({level, text, ...rest}: LabelProperties) => {
  const locator = createLocator(rest);
  const levelString = String(level);

  // @ts-expect-error
  createLocator();

  // @ts-expect-error
  locator.bind();

  // @ts-expect-error
  (<span {...locator()}></span>) satisfies object;
  // @ts-expect-error
  (<span {...locator({level})}></span>) satisfies object;

  return <span {...locator({level: levelString})}></span>;
};

type MultiLocator = Locator<{label: LabelLocator} | {footer: {}}>;

const Multi = (properties: MultiLocator) => {
  const locator = createLocator(properties);

  return (
    <div {...locator()}>
      {/* @ts-expect-error */}
      <span {...locator.footer({level: 'foo'})}></span>
      <span {...locator.footer()}></span>
      {/* @ts-expect-error */}
      <span {...locator.label()}></span>
      <span {...locator.label({level: 'foo'})}></span>
      <Label text="baz" {...locator.label({level: 'foo'})} />
    </div>
  );
};

type HeaderLocator = Locator<{
  foo?: LabelLocator;
  bar: LabelLocator;
  bind: {};
  subtree: Node<{
    qux: {};
    quux: LabelLocator;
  }>;
  alsosubtree: Node<{
    qux: {};
    corge: Node<
      {
        garply: Node<{waldo: {}}>;
        grault: {foo: 'baz'} | {bar: 'qux'} | {[SYMBOL]: `s${string}`};
      },
      {bar: `foo${string}`}
    >;
  }>;
  multi: MultiLocator;
}>;

type HeaderProperties = {foo?: number} & HeaderLocator;

const Header = ({foo, ...rest}: HeaderProperties) => {
  const locator = createLocator(rest);

  // @ts-expect-error
  locator.foo = {} as unknown as any;

  // @ts-expect-error
  createLocator({}) satisfies object;

  locator.bind() satisfies object;

  // @ts-expect-error
  locator.bind.foo;

  return (
    <h1 {...locator()}>
      Header
      <Header {...locator()} />
      {/* @ts-expect-error */}
      <Label text="baz" {...locator()} />
      {/* @ts-expect-error */}
      <Label text="baz" {...locator} />
      {/* @ts-expect-error */}
      <Label text="baz" {...locator.bind()} />
      {/* @ts-expect-error */}
      <Label text="baz" {...locator.bind} />
      {/* @ts-expect-error */}
      <Label text="foo" {...locator.foo()} />
      {/* @ts-expect-error */}
      <Label text="foo" {...locator.foo({level2: 'baz'})} />
      <Label text="foo" {...locator.foo({level: 'baz'})} />
      {/* @ts-expect-error */}
      <Label text="bar" {...locator.bar({level: 2})} />
      <Label text="bar" {...locator.bar({level: 'quux'})} />
      {/* @ts-expect-error */}
      <Label text="bar" {...locator.subtree.qux()} />
      <Label text="bar" {...locator.subtree.quux({level: 'foo'})} />
      <span {...locator.bind()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsosubtree.corge()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsosubtree.corge({bar: 'baz'})}></span>
      <span {...locator.alsosubtree.corge({bar: 'foobar'})}></span>
      <span {...locator.alsosubtree.corge.garply.waldo()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsosubtree.corge.garply.waldo({})}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsosubtree.corge.grault()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsosubtree.corge.grault({[SYMBOL]: 'qux'})}></span>
      <span {...locator.alsosubtree.corge.grault({[SYMBOL]: 'sfoo'})}></span>
      <span {...locator.alsosubtree.corge.grault({foo: 'baz'})}></span>
      <span {...locator.alsosubtree.corge.grault({bar: 'qux'})}></span>
      <Multi {...locator.multi()} />
      {/* @ts-expect-error */}
      <span {...locator}></span>
      <div {...locator.foo({level: 'baz'})}></div>
      {/* @ts-expect-error */}
      <div {...locator.foo}></div>
    </h1>
  );
};

const Wrapper = (properties: HeaderLocator) => {
  const locator = createLocator(properties);

  return (
    <div>
      {/* @ts-expect-error */}
      <Header {...locator} />
      {/* @ts-expect-error */}
      <Header {...locator.foo} />
      {/* @ts-expect-error */}
      <Header {...locator.foo()} />
      <Header {...locator()} />
      {/* @ts-expect-error */}
      <div {...properties}></div>
    </div>
  );
};

type RenderedLocator = Locator<{
  header: HeaderLocator;
}>;

type MainLocator = Locator<
  {header: HeaderLocator; rendered: RenderedLocator; text: {value?: string}},
  {text: 'foo' | 'bar'}
>;
type MainProperties = {render: Function} & MainLocator;

declare const mainProperties: MainProperties;

export const mainLocator = createLocator(mainProperties);

const Main = ({render, ...rest}: MainProperties) => {
  const locator = createLocator(rest);

  locator.rendered satisfies Function;

  const rendered = render();

  // @ts-expect-error
  locator.header.foo;

  // @ts-expect-error
  locator();
  // @ts-expect-error
  locator({});
  // @ts-expect-error
  locator({text: 'baz'});

  const textValue: {readonly value: string} = {value: 'bar'};

  return (
    <main {...locator({text: 'foo'})}>
      <Header {...locator.header()} />
      Some main text
      {rendered}
      {/* @ts-expect-error */}
      <span {...locator.text()}></span>
      {/* @ts-expect-error */}
      <span {...locator.text({value: undefined})}></span>
      {/* @ts-expect-error */}
      <span {...locator.text({value: 2})}></span>
      <span {...locator.text(textValue)}></span>
      <span {...locator.text({})}></span>
      <span {...locator.text({value: 'bar'})}></span>
      {/* @ts-expect-error */}
      <span {...rest}></span>
    </main>
  );
};

const MainWrapper = (properties: MainLocator) => {
  const locator = createLocator(properties);

  return (
    <div>
      {/* @ts-expect-error */}
      <Main render={() => {}} />
      {/* @ts-expect-error */}
      <Main render={() => {}} {...locator} />
      {/* @ts-expect-error */}
      <Main render={() => {}} {...locator()} />
      {/* @ts-expect-error */}
      <Main render={() => {}} {...locator({text: 'bar'})} />
      <span {...locator({text: 'bar'})}></span>
    </div>
  );
};

/**
 * Base tests of root locator.
 */
type AppLocator = Locator<{
  header: HeaderLocator;
  readonly label: LabelLocator;
  main: MainLocator;
}>;

export const App = () => {
  const locator = createLocator<AppLocator>('app');

  // @ts-expect-error
  createLocator<AppLocator>();

  // @ts-expect-error
  createLocator<AppLocator>({});

  const render = () => {
    // @ts-expect-error
    createLocator<RenderedLocator>();

    // @ts-expect-error
    (<Header {...locator.header} />) satisfies object;

    // @ts-expect-error
    locator.header.foo;

    return <Header {...locator.header()} />;
  };

  // @ts-expect-error
  locator.foo;

  return (
    <div {...locator()}>
      Hello👋 world!
      {/* @ts-expect-error */}
      <Header {...locator.header} />
      <Header {...locator.header()} />
      {/* @ts-expect-error */}
      <Main render={render} {...locator.main()} />
      {/* @ts-expect-error */}
      <Main render={render} {...locator.main({textFoo: 'foo'})} />
      {/* @ts-expect-error */}
      <Main render={render} {...locator.main({text: 'baz'})} />
      <Main render={render} {...locator.main({text: 'foo'})} />
      <Label level="1" text="baz" {...locator.label({level: 'baz'})} />
      {/* @ts-expect-error */}
      <MainWrapper {...locator.main()} />
      <MainWrapper {...locator.main({text: 'foo'})} />
      {/* @ts-expect-error */}
      <Wrapper {...locator.header} />
      {/* @ts-expect-error */}
      <Wrapper {...locator()} />
      {/* @ts-expect-error */}
      <Wrapper {...locator} />
      <Wrapper {...locator.header()} />
    </div>
  );
};

/**
 * Base tests of root locator with attributes mapping.
 */
type Selector = {readonly textContent: Promise<string>};

export const rootLocator = createLocator<AppLocator, Selector>('app', {
  isProduction: true,
  mapAttributes() {
    return {} as Selector;
  },
  parameterAttributePrefix: 'data-test-',
  pathAttribute: 'data-testid',
  pathSeparator: '-',
});

// @ts-expect-error
createLocator<AppLocator, Selector>('app');
// @ts-expect-error
createLocator<AppLocator, Selector>('app', {});
// @ts-expect-error
createLocator<AppLocator, Selector>('app', {mapAttributes() {}});

createLocator<AppLocator, Selector>('app', {
  mapAttributes(attributes: {}) {
    return attributes as Selector;
  },
});

rootLocator() satisfies Selector;
rootLocator.main({text: 'foo'}) satisfies Selector;
rootLocator.main.header.alsosubtree.corge({bar: 'foo'}) satisfies Selector;
rootLocator.main.header.alsosubtree.corge.garply() satisfies Selector;

// @ts-expect-error
locator.main.header.header;

// @ts-expect-error
locator.main.header.alsosubtree.corge({bar: 'baz'});

/**
 * Base tests of getLocatorParameters.
 */
type BannerLocator = Locator<{text: {}}, {id: `id${string}`}>;

export const Banner = (properties: BannerLocator) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  return (
    <>
      {/* @ts-expect-error */}
      <div {...locator()}></div>
      {/* @ts-expect-error */}
      <div {...locator({id: 213})}></div>
      {/* @ts-expect-error */}
      <div {...locator({id: '213'})}></div>
      <div {...locator(locatorParameters)}></div>
      <div {...locator({id: 'id213'})}>
        <span {...locator.text()}></span>
      </div>
    </>
  );
};

export const RenderedBanner = (properties: RenderedLocator) => {
  const locator = createLocator(properties);
  // @ts-expect-error
  const locatorParameters = getLocatorParameters(properties);

  return (
    <>
      {/* @ts-expect-error */}
      <div {...locator(locatorParameters)}></div>
      <div {...locator()}></div>
    </>
  );
};

/**
 * Tests of pageObject with locator.
 */
type HeaderPageObjectLocator = typeof rootLocator.header;

false satisfies IsEqual<HeaderPageObjectLocator, HeaderLocator>;

class HeaderPageObject {
  constructor(public locator: HeaderPageObjectLocator) {}

  async assertLanguage() {
    // @ts-expect-error
    this.locator.foo({level: 1});
    // @ts-expect-error
    this.locator.foo();
    // @ts-expect-error
    this.locator.multi.footer({});
    // @ts-expect-error
    this.locator.baz;

    (await this.locator.foo({level: '1'}).textContent) satisfies string;
    (await this.locator.multi.footer().textContent) satisfies string;
  }
}

// @ts-expect-error
new HeaderPageObject(rootLocator);
// @ts-expect-error
new HeaderPageObject({});
// @ts-expect-error
new HeaderPageObject(rootLocator.main.header.subtree);
// @ts-expect-error
new HeaderPageObject(rootLocator.label);

new HeaderPageObject(rootLocator.header);
new HeaderPageObject(rootLocator.main.header);

/**
 * Tests of explicitly passing additional locator to component in a separate property.
 */
type MainPageLocator = Locator<{
  // header: HeaderLocator;
  content: {};
}>;

type MainPageProperties = {headerLocator: HeaderLocator} & MainPageLocator;

const MainPage = ({headerLocator, ...rest}: MainPageProperties) => {
  const locator = createLocator(rest);

  return (
    <div {...locator()}>
      {/* @ts-expect-error */}
      <Header />
      {/* @ts-expect-error */}
      <Header {...locator.header()} />
      <Header {...headerLocator} />
      <div {...locator.content()}></div>
    </div>
  );
};

type PageWrapperLocator = Locator<{
  header: HeaderLocator;
  main: MainPageLocator;
}>;

export const PageWrapper = (properties: PageWrapperLocator) => {
  const locator = createLocator(properties);

  return (
    <div {...locator()}>
      {/* @ts-expect-error */}
      <MainPage {...locator.main()} />
      <MainPage {...locator.main()} headerLocator={locator.header()} />
    </div>
  );
};

/**
 * Tests of properties modifiers and symbol properties in locator description.
 */
type RenderedLocatorWithOptional = Locator<{
  header?: HeaderLocator;
}>;

true satisfies IsEqual<RenderedLocator, RenderedLocatorWithOptional>;

type RenderedLocatorWithReadonly = Locator<{
  readonly header: HeaderLocator;
}>;

true satisfies IsEqual<RenderedLocator, RenderedLocatorWithReadonly>;

type RenderedNode = Node<{
  header: HeaderLocator;
}>;

type RenderedReadonlyOptionalNode = Node<{
  readonly header?: HeaderLocator;
}>;

true satisfies IsEqual<RenderedNode, RenderedReadonlyOptionalNode>;

type RenderedLocatorWithSymbolProperty = Locator<{
  header: HeaderLocator;
  [SYMBOL]: {foo: 'bar'};
}>;

true satisfies IsEqual<RenderedLocator, RenderedLocatorWithSymbolProperty>;

type RenderedLocatorWithSymbolInParameters = Locator<{header: HeaderLocator}, {[SYMBOL]: 'baz'}>;

false satisfies IsEqual<RenderedLocator, RenderedLocatorWithSymbolInParameters>;

type RenderedLocatorWithOptionalParameters = Locator<{header: HeaderLocator}, {foo?: string}>;

type LinkProperties = {link: string} & Locator<{link: RenderedLocatorWithOptionalParameters}>;

export const Link = (properties: LinkProperties) => {
  const locator = createLocator(properties);

  return (
    <span {...locator()}>
      {/* @ts-expect-error */}
      <a {...locator.link()}>Link</a>
      <a {...locator.link({})}>Link</a>
    </span>
  );
};

type RenderedLocatorWithOtherOptionalParameters = Locator<
  {header: HeaderLocator},
  {foo?: `foo${string}`}
>;

const RenderedWithOptionalParameters = (properties: RenderedLocatorWithOptionalParameters) => {
  const locator = createLocator(properties);

  return <div {...locator({})}></div>;
};

const RenderedWithOtherOptionalParameters = (
  properties: RenderedLocatorWithOtherOptionalParameters,
) => {
  const locator = createLocator(properties);

  return <div {...locator({})}></div>;
};

type PanelLocator = Locator<{
  rendered: RenderedLocatorWithOptionalParameters;
  otherRendered: RenderedLocatorWithOtherOptionalParameters;
}>;

export const Panel = (properties: PanelLocator) => {
  const locator = createLocator(properties);

  return (
    <>
      {/* @ts-expect-error */}
      <RenderedWithOptionalParameters {...locator.otherRendered({})} />
      {/* @ts-expect-error */}
      <RenderedWithOtherOptionalParameters {...locator.rendered({})} />

      <RenderedWithOptionalParameters {...locator.rendered({})} />
      <RenderedWithOtherOptionalParameters {...locator.otherRendered({})} />
    </>
  );
};

/**
 * Base tests of removeLocatorFromProperties.
 */
type ButtonLocator = Locator<{}, {type: string}>;
type ButtonProperties = ButtonLocator & {children: unknown};

export const Button = ({children, ...restProps}: ButtonProperties) => {
  const locator = createLocator(restProps);
  const restPropertiesWithoutLocator = removeLocatorFromProperties(restProps);

  // @ts-expect-error
  createLocator(restPropertiesWithoutLocator);

  return (
    <button {...locator({type: 'foo'})}>
      {/* @ts-expect-error */}
      <label {...restProps}>{children}</label>
      <label>{children}</label>
      <label {...restPropertiesWithoutLocator}>{children}</label>
    </button>
  );
};
