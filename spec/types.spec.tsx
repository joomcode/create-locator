import {
  createLocator,
  type CreateLocator,
  getLocatorParameters,
  type GetLocatorParameters,
  type Locator,
  type Mark,
  type Node,
  type PropertiesWithMark,
  type PropertiesWithMarkWithParameters,
  removeMarkFromProperties,
  type RemoveMarkFromProperties,
} from '../index';

import type {AriaInvalidValue} from '../types';

import {type IsEqual, React} from './utils';

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
  Locator<{foo: {}}, object>,
  // @ts-expect-error
  Locator<{}, {foo: 2}>,
  // @ts-expect-error
  Locator<{}, {foo: {}}>,
  // @ts-expect-error
  Locator<{foo: {bar: 3}}>,
  // @ts-expect-error
  Locator<{}, {foo: L1}>,
  // @ts-expect-error
  Locator<Mark<Locator<{}>>>,

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
  Node<{foo: {}}, object>,
  // @ts-expect-error
  Node<{}, {foo: {}}>,
  // @ts-expect-error
  Node<{foo: {bar: 3}}>,
  // @ts-expect-error
  Node<{}, {foo: L1}>,
  // @ts-expect-error
  Node<Mark<Locator<{}>>>,
];

// @ts-expect-error
const locatorForEmptyProperties = createLocator({});

true satisfies IsEqual<typeof locatorForEmptyProperties, unknown>;

const propertiesWithAriaInvalid = {} as {'aria-invalid': AriaInvalidValue};

/**
 * Base tests of component, element and node locator.
 */
export type LabelLocator = Locator<{}, {level: string}>;
export type LabelProperties = {level?: string; text: string} & Mark<LabelLocator>;

const Label = ({level, text, ...rest}: LabelProperties) => {
  const locator = createLocator(rest);

  true satisfies IsEqual<typeof locator, LabelLocator>;
  true satisfies IsEqual<CreateLocator<LabelProperties>, LabelLocator>;

  const levelString = String(level);

  // @ts-expect-error
  const l1 = createLocator();

  // @ts-expect-error
  const l2 = createLocator({});

  // @ts-expect-error
  const l3 = createLocator({} as object);

  // @ts-expect-error
  const l4 = createLocator({} as {foo: string});

  true satisfies IsEqual<
    [unknown, unknown, unknown, unknown],
    [typeof l1, typeof l2, typeof l3, typeof l4]
  >;

  // @ts-expect-error
  locator.bind();

  // @ts-expect-error
  (<span {...locator()}></span>) satisfies object;
  // @ts-expect-error
  (<span {...locator({level})}></span>) satisfies object;

  return <span {...locator({level: levelString})}></span>;
};

type MultiLocator = Locator<{label: LabelLocator} | {footer: {}}>;

const Multi = (properties: Mark<MultiLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, MultiLocator>;
  true satisfies IsEqual<CreateLocator<Mark<MultiLocator>>, MultiLocator>;

  // @ts-expect-error
  locator.label = {} as typeof locator.label;

  return (
    <div {...locator()}>
      {/* @ts-expect-error */}
      <span {...locator.footer({level: 'foo'})}></span>
      <span {...locator.footer()}></span>
      {/* @ts-expect-error */}
      <span {...locator.label()}></span>
      <span {...locator.label({level: 'foo'})}></span>
      <Label text="baz" {...locator.label({level: 'foo'})} />
      <Label text="bar" {...locator.label({level: 'foo'})} {...propertiesWithAriaInvalid} />
    </div>
  );
};

type HeaderLocator = Locator<{
  foo?: LabelLocator;
  bar: LabelLocator;
  apply: {};
  bind: {};
  call: {};
  caller: {};
  constructor: {};
  hasOwnProperty: {};
  isPrototypeOf: {};
  length: {};
  name: {};
  propertyIsEnumerable: {};
  toLocaleString: {};
  toString: {foo: ''};
  valueOf: {};
  subtree: Node<{
    qux: {};
    quux: LabelLocator;
    apply: LabelLocator;
    bind: LabelLocator;
    call: LabelLocator;
    caller: LabelLocator;
    constructor: LabelLocator;
    hasOwnProperty: LabelLocator;
    isPrototypeOf: LabelLocator;
    length: LabelLocator;
    name: LabelLocator;
    propertyIsEnumerable: LabelLocator;
    toLocaleString: LabelLocator;
    toString: LabelLocator;
    valueOf: LabelLocator;
  }>;
  alsoSubtree: Node<{
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

type HeaderProperties = {foo?: number} & Mark<HeaderLocator>;

const Header = ({foo, ...rest}: HeaderProperties) => {
  const locator = createLocator(rest);

  true satisfies IsEqual<typeof locator, HeaderLocator>;
  true satisfies IsEqual<CreateLocator<HeaderProperties>, HeaderLocator>;

  // @ts-expect-error
  locator.foo = {} as unknown as any;

  // TODO: also support keys `arguments`, `caller` and `prototype`
  locator.apply() satisfies object;
  locator.subtree.apply({level: ''}) satisfies object;
  locator.bind() satisfies object;
  locator.subtree.bind({level: ''}) satisfies object;
  locator.call() satisfies object;
  locator.subtree.call({level: ''}) satisfies object;
  locator.caller() satisfies object;
  locator.subtree.caller({level: ''}) satisfies object;
  locator.constructor() satisfies object;
  locator.subtree.constructor({level: ''}) satisfies object;
  locator.hasOwnProperty() satisfies object;
  locator.subtree.hasOwnProperty({level: ''}) satisfies object;
  locator.isPrototypeOf() satisfies object;
  locator.subtree.isPrototypeOf({level: ''}) satisfies object;
  locator.length() satisfies object;
  locator.subtree.length({level: ''}) satisfies object;
  locator.name() satisfies object;
  locator.subtree.name({level: ''}) satisfies object;
  locator.propertyIsEnumerable() satisfies object;
  locator.subtree.propertyIsEnumerable({level: ''}) satisfies object;
  locator.toString({foo: ''}) satisfies object;
  locator.subtree.toLocaleString({level: ''}) satisfies object;
  locator.subtree.toString({level: ''}) satisfies object;
  // TODO: should be an object
  locator.toLocaleString() satisfies string;
  // TODO: should be an object
  locator.toString() satisfies string;
  locator.valueOf() satisfies object;
  locator.subtree.valueOf({level: ''}) satisfies object;

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
      <span {...locator.alsoSubtree.corge()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsoSubtree.corge({bar: 'baz'})}></span>
      <span {...locator.alsoSubtree.corge({bar: 'foobar'})}></span>
      <span {...locator.alsoSubtree.corge.garply.waldo()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsoSubtree.corge.garply.waldo({})}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsoSubtree.corge.grault()}></span>
      {/* @ts-expect-error */}
      <span {...locator.alsoSubtree.corge.grault({[SYMBOL]: 'qux'})}></span>
      <span {...locator.alsoSubtree.corge.grault({[SYMBOL]: 'sfoo'})}></span>
      <span {...locator.alsoSubtree.corge.grault({foo: 'baz'})}></span>
      <span {...locator.alsoSubtree.corge.grault({bar: 'qux'})}></span>
      <Multi {...locator.multi()} />
      {/* @ts-expect-error */}
      <span {...locator}></span>
      <div {...locator.foo({level: 'baz'})}></div>
      {/* @ts-expect-error */}
      <div {...locator.foo}></div>
    </h1>
  );
};

const Wrapper = (properties: Mark<HeaderLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, HeaderLocator>;
  true satisfies IsEqual<CreateLocator<Mark<HeaderLocator>>, HeaderLocator>;

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
type MainProperties = {render: Function} & Mark<MainLocator>;

declare const mainProperties: MainProperties;

export const mainLocator = createLocator(mainProperties);

true satisfies IsEqual<typeof mainLocator, MainLocator>;
true satisfies IsEqual<CreateLocator<MainProperties>, MainLocator>;

const Main = ({render, ...rest}: MainProperties) => {
  const locator = createLocator(rest);

  true satisfies IsEqual<typeof locator, MainLocator>;

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

const MainWrapper = (properties: Mark<MainLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, MainLocator>;
  true satisfies IsEqual<CreateLocator<Mark<MainLocator>>, MainLocator>;

  true satisfies IsEqual<typeof locator, CreateLocator<Mark<MainLocator>>>;
  true satisfies IsEqual<typeof locator, CreateLocator<MainProperties>>;
  true satisfies IsEqual<typeof locator, CreateLocator<Partial<Mark<MainLocator>>>>;
  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  return (
    <div>
      {/* @ts-expect-error */}
      <Main render={() => {}} />
      {/* @ts-expect-error */}
      <Main render={() => {}} {...locator} />
      {/* @ts-expect-error */}
      <Main render={() => {}} {...locator()} />
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

export const appLocator = createLocator<AppLocator>('app');

true satisfies IsEqual<typeof appLocator, AppLocator>;
true satisfies IsEqual<CreateLocator<Mark<AppLocator>>, AppLocator>;

export const App = () => {
  const locatorByProperties = createLocator({} as Mark<AppLocator>);

  true satisfies IsEqual<AppLocator, typeof locatorByProperties>;
  true satisfies IsEqual<typeof appLocator, typeof locatorByProperties>;

  // @ts-expect-error
  const locatorWithPartial = createLocator<Partial<AppLocator>>('app');

  true satisfies IsEqual<typeof locatorWithPartial, unknown>;

  // @ts-expect-error
  createLocator<AppLocator>();

  // @ts-expect-error
  createLocator<AppLocator>({});

  const render = () => {
    // @ts-expect-error
    const renderedLocator = createLocator<RenderedLocator>();

    true satisfies IsEqual<typeof renderedLocator, RenderedLocator>;
    true satisfies IsEqual<CreateLocator<Mark<RenderedLocator>>, RenderedLocator>;

    // @ts-expect-error
    (<Header {...appLocator.header} />) satisfies object;

    // @ts-expect-error
    appLocator.header.foo;

    return <Header {...appLocator.header()} />;
  };

  // @ts-expect-error
  appLocator.foo;

  return (
    <div {...appLocator()}>
      Hello👋 world!
      {/* @ts-expect-error */}
      <Header {...appLocator.header} />
      <Header {...appLocator.header()} />
      {/* @ts-expect-error */}
      <Main render={render} {...appLocator.main()} />
      {/* @ts-expect-error */}
      <Main render={render} {...appLocator.main({textFoo: 'foo'})} />
      {/* @ts-expect-error */}
      <Main render={render} {...appLocator.main({text: 'baz'})} />
      <Main render={render} {...appLocator.main({text: 'foo'})} />
      <Label level="1" text="baz" {...appLocator.label({level: 'baz'})} />
      {/* @ts-expect-error */}
      <MainWrapper {...appLocator.main()} />
      <MainWrapper {...appLocator.main({text: 'foo'})} />
      {/* @ts-expect-error */}
      <Wrapper {...appLocator.header} />
      {/* @ts-expect-error */}
      <Wrapper {...appLocator()} />
      {/* @ts-expect-error */}
      <Wrapper {...appLocator} />
      <Wrapper {...appLocator.header()} />
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

rootLocator.header.length();
rootLocator.header.name();

false satisfies IsEqual<typeof rootLocator, AppLocator>;
true satisfies IsEqual<typeof rootLocator, CreateLocator<AppLocator, Selector>>;

// @ts-expect-error
const rootLocator1 = createLocator<AppLocator, Selector>('app');
// @ts-expect-error
const rootLocator2 = createLocator<AppLocator, Selector>('app', {});
// @ts-expect-error
const rootLocator3 = createLocator<AppLocator, Selector>('app', {mapAttributes() {}});

true satisfies IsEqual<
  [AppLocator, AppLocator, AppLocator],
  [typeof rootLocator1, typeof rootLocator2, typeof rootLocator3]
>;

declare const mapAttributesToNever: () => never;

const mappedToNeverLocator = createLocator<AppLocator, never>('app', {
  mapAttributes: mapAttributesToNever,
});

true satisfies IsEqual<typeof mappedToNeverLocator, CreateLocator<AppLocator, never>>;

mappedToNeverLocator.header() satisfies never;

const mapAttributes = (attributes: {}) => attributes as Selector;

// @ts-expect-error
const appLocator1 = createLocator<Partial<AppLocator>, Selector>('app', {mapAttributes});

const appLocator2 = createLocator<AppLocator, Selector>('app', {mapAttributes});

true satisfies IsEqual<typeof appLocator1, unknown>;

true satisfies IsEqual<typeof appLocator2, CreateLocator<AppLocator, Selector>>;

rootLocator() satisfies Selector;
rootLocator.main({text: 'foo'}) satisfies Selector;
rootLocator.main.header.alsoSubtree.corge({bar: 'foo'}) satisfies Selector;
rootLocator.main.header.alsoSubtree.corge.garply() satisfies Selector;

// @ts-expect-error
locator.main.header.header;

// @ts-expect-error
locator.main.header.alsoSubtree.corge({bar: 'baz'});

/**
 * Base tests of CreateLocator.
 */
true satisfies IsEqual<AppLocator, CreateLocator<AppLocator>>;

export type RootLocatorVariable = CreateLocator<AppLocator, Selector>;

export type OptionalLocator = CreateLocator<Partial<Mark<AppLocator>>>;

// @ts-expect-error
export type ConvertTypes<SomeLocator> = CreateLocator<SomeLocator>;

true satisfies IsEqual<typeof appLocator, AppLocator>;
true satisfies IsEqual<typeof rootLocator, RootLocatorVariable>;

true satisfies IsEqual<
  [unknown, unknown, unknown, unknown, unknown],
  [
    // @ts-expect-error
    CreateLocator<Partial<AppLocator>, Selector>,
    // @ts-expect-error
    CreateLocator<Partial<AppLocator>>,
    CreateLocator<RemoveMarkFromProperties<Mark<AppLocator>>>,
    CreateLocator<{}>,
    CreateLocator<object>,
  ]
>;

declare const mappedToBigint: CreateLocator<Locator<{foo: {}}>, bigint>;

mappedToBigint.foo() satisfies bigint;

declare const mappedToNever: CreateLocator<Locator<{foo: {}}>, never>;

mappedToNever.foo() satisfies never;

declare const mappedWithLocatorToNever: CreateLocator<Locator<{foo: Locator<{}>}>, never>;

mappedWithLocatorToNever.foo() satisfies never;

true satisfies IsEqual<typeof appLocator, CreateLocator<AppLocator>>;

/**
 * Base tests of getLocatorParameters.
 */
type BannerParameters = {id: `id${string}`; [SYMBOL]?: number};
type BannerLocator = Locator<{text: {}}, BannerParameters>;

export const Banner = (properties: Mark<BannerLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, BannerLocator>;
  true satisfies IsEqual<CreateLocator<Mark<BannerLocator>>, BannerLocator>;

  const locatorParameters = getLocatorParameters(properties);

  true satisfies IsEqual<typeof locatorParameters, BannerParameters>;
  true satisfies IsEqual<typeof locatorParameters, GetLocatorParameters<typeof properties>>;

  type LocatorWithEmptyParameters = Locator<{foo: {}}, {}>;

  // @ts-expect-error
  type EmptyParameters = GetLocatorParameters<LocatorWithEmptyParameters>;

  true satisfies IsEqual<EmptyParameters, unknown>;

  const propertiesWithEmptyParameters = {} as Mark<LocatorWithEmptyParameters>;
  const locatorWithEmptyParameters = createLocator(propertiesWithEmptyParameters);

  true satisfies IsEqual<typeof locatorWithEmptyParameters, LocatorWithEmptyParameters>;
  true satisfies IsEqual<
    CreateLocator<Mark<LocatorWithEmptyParameters>>,
    LocatorWithEmptyParameters
  >;

  const propertiesWithSymbolParameters = {} as Mark<Locator<{}, {readonly [SYMBOL]: 'foo'}>>;
  const symbolParameters = getLocatorParameters(propertiesWithSymbolParameters);

  true satisfies IsEqual<typeof symbolParameters, {readonly [SYMBOL]: 'foo'}>;

  // @ts-expect-error
  getLocatorParameters(propertiesWithEmptyParameters);

  // @ts-expect-error
  getLocatorParameters();

  // @ts-expect-error
  getLocatorParameters({foo: 2});

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
      {/* @ts-expect-error */}
      <div {...locator({id: 'id3', [SYMBOL]: '6'})}></div>
      <div {...locator({id: 'id3', [SYMBOL]: 5})}></div>
    </>
  );
};

export const RenderedBanner = (properties: Mark<RenderedLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, RenderedLocator>;

  // @ts-expect-error
  const locatorParameters = getLocatorParameters(properties);

  // @ts-expect-error
  Object satisfies GetLocatorParameters<typeof properties>;

  const optionalProperties = {} as Partial<Mark<RenderedLocator>>;

  // @ts-expect-error
  getLocatorParameters(optionalProperties);

  return (
    <>
      {/* @ts-expect-error */}
      <div {...locator(locatorParameters)}></div>
      <div {...locator()}></div>
    </>
  );
};

/**
 * Base tests of GetLocatorParameters.
 */
true satisfies IsEqual<BannerParameters, GetLocatorParameters<Mark<BannerLocator>>>;
true satisfies IsEqual<BannerParameters, GetLocatorParameters<Partial<Mark<BannerLocator>>>>;

true satisfies IsEqual<GetLocatorParameters<Mark<Locator<{}, {foo: string}>>>, {foo: string}>;

true satisfies IsEqual<
  GetLocatorParameters<Mark<Locator<{}, {[SYMBOL]: string}>>>,
  {[SYMBOL]: string}
>;

// @ts-expect-error
Object satisfies GetLocatorParameters<{foo: ''}>;

/**
 * Base tests of Mark.
 */
type Properties = Mark<Locator<{foo: {}}>>;

true satisfies IsEqual<CreateLocator<Properties>, Locator<{foo: {}}>>;

true satisfies Mark<Locator<{}>> extends object ? true : false;
true satisfies Mark<Locator<{}, {foo: ''}>> extends object ? true : false;

type AppProperties = {[SYMBOL]: number; baz: string} & Mark<AppLocator>;

true satisfies IsEqual<AppLocator, CreateLocator<AppProperties>>;

const appProperties = {} as AppProperties;

const alsoAppLocator = createLocator(appProperties);

true satisfies IsEqual<typeof alsoAppLocator, AppLocator>;
true satisfies IsEqual<CreateLocator<AppProperties>, AppLocator>;

type FooLocator = Locator<{foo: AppLocator; node: Node<{baz: {}}>}, {bar: string}>;

true satisfies IsEqual<FooLocator, CreateLocator<Mark<FooLocator>>>;

true satisfies IsEqual<
  [unknown, unknown, unknown, unknown, unknown, unknown, unknown],
  [
    // @ts-expect-error
    Mark<Partial<Locator<{foo: {}}>>>,
    // @ts-expect-error
    Mark<Partial<Locator<{foo: {}}, {bar: string}>>>,
    // @ts-expect-error
    Mark<{}>,
    // @ts-expect-error
    Mark<object>,
    // @ts-expect-error
    Mark<{foo: string}>,
    // @ts-expect-error
    Mark<Mark<AppLocator>>,
    // @ts-expect-error
    Mark<Node<{}>>,
  ]
>;

/**
 * Base tests of PropertiesWithMark.
 */
const labelProperties = {} as LabelProperties;

// @ts-expect-error
({}) satisfies PropertiesWithMark;

labelProperties satisfies PropertiesWithMark;
labelProperties satisfies Partial<PropertiesWithMark>;

true satisfies ButtonProperties extends PropertiesWithMark ? true : false;
true satisfies ButtonProperties extends Partial<PropertiesWithMark> ? true : false;

const optionalPanelLocatorProperties = {} as OptionalPanelProperties;

optionalPanelLocatorProperties satisfies Partial<PropertiesWithMark>;

false satisfies OptionalPanelProperties extends PropertiesWithMark ? true : false;
true satisfies OptionalPanelProperties extends Partial<PropertiesWithMark> ? true : false;

const multiLocatorProperties = {} as Mark<MultiLocator>;

multiLocatorProperties satisfies PropertiesWithMark;
multiLocatorProperties satisfies Partial<PropertiesWithMark>;

true satisfies Mark<MultiLocator> extends PropertiesWithMark ? true : false;
true satisfies Mark<MultiLocator> extends Partial<PropertiesWithMark> ? true : false;

false satisfies Partial<Mark<MultiLocator>> extends PropertiesWithMark ? true : false;
true satisfies Partial<Mark<MultiLocator>> extends Partial<PropertiesWithMark> ? true : false;

export type WrapCreateLocator<Properties extends PropertiesWithMark> = CreateLocator<Properties>;
export type WrapGetLocatorParameters<Properties extends PropertiesWithMark> =
  // @ts-expect-error
  GetLocatorParameters<Properties>;
export type WrapRemoveMarkFromProperties<Properties extends PropertiesWithMark> =
  RemoveMarkFromProperties<Properties>;

/**
 * Base tests of PropertiesWithMarkWithParameters.
 */
// @ts-expect-error
({}) satisfies PropertiesWithMarkWithParameters;

labelProperties satisfies PropertiesWithMarkWithParameters;
labelProperties satisfies Partial<PropertiesWithMarkWithParameters>;

true satisfies ButtonProperties extends PropertiesWithMarkWithParameters ? true : false;
true satisfies ButtonProperties extends Partial<PropertiesWithMarkWithParameters> ? true : false;

optionalPanelLocatorProperties satisfies Partial<PropertiesWithMarkWithParameters>;

false satisfies OptionalPanelProperties extends PropertiesWithMarkWithParameters ? true : false;
true satisfies OptionalPanelProperties extends Partial<PropertiesWithMarkWithParameters>
  ? true
  : false;

// @ts-expect-error
multiLocatorProperties satisfies PropertiesWithMarkWithParameters;
// @ts-expect-error
multiLocatorProperties satisfies Partial<PropertiesWithMarkWithParameters>;

false satisfies MultiLocator extends PropertiesWithMarkWithParameters ? true : false;
false satisfies MultiLocator extends Partial<PropertiesWithMarkWithParameters> ? true : false;

false satisfies Partial<MultiLocator> extends PropertiesWithMarkWithParameters ? true : false;
false satisfies Partial<MultiLocator> extends Partial<PropertiesWithMarkWithParameters>
  ? true
  : false;

export type WrapCreateLocatorWithParameters<Properties extends PropertiesWithMarkWithParameters> =
  CreateLocator<Properties>;

export type WrapGetLocatorParametersWithParameters<
  Properties extends PropertiesWithMarkWithParameters,
> = GetLocatorParameters<Properties>;

export type WrapRemoveMarkFromPropertiesWithParameters<
  Properties extends PropertiesWithMarkWithParameters,
> = RemoveMarkFromProperties<Properties>;

/**
 * Base tests of removeMarkFromProperties.
 */
type ButtonLocator = Locator<{bar: {}}, {type: string}>;
type ButtonOwnProperties = {[SYMBOL]: bigint; foo?: number; bar: boolean};
type ButtonProperties = {children: unknown} & ButtonOwnProperties & Mark<ButtonLocator>;
type ButtonOwnPropertiesWithReadonly = {foo?: 'baz'; readonly bar: boolean};

export const Button = ({children, ...restProps}: ButtonProperties) => {
  const locator = createLocator(restProps);

  true satisfies IsEqual<typeof locator, ButtonLocator>;
  true satisfies IsEqual<CreateLocator<ButtonProperties>, ButtonLocator>;

  const restPropertiesWithoutLocator = removeMarkFromProperties(restProps);

  true satisfies IsEqual<ButtonOwnProperties, typeof restPropertiesWithoutLocator>;

  const properties = {} as Mark<ButtonLocator> & ButtonOwnPropertiesWithReadonly;
  const propertiesWithoutLocator = removeMarkFromProperties(properties);

  true satisfies IsEqual<
    RemoveMarkFromProperties<typeof properties>,
    typeof propertiesWithoutLocator
  >;
  true satisfies IsEqual<ButtonOwnPropertiesWithReadonly, typeof propertiesWithoutLocator>;

  const locatorWithFullProperties = createLocator(properties);

  true satisfies IsEqual<typeof locatorWithFullProperties, ButtonLocator>;

  // @ts-expect-error
  const locatorByPropertiesWithoutLocator = createLocator(propertiesWithoutLocator);

  true satisfies IsEqual<typeof locatorByPropertiesWithoutLocator, unknown>;

  // @ts-expect-error
  type LocatorWithoutLocator = CreateLocator<typeof propertiesWithoutLocator>;

  true satisfies IsEqual<LocatorWithoutLocator, unknown>;

  true satisfies IsEqual<ButtonOwnPropertiesWithReadonly, typeof propertiesWithoutLocator>;

  // @ts-expect-error
  const locatorWithoutType = createLocator(restPropertiesWithoutLocator);

  // @ts-expect-error
  type LocatorWithoutType = CreateLocator<typeof restPropertiesWithoutLocator>;

  true satisfies IsEqual<LocatorWithoutType, unknown>;

  // @ts-expect-error
  const locatorOnlyWithSymbol = createLocator({} as unknown as {[SYMBOL]: 'bar'});

  // @ts-expect-error
  type LocatorOnlyWithSymbol = CreateLocator<typeof locatorOnlyWithSymbol>;

  true satisfies IsEqual<typeof locatorOnlyWithSymbol, unknown>;
  true satisfies IsEqual<LocatorOnlyWithSymbol, unknown>;

  true satisfies IsEqual<typeof locatorForEmptyProperties, typeof locatorWithoutType>;
  true satisfies IsEqual<typeof locatorForEmptyProperties, unknown>;

  return (
    <button {...locator({type: 'foo'})}>
      {/* @ts-expect-error */}
      <label {...restProps}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithoutType}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithoutType()}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithoutType.bar()}>{children}</label>
      <label {...locatorWithFullProperties({type: 'qux'})}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithFullProperties()}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorByPropertiesWithoutLocator()}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorByPropertiesWithoutLocator({type: 'qux'})}>{children}</label>
      <label {...locator.bar()}>{children}</label>
    </button>
  );
};

/**
 * Base tests of RemoveMarkFromProperties.
 */
true satisfies RemoveMarkFromProperties<ButtonProperties> extends ButtonOwnProperties
  ? true
  : false;

false satisfies ButtonOwnProperties extends RemoveMarkFromProperties<ButtonProperties>
  ? true
  : false;

true satisfies IsEqual<
  {fooBarBazQuxQuuxCorgeWaldo: string},
  // @ts-expect-error
  RemoveMarkFromProperties<{fooBarBazQuxQuuxCorgeWaldo: string}>
>;

/**
 * Base tests of component inheritance (via properties extension).
 */
export const ButtonWithoutLocator = (properties: ButtonOwnProperties & {children: unknown}) => {
  // @ts-expect-error
  return <button {...properties}></button>;
};

type LogButtonLocator = Locator<{button: ButtonLocator; close: Record<never, string>}>;
type LogButtonProperties = ButtonProperties & {namespace: string} & Mark<LogButtonLocator>;

export const LogButton = ({namespace, ...rest}: LogButtonProperties) => {
  const locator = createLocator(rest);

  // TODO: should be true, probably
  false satisfies IsEqual<typeof locator, ButtonLocator & LogButtonLocator>;

  true satisfies IsEqual<typeof locator, CreateLocator<LogButtonProperties>>;

  locator.button({type: ''});
  locator.close();

  locator({type: ''});
  locator.bar();

  // TODO: should be an error
  const locatorParameters = getLocatorParameters(rest);
  const restWithoutMark = removeMarkFromProperties(rest);

  true satisfies IsEqual<'children' | keyof ButtonOwnProperties, keyof typeof restWithoutMark>;

  console.log(namespace);

  return (
    <>
      {/* TODO: should be an error */}
      <Button {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator()} />
      <Button {...rest} {...locator({type: 'Log'})} />
      {/* @ts-expect-error */}
      <Button {...locator({type: 'Log'})} />
      <Button {...locator(locatorParameters)} {...rest} />
      <Button {...locator.button({type: ''})} {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator.button()} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator} />
      <ButtonWithoutLocator {...rest} />
      <ButtonWithoutLocator {...restWithoutMark} />
      {/* @ts-expect-error */}
      <Button {...restWithoutMark} />
      {/* TODO: should be an error */}
      <Button {...restWithoutMark} {...locator(locatorParameters)} />
      <Button {...restWithoutMark} {...locator.button(locatorParameters)} />
      {/* TODO: should be an error */}
      <Button {...locator(locatorParameters)} {...restWithoutMark} />
      <Button {...locator.button(locatorParameters)} {...restWithoutMark} />
    </>
  );
};

type ClearedLogButtonProperties = RemoveMarkFromProperties<ButtonProperties> & {
  namespace: string;
} & Mark<LogButtonLocator>;

export const ClearedLogButton = ({namespace, ...rest}: ClearedLogButtonProperties) => {
  const locator = createLocator(rest);

  true satisfies IsEqual<typeof locator, LogButtonLocator>;
  true satisfies IsEqual<typeof locator, CreateLocator<ClearedLogButtonProperties>>;

  // @ts-expect-error
  const locatorParameters = getLocatorParameters(rest);

  true satisfies IsEqual<typeof locatorParameters, unknown>;

  const restWithoutMark = removeMarkFromProperties(rest);

  // @ts-expect-error
  const locatorParametersWithoutMark = getLocatorParameters(restWithoutMark);

  true satisfies IsEqual<typeof locatorParametersWithoutMark, unknown>;

  console.log(namespace);

  return (
    <>
      <Button {...rest} {...locator.button({type: 'foo'})} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator.button(locatorParameters)} />
      {/* @ts-expect-error */}
      <Button {...locator.button({type: 'foo'})} {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator()} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator(locatorParameters)} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator} />
      {/* @ts-expect-error */}
      <Button {...restWithoutMark} />
      <Button {...restWithoutMark} {...locator.button({type: ''})} />
      <Button {...locator.button({type: ''})} {...restWithoutMark} />
      {/* @ts-expect-error */}
      <ButtonWithoutLocator />
      <ButtonWithoutLocator {...rest} />
      <ButtonWithoutLocator {...restWithoutMark} />
    </>
  );
};

/**
 * Tests of pageObject with locator.
 */
type HeaderPageObjectLocator = typeof rootLocator.header;

false satisfies IsEqual<HeaderPageObjectLocator, HeaderLocator>;

true satisfies IsEqual<CreateLocator<HeaderLocator, Selector>, HeaderPageObjectLocator>;

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

type MainPageProperties = {headerLocatorMark: Mark<HeaderLocator>} & Mark<MainPageLocator>;

const MainPage = ({headerLocatorMark, ...rest}: MainPageProperties) => {
  const locator = createLocator(rest);

  true satisfies IsEqual<typeof locator, MainPageLocator>;
  true satisfies IsEqual<typeof locator, CreateLocator<MainPageProperties>>;

  return (
    <div {...locator()}>
      {/* @ts-expect-error */}
      <Header />
      {/* @ts-expect-error */}
      <Header {...locator.header()} />
      <Header {...headerLocatorMark} />
      <div {...locator.content()}></div>
    </div>
  );
};

type PageWrapperLocator = Locator<{
  header: HeaderLocator;
  main: MainPageLocator;
}>;

export const PageWrapper = (properties: Mark<PageWrapperLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, PageWrapperLocator>;
  true satisfies IsEqual<typeof locator, CreateLocator<Mark<PageWrapperLocator>>>;

  return (
    <div {...locator()}>
      {/* @ts-expect-error */}
      <MainPage {...locator.main()} />
      <MainPage {...locator.main()} headerLocatorMark={locator.header()} />
    </div>
  );
};

/**
 * Tests of properties modifiers and symbol properties in locator description.
 */
type RenderedLocatorWithOptionalField = Locator<{
  header?: HeaderLocator;
}>;

true satisfies IsEqual<RenderedLocator, RenderedLocatorWithOptionalField>;

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

type RenderedNodeWithParameters = Node<{header: HeaderLocator}, {[SYMBOL]: number}>;

false satisfies IsEqual<RenderedNode, RenderedNodeWithParameters>;

type RenderedLocatorWithSymbolProperty = Locator<{
  header: HeaderLocator;
  [SYMBOL]: {foo: 'bar'};
}>;

const renderedLocatorWithSymbolProperty = createLocator(
  {} as Mark<RenderedLocatorWithSymbolProperty>,
);

true satisfies IsEqual<typeof renderedLocatorWithSymbolProperty, RenderedLocatorWithSymbolProperty>;
true satisfies IsEqual<
  typeof renderedLocatorWithSymbolProperty,
  CreateLocator<Mark<RenderedLocatorWithSymbolProperty>>
>;

true satisfies IsEqual<RenderedLocator, RenderedLocatorWithSymbolProperty>;

type RenderedNodeWithSymbolProperty = Node<{
  header: HeaderLocator;
  [SYMBOL]: {foo: 'bar'};
}>;

true satisfies IsEqual<Node<{readonly header?: HeaderLocator}>, RenderedNodeWithSymbolProperty>;

type RenderedLocatorWithOptionalSymbolProperty = Locator<{
  header: HeaderLocator;
  readonly [SYMBOL]?: {qux: 'baz'};
}>;

true satisfies IsEqual<RenderedLocator, RenderedLocatorWithOptionalSymbolProperty>;

type RenderedLocatorWithSymbolInParameters = Locator<{header: HeaderLocator}, {[SYMBOL]: 'baz'}>;

false satisfies IsEqual<RenderedLocator, RenderedLocatorWithSymbolInParameters>;

type RenderedLocatorWithOptionalParameters = Locator<{header: HeaderLocator}, {foo?: string}>;

type LinkProperties = {link: string} & Mark<Locator<{link: RenderedLocatorWithOptionalParameters}>>;

export const Link = (properties: LinkProperties) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, Locator<{link: RenderedLocatorWithOptionalParameters}>>;
  true satisfies IsEqual<typeof locator, CreateLocator<LinkProperties>>;

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

const RenderedWithOptionalParameters = (
  properties: Mark<RenderedLocatorWithOptionalParameters>,
) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, RenderedLocatorWithOptionalParameters>;
  true satisfies IsEqual<
    typeof locator,
    CreateLocator<Mark<RenderedLocatorWithOptionalParameters>>
  >;

  const propertiesWithSymbol = {} as Mark<RenderedLocatorWithSymbolProperty> & {[SYMBOL]: number};

  const locatorWithSymbol = createLocator(propertiesWithSymbol);

  true satisfies IsEqual<typeof locatorWithSymbol, RenderedLocatorWithSymbolProperty>;
  true satisfies IsEqual<
    typeof locatorWithSymbol,
    CreateLocator<Mark<RenderedLocatorWithSymbolProperty>>
  >;

  const propertiesWithoutLocator = removeMarkFromProperties(propertiesWithSymbol);

  // @ts-expect-error
  const locatorWithoutLocator = createLocator(propertiesWithoutLocator);

  true satisfies IsEqual<typeof locatorWithoutLocator, unknown>;
  true satisfies IsEqual<
    typeof locatorWithoutLocator,
    // @ts-expect-error
    CreateLocator<typeof propertiesWithoutLocator>
  >;

  return <div {...locator({})}></div>;
};

const RenderedWithOtherOptionalParameters = (
  properties: Mark<RenderedLocatorWithOtherOptionalParameters>,
) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, RenderedLocatorWithOtherOptionalParameters>;
  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  return <div {...locator({})}></div>;
};

type PanelLocator = Locator<
  {
    rendered: RenderedLocatorWithOptionalParameters;
    otherRendered: RenderedLocatorWithOtherOptionalParameters;
    renderedWithParameters: RenderedNodeWithParameters;
  },
  {quux: string}
>;

const Panel = (properties: Mark<PanelLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, PanelLocator>;
  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  return (
    <>
      {/* @ts-expect-error */}
      <RenderedWithOptionalParameters {...locator.otherRendered({})} />
      {/* @ts-expect-error */}
      <RenderedWithOtherOptionalParameters {...locator.rendered({})} />

      <RenderedWithOptionalParameters {...locator.rendered({})} />
      <RenderedWithOtherOptionalParameters {...locator.otherRendered({})} />

      {/* @ts-expect-error */}
      <div {...locator.renderedWithParameters()}></div>
      {/* @ts-expect-error */}
      <div {...locator.renderedWithParameters({})}></div>
      <div {...locator.renderedWithParameters({[SYMBOL]: 3})}></div>
    </>
  );
};

/**
 * Tests of locator with parameters.
 */
type PanelWithParametersLocator = Locator<{}, {foo: string}>;
type SomeProperties = {foo: 'bar'};

const PanelWithParameters = (properties: Mark<PanelWithParametersLocator>) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, PanelWithParametersLocator>;
  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  return <div {...locator({foo: 'bar'})}></div>;
};

const panelWithParametersProperties = {} as Mark<PanelWithParametersLocator> & SomeProperties;
const optionalPanelWithParametersProperties = {} as Partial<Mark<PanelWithParametersLocator>> &
  SomeProperties;

const panelParameters = getLocatorParameters(panelWithParametersProperties);
const optionalPanelParameters = getLocatorParameters(optionalPanelWithParametersProperties);

true satisfies IsEqual<typeof panelParameters, typeof optionalPanelParameters>;

const locatorWithParameters = createLocator(panelWithParametersProperties);

true satisfies IsEqual<typeof locatorWithParameters, PanelWithParametersLocator>;
true satisfies IsEqual<
  typeof locatorWithParameters,
  CreateLocator<typeof panelWithParametersProperties>
>;

const optionalLocatorWithParameters = createLocator(optionalPanelWithParametersProperties);

true satisfies IsEqual<typeof optionalLocatorWithParameters, PanelWithParametersLocator>;
true satisfies IsEqual<
  typeof optionalLocatorWithParameters,
  CreateLocator<typeof optionalPanelWithParametersProperties>
>;

true satisfies IsEqual<typeof locatorWithParameters, typeof optionalLocatorWithParameters>;
false satisfies IsEqual<typeof locatorWithParameters, typeof locatorForEmptyProperties>;

const panelWithParametersPropertiesWithoutLocator = removeMarkFromProperties(
  panelWithParametersProperties,
);
const optionalPanelWithParametersPropertiesWithoutLocator = removeMarkFromProperties(
  optionalPanelWithParametersProperties,
);

true satisfies IsEqual<
  typeof panelWithParametersPropertiesWithoutLocator,
  typeof optionalPanelWithParametersPropertiesWithoutLocator
>;

false satisfies IsEqual<
  typeof panelWithParametersProperties,
  typeof panelWithParametersPropertiesWithoutLocator
>;

const panelParametersWithoutLocator = getLocatorParameters(
  // @ts-expect-error
  panelWithParametersPropertiesWithoutLocator,
);
const panelParametersWithOptionalLocator = getLocatorParameters(
  // @ts-expect-error
  optionalPanelWithParametersPropertiesWithoutLocator,
);

true satisfies IsEqual<
  typeof panelParametersWithoutLocator,
  typeof panelParametersWithOptionalLocator
>;

export const withParameters = (
  <>
    <PanelWithParameters {...locatorWithParameters({foo: 'bar'})} />
    {/* @ts-expect-error */}
    <PanelWithParameters {...locatorWithParameters(panelParametersWithoutLocator)} />
    <PanelWithParameters {...locatorWithParameters(panelParameters)} />
  </>
);

/**
 * Tests of optional locator.
 */
type OptionalPanelProperties = Partial<{qux: string} & Mark<PanelLocator>>;

const panelProperties = {} as Mark<PanelLocator>;

const panelLocator = createLocator(panelProperties);

true satisfies IsEqual<typeof panelLocator, PanelLocator>;
true satisfies IsEqual<typeof panelLocator, CreateLocator<typeof panelProperties>>;

const PanelWithOptionalLocator = (properties: OptionalPanelProperties) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, typeof panelLocator>;
  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  false satisfies IsEqual<typeof locator, typeof locatorForEmptyProperties>;

  const propertiesWithoutLocator = removeMarkFromProperties(properties);

  false satisfies IsEqual<typeof properties, typeof propertiesWithoutLocator>;

  const parameters = getLocatorParameters(panelProperties);
  const parametersWithOptionalLocator = getLocatorParameters(properties);

  const someProperties = {} as {foo: 'bar'};
  const somePropertiesWithSymbol = {} as typeof someProperties & {[SYMBOL]: 'baz'};

  // @ts-expect-error
  const l1 = createLocator(someProperties);
  // @ts-expect-error
  const l2 = createLocator(somePropertiesWithSymbol);
  // @ts-expect-error
  const l3 = createLocator(propertiesWithoutLocator);

  true satisfies IsEqual<[unknown, unknown, unknown], [typeof l1, typeof l2, typeof l3]>;

  // @ts-expect-error
  const parametersForEmptyProperties = getLocatorParameters({});

  // @ts-expect-error
  getLocatorParameters({} as object);

  // @ts-expect-error
  getLocatorParameters(someProperties);
  // @ts-expect-error
  getLocatorParameters(somePropertiesWithSymbol);
  // @ts-expect-error
  getLocatorParameters(propertiesWithoutLocator);

  // @ts-expect-error
  const propertiesForEmptyProperties = removeMarkFromProperties({});

  true satisfies IsEqual<typeof propertiesForEmptyProperties, {}>;

  // @ts-expect-error
  const propertiesForEmptyObject = removeMarkFromProperties({} as object);

  true satisfies IsEqual<typeof propertiesForEmptyObject, {}>;

  // @ts-expect-error
  const propertiesFromSomeProperties = removeMarkFromProperties(someProperties);

  true satisfies IsEqual<typeof propertiesFromSomeProperties, {}>;

  // @ts-expect-error
  removeMarkFromProperties(somePropertiesWithSymbol);
  // @ts-expect-error
  removeMarkFromProperties(propertiesWithoutLocator);

  true satisfies IsEqual<typeof parameters, typeof parametersWithOptionalLocator>;

  true satisfies IsEqual<typeof parametersForEmptyProperties, unknown>;

  return (
    <>
      <PanelWithOptionalLocator />
      <PanelWithOptionalLocator {...locator({quux: 'foo'})} />
      <PanelWithOptionalLocator {...locator({quux: 'foo'})} {...propertiesWithAriaInvalid} />
      <Panel {...locator({quux: 'foo'})} />
      {/* @ts-expect-error */}
      <Panel {...locator()} />
      {/* @ts-expect-error */}
      <Link link="foo" {...locator()} />
      {/* @ts-expect-error */}
      <div {...properties}></div>
    </>
  );
};

const PanelWithoutLocator = (properties: {}) => {
  // @ts-expect-error
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, unknown>;
  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  // @ts-expect-error
  const locatorForObjectType = createLocator({} as object);

  true satisfies IsEqual<typeof locatorForObjectType, unknown>;
  true satisfies IsEqual<typeof locatorForObjectType, CreateLocator<object>>;

  true satisfies IsEqual<typeof locator, typeof locatorForEmptyProperties>;
  true satisfies IsEqual<typeof locatorForObjectType, typeof locatorForEmptyProperties>;

  // @ts-expect-error
  const propertiesWithoutLocator = removeMarkFromProperties(properties);

  true satisfies IsEqual<typeof propertiesWithoutLocator, {}>;

  // @ts-expect-error
  return <div {...locator()}></div>;
};

export const panels = (
  <>
    {/* @ts-expect-error */}
    <Panel />
    <PanelWithOptionalLocator />
    <PanelWithOptionalLocator {...panelLocator({quux: 'baz'})} />
    {/* @ts-expect-error */}
    <PanelWithOptionalLocator {...panelLocator({foo: 'baz'})} />
    {/* @ts-expect-error */}
    <PanelWithOptionalLocator {...panelLocator()} />
    <PanelWithoutLocator />
    {/* @ts-expect-error */}
    <PanelWithoutLocator {...locatorForEmptyProperties()} />
  </>
);

// @ts-expect-error
export type TextAreaLocator = Locator<{button: Partial<Locator<{}>>; input: {}}>;
