import React from 'react';

import {
  anyLocator,
  createLocator,
  type CreateLocator,
  getLocatorParameters,
  type GetLocatorParameters,
  type Locator,
  type LocatorConstraint,
  type LocatorDescriptionConstraint,
  type LocatorOfElement,
  type Mark,
  type Node,
  type ParametersConstraint,
  type PropertiesWithMarkConstraint,
  type PropertiesWithMarkWithParametersConstraint,
  removeMarkFromProperties,
  type RemoveMarkFromProperties,
} from 'create-locator';

type L1 = Locator<{}>;
type LVoid = Locator<void>;
type M1 = Mark<L1>;
type N1 = Node<{}>;
type NVoid = Node<void>;

declare const neverValue: never;

true satisfies IsEqual<L1, LVoid>;
true satisfies IsEqual<N1, NVoid>;

type ErrorAttribute = keyof L1 & keyof M1;

declare const ERROR_ATTRIBUTE: ErrorAttribute;

type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

declare const SYMBOL: unique symbol;

/**
 * Base checks of Locator, LocatorOfElement and Node type parameters.
 */
export type Checks = [
  Locator<{}, {}>,
  Locator<{foo: L1}, {}>,
  Locator<{foo: {}}, {bar: 'baz'}>,
  Locator<{foo: void}, {bar: 'baz'}>,
  Locator<{foo: void}, void>,
  Locator<{foo: {qux: 'quux'}}, {bar: 'baz'}>,
  Locator<{foo: {qux: 'quux'}; bar: L1}>,
  Locator<{foo: {qux: 'quux'}; bar: L1; baz: N1}>,
  Locator<{foo: undefined}>,
  Locator<{foo: never}>,
  Locator<undefined>,
  Locator<never>,
  Locator<never, void>,
  Locator<never, undefined>,
  Locator<never, never>,
  // @ts-expect-error
  Locator<{foo: symbol}>,
  // @ts-expect-error
  Locator<{}, {}, {}>,
  // @ts-expect-error
  Locator<L1>,
  // @ts-expect-error
  Locator<N1>,
  // @ts-expect-error
  Locator<{foo: 2}>,
  Locator<{foo: void}>,
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
  Locator<{button: Partial<L1>}>,
  // @ts-expect-error
  Locator<{button: Partial<N1>}>,
  // @ts-expect-error
  Locator<{button: M1}>,
  // @ts-expect-error
  Locator<{button: Partial<M1>}>,
  // @ts-expect-error
  Locator<L1>,
  // @ts-expect-error
  Locator<M1>,
  // @ts-expect-error
  Locator<N1>,

  LocatorOfElement<{}, {}>,
  LocatorOfElement<{foo: L1}, {}>,
  LocatorOfElement<{foo: {}}, {bar: 'baz'}>,
  LocatorOfElement<{foo: void}, {bar: 'baz'}>,
  LocatorOfElement<{foo: void}, void>,
  LocatorOfElement<{foo: {qux: 'quux'}}, {bar: 'baz'}>,
  LocatorOfElement<{foo: {qux: 'quux'}; bar: L1}>,
  LocatorOfElement<{foo: {qux: 'quux'}; bar: L1; baz: N1}>,
  LocatorOfElement<{foo: undefined}>,
  LocatorOfElement<{foo: never}>,
  LocatorOfElement<undefined>,
  LocatorOfElement<never>,
  LocatorOfElement<never, void>,
  LocatorOfElement<never, undefined>,
  LocatorOfElement<never, never>,
  // @ts-expect-error
  LocatorOfElement<{foo: symbol}>,
  // @ts-expect-error
  LocatorOfElement<{}, {}, {}>,
  // @ts-expect-error
  LocatorOfElement<L1>,
  // @ts-expect-error
  LocatorOfElement<N1>,
  // @ts-expect-error
  LocatorOfElement<{foo: 2}>,
  LocatorOfElement<{foo: void}>,
  LocatorOfElement<{foo: undefined}>,
  // @ts-expect-error
  LocatorOfElement<{foo: unknown}>,
  // @ts-expect-error
  LocatorOfElement<{foo: object}>,
  // @ts-expect-error
  LocatorOfElement<{foo: {}}, object>,
  // @ts-expect-error
  LocatorOfElement<{}, {foo: 2}>,
  // @ts-expect-error
  LocatorOfElement<{}, {foo: {}}>,
  // @ts-expect-error
  LocatorOfElement<{foo: {bar: 3}}>,
  // @ts-expect-error
  LocatorOfElement<{}, {foo: L1}>,
  // @ts-expect-error
  LocatorOfElement<{button: Partial<L1>}>,
  // @ts-expect-error
  LocatorOfElement<{button: Partial<N1>}>,
  // @ts-expect-error
  LocatorOfElement<{button: M1}>,
  // @ts-expect-error
  LocatorOfElement<{button: Partial<M1>}>,
  // @ts-expect-error
  LocatorOfElement<L1>,
  // @ts-expect-error
  LocatorOfElement<M1>,
  // @ts-expect-error
  LocatorOfElement<N1>,

  // @ts-expect-error
  Mark<{}>,
  Mark<L1>,
  // @ts-expect-error
  Mark<L1, {}>,
  // @ts-expect-error
  Mark<L1, L1>,
  // @ts-expect-error
  Mark<M1>,
  // @ts-expect-error
  Mark<N1>,
  // @ts-expect-error
  Mark<{foo: undefined}>,
  // @ts-expect-error
  Mark<{foo: never}>,
  // @ts-expect-error
  Mark<undefined>,
  Mark<never>,
  // @ts-expect-error
  Mark<never, never>,

  Node<{}, {}>,
  Node<{foo: L1}, {}>,
  Node<{foo: void}, {bar: 'baz'}>,
  Node<{foo: void}, void>,
  Node<{foo: {qux: 'quux'}}, {bar: 'baz'}>,
  Node<{foo: {qux: 'quux'}; bar: L1}>,
  Node<{foo: {qux: 'quux'}; bar: L1; baz: N1}>,
  Node<{foo: undefined}>,
  Node<{foo: never}>,
  Node<undefined>,
  Node<never>,
  Node<never, void>,
  Node<never, undefined>,
  Node<never, never>,
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
  Node<{foo: void}>,
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
  Node<{button: Partial<L1>}>,
  // @ts-expect-error
  Node<{button: Partial<N1>}>,
  // @ts-expect-error
  Node<{button: M1}>,
  // @ts-expect-error
  Node<{button: Partial<M1>}>,
  // @ts-expect-error
  Node<L1>,
  // @ts-expect-error
  Node<M1>,
  // @ts-expect-error
  Node<N1>,
];

// @ts-expect-error
const locatorForEmptyProperties = createLocator({});

true satisfies IsEqual<typeof locatorForEmptyProperties, unknown>;

const propertiesWithAriaInvalid = {} as {'aria-invalid': React.AriaAttributes['aria-invalid']};

/**
 * Base tests of component, element and node locator.
 */
export type LabelLocator = Locator<{}, {level: string}>;
type LabelProperties = {level?: string; text: string} & Mark<LabelLocator>;

export const Label = ({level, text, ...rest}: LabelProperties) => {
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

export type MultiLocator = Locator<{label: LabelLocator} | {footer: {}}>;

type MultiVoidLocator = Locator<{label: LabelLocator} | {footer: void}>;

type MultiLocatorWithVoidParameters = Locator<{label: LabelLocator} | {footer: void}, void>;

true satisfies IsEqual<MultiLocator, MultiVoidLocator>;
true satisfies IsEqual<MultiLocator, MultiLocatorWithVoidParameters>;

export const Multi = (properties: Mark<MultiLocator>) => {
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
      {/* @ts-expect-error */}
      <span {...locator.label({level: 'foo'})}></span>
      <Label text="baz" {...locator.label({level: 'foo'})} />
      <Label text="bar" {...locator.label({level: 'foo'})} {...propertiesWithAriaInvalid} />
      <Label text="bar" {...anyLocator()} />
      {/* @ts-expect-error */}
      <Label text="bar" {...anyLocator} />
    </div>
  );
};

export type HeaderLocator = Locator<{
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

export const Header = ({foo, ...rest}: HeaderProperties) => {
  const locator = createLocator(rest);

  true satisfies IsEqual<typeof locator, HeaderLocator>;
  true satisfies IsEqual<CreateLocator<HeaderProperties>, HeaderLocator>;

  // @ts-expect-error
  locator.foo = {} as unknown as any;

  // TODO: also support keys `arguments` and `prototype`
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
      <Multi {...anyLocator()} />
      {/* @ts-expect-error */}
      <Multi {...anyLocator} />
      <Multi {...anyLocator({})} />
      <Multi {...anyLocator({bar: 2})} />
      {/* @ts-expect-error */}
      <span {...locator}></span>
      {/* @ts-expect-error */}
      <div {...locator.foo({level: 'baz'})}></div>
      <Label text="bar" {...locator.foo({level: 'baz'})} />
      {/* @ts-expect-error */}
      <div {...locator.foo}></div>
      {/* @ts-expect-error */}
      <span {...{[ERROR_ATTRIBUTE]: 'error' as const}} aria-invalid={true}></span>
      {/* @ts-expect-error */}
      <span {...locator.subtree.name({level: '1'})}></span>
      <Label text="bar" {...locator.subtree.name({level: '1'})} />
    </h1>
  );
};

export const Wrapper = (properties: Mark<HeaderLocator>) => {
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
      <Header {...anyLocator()} />
      {/* @ts-expect-error */}
      <Header {...anyLocator} />
      {/* @ts-expect-error */}
      <div {...properties}></div>
    </div>
  );
};

type RenderedLocator = Locator<{
  header: HeaderLocator;
}>;

export type ComponentWithElementPropertiesLocator = LocatorOfElement<{foo: void}>;

export const ComponentWithElementProperties = (
  properties: JSX.IntrinsicElements['div'] & Mark<ComponentWithElementPropertiesLocator>,
) => {
  const locator = createLocator(properties);
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  return (
    <div aria-invalid={properties['aria-invalid']} {...locator()}>
      <span {...properties}></span>
      <span {...propertiesWithoutMark}></span>
    </div>
  );
};

export type ComponentWithElementPropertiesWithParametersLocator = LocatorOfElement<
  {foo: {}},
  {bar: 'baz' | 'qux'}
>;

export const ComponentWithElementPropertiesWithParameters = (
  properties: JSX.IntrinsicElements['a'] &
    Mark<ComponentWithElementPropertiesWithParametersLocator>,
) => {
  const locator = createLocator(properties);
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  true satisfies IsEqual<typeof locator, CreateLocator<typeof properties>>;

  return (
    <div aria-invalid={properties['aria-invalid']} {...locator({bar: 'baz'})}>
      <span {...properties}></span>
      <span {...propertiesWithoutMark}></span>
      {/* @ts-expect-error */}
      <span {...locator()}></span>
      <span {...locator({bar: 'qux'})}></span>
      {/* @ts-expect-error */}
      <span {...locator({bar: 'quxx'})}></span>
    </div>
  );
};

export type MainLocator = Locator<
  {
    header: HeaderLocator;
    rendered: RenderedLocator;
    text: {value?: string};
    void: {};
    withElementProperties: ComponentWithElementPropertiesLocator;
    withElementPropertiesWithParameters: ComponentWithElementPropertiesWithParametersLocator;
  },
  {text: 'foo' | 'bar'}
>;

type MainVoidLocator = Locator<
  {
    header: HeaderLocator;
    rendered: RenderedLocator;
    text: {value?: string};
    void: void;
    withElementProperties: ComponentWithElementPropertiesLocator;
    withElementPropertiesWithParameters: ComponentWithElementPropertiesWithParametersLocator;
  },
  {text: 'foo' | 'bar'}
>;

true satisfies IsEqual<MainLocator, MainVoidLocator>;

type MainProperties = {render: Function} & Mark<MainLocator>;

declare const mainProperties: MainProperties;

export const mainLocator = createLocator(mainProperties);

true satisfies IsEqual<typeof mainLocator, MainLocator>;
true satisfies IsEqual<CreateLocator<MainProperties>, MainLocator>;

export const Main = ({render, ...rest}: MainProperties) => {
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
      <ComponentWithElementProperties {...locator.withElementProperties()} />
      {/* @ts-expect-error */}
      <ComponentWithElementPropertiesWithParameters {...locator.withElementProperties()} />
      <ComponentWithElementPropertiesWithParameters
        {...locator.withElementPropertiesWithParameters({bar: 'baz'})}
      />
      {/* @ts-expect-error */}
      <ComponentWithElementProperties
        {...locator.withElementPropertiesWithParameters({bar: 'baz'})}
      />
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
      {/* @ts-expect-error */}
      <Main render={() => {}} {...anyLocator} />
      <Main render={() => {}} {...anyLocator()} />
      <Main render={() => {}} {...anyLocator({})} />
      <Main render={() => {}} {...anyLocator({foo: ''})} />
      <Main render={() => {}} {...anyLocator({foo: 2})} />
      {/* @ts-expect-error */}
      <Main render={() => {}} {...anyLocator({}, {})} />
      <span {...locator({text: 'bar'})}></span>
    </div>
  );
};

/**
 * Base tests of root locator.
 */
export type AppLocator = Locator<{
  header: HeaderLocator;
  readonly label: LabelLocator;
  main: MainLocator;
  staticComponent: StaticComponentLocator;
  void: {};
}>;

type AppVoidLocator = Locator<{
  header: HeaderLocator;
  readonly label: LabelLocator;
  main: MainLocator;
  staticComponent: StaticComponentLocator;
  void: void;
}>;

type AppLocatorWithVoidParameters = Locator<
  {
    header: HeaderLocator;
    readonly label: LabelLocator;
    main: MainLocator;
    staticComponent: StaticComponentLocator;
    void: void;
  },
  void
>;

true satisfies IsEqual<AppLocator, AppVoidLocator>;
true satisfies IsEqual<AppLocator, AppLocatorWithVoidParameters>;

export const appLocator = createLocator<AppLocator>('app');

// @ts-expect-error
createLocator('app');
// @ts-expect-error
createLocator({});
// @ts-expect-error
createLocator('app', {});
// @ts-expect-error
createLocator('app', {foo: ''});
// @ts-expect-error
createLocator('app', {isProduction: true});
// @ts-expect-error
createLocator('app', {mapAttributes: () => {}});
// @ts-expect-error
createLocator<AppLocator>('app', {mapAttributes: () => {}});
// @ts-expect-error
createLocator<AppLocator>('app', {mapAttributes: () => 3});
createLocator<AppLocator, number>('app', {mapAttributes: () => 3});
createLocator<AppLocator, void>('app', {mapAttributes: () => {}});

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
      <div {...appLocator.header()}></div>
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
      <Wrapper {...anyLocator()} />
      {/* @ts-expect-error */}
      <Wrapper {...anyLocator} />
      <StaticComponent />
      <StaticComponent {...anyLocator()} />
    </div>
  );
};

const rootLocatorWithParameters = createLocator<Locator<void, {foo: string}>>('root');

// @ts-expect-error
rootLocatorWithParameters();

// @ts-expect-error
rootLocatorWithParameters({foo: 2});

rootLocatorWithParameters({foo: ''});

// @ts-expect-error
createLocator<Locator<{foo: {}}, {bar: string}>, symbol>('root');

// @ts-expect-error
createLocator<Locator<{foo: {}}, {bar: string}>, symbol>('root', {mapAttributes: () => {}});

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

const rootLocatorWithParametersWithMapping = createLocator<
  Locator<{foo: {}}, {bar: string}>,
  symbol
>('root', {mapAttributes: () => Symbol()});

// @ts-expect-error
rootLocatorWithParametersWithMapping();

// @ts-expect-error
rootLocatorWithParametersWithMapping({bar: 2});

rootLocatorWithParametersWithMapping({bar: ''});

/**
 * Base tests of static components.
 */
export type StaticComponentLocator = Locator<{
  foo: void;
  multi: MultiLocator;
}>;

const staticComponentLocator = createLocator(appLocator.staticComponent());

// @ts-expect-error
appLocator.staticComponent.foo;

const StaticComponent = () => (
  <div {...staticComponentLocator()}>
    {/* @ts-expect-error */}
    <span {...appLocator.staticComponent()}></span>
    <span {...staticComponentLocator.foo()}></span>
    {/* @ts-expect-error */}
    <Multi />
    <Multi {...staticComponentLocator.multi()} />
  </div>
);

/**
 * Base tests of anyLocator.
 */
export type AnyLocator = typeof anyLocator;

const anyMark = anyLocator();

export type AnyMark = typeof anyMark;

true satisfies PropertiesWithMarkConstraint extends AnyMark ? true : false;
true satisfies PropertiesWithMarkWithParametersConstraint extends AnyMark ? true : false;

true satisfies LabelLocator extends AnyLocator ? true : false;
true satisfies MultiLocator extends AnyLocator ? true : false;
true satisfies HeaderLocator extends AnyLocator ? true : false;
true satisfies MainLocator extends AnyLocator ? true : false;
true satisfies MainLocator extends AnyLocator ? true : false;
true satisfies BannerLocator extends AnyLocator ? true : false;
true satisfies PanelLocator extends AnyLocator ? true : false;
true satisfies AppLocator extends AnyLocator ? true : false;

false satisfies {} extends AnyLocator ? true : false;
false satisfies {foo: any} extends AnyLocator ? true : false;
false satisfies object extends AnyLocator ? true : false;

/**
 * Base tests of CreateLocator.
 */
true satisfies IsEqual<CreateLocator<never>, unknown>;
true satisfies IsEqual<CreateLocator<never, Selector>, unknown>;

const neverLocator = createLocator(neverValue);
const neverLocatorWithMapping = createLocator(neverValue, {});
const neverLocatorWithoutMapping = createLocator<never>(neverValue);
const someLocatorWithNever = createLocator<never>('app');

true satisfies IsEqual<typeof neverLocator, unknown>;
true satisfies IsEqual<typeof neverLocatorWithMapping, unknown>;
true satisfies IsEqual<typeof neverLocatorWithoutMapping, unknown>;
true satisfies IsEqual<typeof someLocatorWithNever, unknown>;

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
const neverLocatorParameters = getLocatorParameters(neverValue);

true satisfies IsEqual<typeof neverLocatorParameters, unknown>;

type BannerParameters = {id: `id${string}`; [SYMBOL]?: number};
export type BannerLocator = Locator<{text: {}}, BannerParameters>;

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
  ({}) as GetLocatorParameters<typeof properties>;

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

export type LayoutLocator = Locator<{foo: {bar: string} | {baz: string} | undefined}>;

/**
 * Base tests of GetLocatorParameters.
 */
true satisfies IsEqual<GetLocatorParameters<never>, unknown>;

true satisfies IsEqual<BannerParameters, GetLocatorParameters<Mark<BannerLocator>>>;
true satisfies IsEqual<BannerParameters, GetLocatorParameters<Partial<Mark<BannerLocator>>>>;

true satisfies IsEqual<GetLocatorParameters<Mark<Locator<{}, {foo: string}>>>, {foo: string}>;

true satisfies IsEqual<
  GetLocatorParameters<Mark<Locator<{}, {[SYMBOL]: string}>>>,
  {[SYMBOL]: string}
>;

// @ts-expect-error
({}) as GetLocatorParameters<{foo: ''}>;

/**
 * Base tests of Locator.
 */
true satisfies IsEqual<Locator<void>, Locator<undefined>>;
true satisfies IsEqual<Locator<void, {foo: string}>, Locator<undefined, {foo: string}>>;
false satisfies IsEqual<Locator<void, {foo: string}>, Locator<undefined, {foo?: string}>>;

true satisfies IsEqual<
  [unknown, unknown, unknown, unknown],
  [Locator<never>, Locator<{foo: void}, never>, Locator<void, never>, Locator<never, void>]
>;

/**
 * Base tests of LocatorConstraint.
 */
export type ModifiedMark<SomeLocator extends LocatorConstraint> = Mark<SomeLocator>;

true satisfies AnyLocator extends LocatorConstraint ? true : false;
true satisfies LabelLocator extends LocatorConstraint ? true : false;
true satisfies MultiLocator extends LocatorConstraint ? true : false;
true satisfies HeaderLocator extends LocatorConstraint ? true : false;
true satisfies MainLocator extends LocatorConstraint ? true : false;
true satisfies MainLocator extends LocatorConstraint ? true : false;
true satisfies BannerLocator extends LocatorConstraint ? true : false;
true satisfies PanelLocator extends LocatorConstraint ? true : false;
true satisfies AppLocator extends LocatorConstraint ? true : false;

false satisfies LocatorConstraint extends AnyLocator ? true : false;
false satisfies {} extends LocatorConstraint ? true : false;
false satisfies {foo: any} extends LocatorConstraint ? true : false;
false satisfies object extends LocatorConstraint ? true : false;

/**
 * Base tests of LocatorDescriptionConstraint and ParametersConstraint.
 */
export type ModifiedLocator<
  Description extends LocatorDescriptionConstraint,
  Parameters extends ParametersConstraint,
> = Locator<Description, Parameters>;

export type ModifiedNode<
  Description extends LocatorDescriptionConstraint,
  Parameters extends ParametersConstraint,
> = Node<Description, Parameters>;

true satisfies void extends LocatorDescriptionConstraint ? true : false;
true satisfies {} extends LocatorDescriptionConstraint ? true : false;
true satisfies {foo: void} extends LocatorDescriptionConstraint ? true : false;
false satisfies {foo: ''} extends LocatorDescriptionConstraint ? true : false;

true satisfies void extends ParametersConstraint ? true : false;
true satisfies {} extends ParametersConstraint ? true : false;
true satisfies {foo: ''} extends ParametersConstraint ? true : false;
false satisfies {foo: 3} extends ParametersConstraint ? true : false;

/**
 * Base tests of LocatorOfElement.
 */
true satisfies IsEqual<LocatorOfElement<void>, LocatorOfElement<undefined>>;
false satisfies IsEqual<Locator<void>, LocatorOfElement<void>>;
true satisfies IsEqual<
  LocatorOfElement<void, {foo: string}>,
  LocatorOfElement<undefined, {foo: string}>
>;
false satisfies IsEqual<
  LocatorOfElement<void, {foo: string}>,
  LocatorOfElement<undefined, {foo?: string}>
>;

true satisfies IsEqual<
  [unknown, unknown, unknown, unknown],
  [
    LocatorOfElement<never>,
    LocatorOfElement<{foo: void}, never>,
    LocatorOfElement<void, never>,
    LocatorOfElement<never, void>,
  ]
>;

export type ComponentLikeElementLocator = Locator<{foo: void}, {bar?: string}>;
type ComponentLikeElementProperties = React.AriaAttributes & Mark<ComponentLikeElementLocator>;
type OptionalComponentLikeElementProperties = React.AriaAttributes &
  Partial<Mark<ComponentLikeElementLocator>>;

export const ComponentLikeElement = (properties: ComponentLikeElementProperties) => {
  // @ts-expect-error
  const locator = createLocator(properties);
  // @ts-expect-error
  const locatorParameters = getLocatorParameters(properties);
  // @ts-expect-error
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  true satisfies IsEqual<typeof locator, unknown>;
  true satisfies IsEqual<typeof locatorParameters, unknown>;
  true satisfies IsEqual<typeof propertiesWithoutMark, unknown>;

  // @ts-expect-error
  return <div {...locator()}></div>;
};

export const OptionalComponentLikeElement = (
  properties: OptionalComponentLikeElementProperties,
) => {
  // @ts-expect-error
  const locator = createLocator(properties);
  // @ts-expect-error
  const locatorParameters = getLocatorParameters(properties);
  // @ts-expect-error
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  true satisfies IsEqual<typeof locator, unknown>;
  true satisfies IsEqual<typeof locatorParameters, unknown>;
  true satisfies IsEqual<typeof propertiesWithoutMark, unknown>;

  // @ts-expect-error
  return <div {...locator()}></div>;
};

export type ComponentWithLocatorOfElementLocator = LocatorOfElement<{foo: void}, {bar?: string}>;
type ComponentWithLocatorOfElementProperties = React.AriaAttributes &
  Mark<ComponentWithLocatorOfElementLocator>;
type OptionalComponentWithLocatorOfElementProperties = React.AriaAttributes &
  Partial<Mark<ComponentWithLocatorOfElementLocator>>;

export const ComponentWithLocatorOfElement = (
  properties: ComponentWithLocatorOfElementProperties,
) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  false satisfies IsEqual<typeof locator, unknown>;
  false satisfies IsEqual<typeof locatorParameters, unknown>;
  false satisfies IsEqual<typeof propertiesWithoutMark, unknown>;

  return (
    <div {...locator()}>
      <div {...locator(locatorParameters)}></div>
    </div>
  );
};

export const OptionalComponentWithLocatorOfElement = (
  properties: OptionalComponentWithLocatorOfElementProperties,
) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  false satisfies IsEqual<typeof locator, unknown>;
  false satisfies IsEqual<typeof locatorParameters, unknown>;
  false satisfies IsEqual<typeof propertiesWithoutMark, unknown>;

  return (
    <div {...locator()}>
      <div {...locator(locatorParameters)}></div>
    </div>
  );
};

export type WidgetLocator = Locator<{
  componentLikeElement: ComponentLikeElementLocator;
  optionalComponentLikeElement: ComponentLikeElementLocator;
  componentWithLocatorOfElement: ComponentWithLocatorOfElementLocator;
  optionalComponentWithLocatorOfElement: ComponentWithLocatorOfElementLocator;
}>;

export const Widget = (properties: Partial<Mark<WidgetLocator>>) => {
  const locator = createLocator(properties);

  return (
    <main {...locator()}>
      {/* @ts-expect-error */}
      <ComponentLikeElement />
      {/* @ts-expect-error */}
      <ComponentLikeElement {...locator.componentLikeElement()} />
      {/* @ts-expect-error */}
      <div {...locator.componentLikeElement()}></div>

      <OptionalComponentLikeElement />
      {/* @ts-expect-error */}
      <OptionalComponentLikeElement {...locator.optionalComponentLikeElement()} />
      {/* @ts-expect-error */}
      <div {...locator.componentLikeElement()}></div>

      {/* @ts-expect-error */}
      <ComponentWithLocatorOfElement />
      <ComponentWithLocatorOfElement {...locator.componentWithLocatorOfElement()} />
      <div {...locator.componentWithLocatorOfElement()}></div>

      <OptionalComponentWithLocatorOfElement />
      <OptionalComponentWithLocatorOfElement {...locator.optionalComponentWithLocatorOfElement()} />
      <div {...locator.optionalComponentWithLocatorOfElement()}></div>
    </main>
  );
};

/**
 * Base tests of Mark.
 */
true satisfies IsEqual<Mark<never>, unknown>;

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

export const WrongTypesComponent = (properties: Locator<{foo: {}}, {bar: string}>) => {
  // @ts-expect-error
  const locator = createLocator(properties);
  // @ts-expect-error
  const locatorParameters = getLocatorParameters(properties);
  // @ts-expect-error
  const propertiesWithoutMark = removeMarkFromProperties(properties);

  true satisfies IsEqual<typeof locator, unknown>;
  true satisfies IsEqual<typeof locatorParameters, unknown>;
  true satisfies IsEqual<keyof typeof propertiesWithoutMark, never>;

  return (
    // @ts-expect-error
    <div {...locator(locatorParameters)}>
      {/* @ts-expect-error */}
      <span {...locator.foo()}></span>
    </div>
  );
};

/**
 * Base tests of Node.
 */
true satisfies IsEqual<Node<void>, Node<undefined>>;
true satisfies IsEqual<Node<void, {foo: string}>, Node<undefined, {foo: string}>>;
false satisfies IsEqual<Node<void, {foo: string}>, Node<undefined, {foo?: string}>>;

true satisfies IsEqual<
  [unknown, unknown, unknown, unknown],
  [Node<never>, Node<{foo: void}, never>, Node<void, never>, Node<never, void>]
>;

/**
 * Base tests of PropertiesWithMarkConstraint.
 */
export type ModifiedCreateLocator<Properties extends Partial<PropertiesWithMarkConstraint>> =
  CreateLocator<Properties>;

// @ts-expect-error
({}) satisfies GetLocatorParameters<PropertiesWithMarkConstraint>;

export type ModifiedRemoveMarkFromProperties<
  Properties extends Partial<PropertiesWithMarkConstraint>,
> = RemoveMarkFromProperties<Properties>;

const labelProperties = {} as LabelProperties;

// @ts-expect-error
({}) satisfies PropertiesWithMarkConstraint;

labelProperties satisfies PropertiesWithMarkConstraint;
labelProperties satisfies Partial<PropertiesWithMarkConstraint>;

true satisfies ButtonProperties extends PropertiesWithMarkConstraint ? true : false;
true satisfies ButtonProperties extends Partial<PropertiesWithMarkConstraint> ? true : false;

const optionalPanelLocatorProperties = {} as OptionalPanelProperties;

optionalPanelLocatorProperties satisfies Partial<PropertiesWithMarkConstraint>;

false satisfies OptionalPanelProperties extends PropertiesWithMarkConstraint ? true : false;
true satisfies OptionalPanelProperties extends Partial<PropertiesWithMarkConstraint> ? true : false;

const multiLocatorProperties = {} as Mark<MultiLocator>;

multiLocatorProperties satisfies PropertiesWithMarkConstraint;
multiLocatorProperties satisfies Partial<PropertiesWithMarkConstraint>;

true satisfies Mark<MultiLocator> extends PropertiesWithMarkConstraint ? true : false;
true satisfies Mark<MultiLocator> extends Partial<PropertiesWithMarkConstraint> ? true : false;

false satisfies Partial<Mark<MultiLocator>> extends PropertiesWithMarkConstraint ? true : false;
true satisfies Partial<Mark<MultiLocator>> extends Partial<PropertiesWithMarkConstraint>
  ? true
  : false;

export type WrapCreateLocator<Properties extends PropertiesWithMarkConstraint> =
  CreateLocator<Properties>;
export type WrapGetLocatorParameters<Properties extends PropertiesWithMarkConstraint> =
  // @ts-expect-error
  GetLocatorParameters<Properties>;
export type WrapRemoveMarkFromProperties<Properties extends PropertiesWithMarkConstraint> =
  RemoveMarkFromProperties<Properties>;

/**
 * Base tests of PropertiesWithMarkWithParametersConstraint.
 */
export type ModifiedGetLocatorParameters<
  Properties extends PropertiesWithMarkWithParametersConstraint,
> = GetLocatorParameters<Properties>;

// @ts-expect-error
({}) satisfies PropertiesWithMarkWithParametersConstraint;

labelProperties satisfies PropertiesWithMarkWithParametersConstraint;
labelProperties satisfies Partial<PropertiesWithMarkWithParametersConstraint>;

true satisfies ButtonProperties extends PropertiesWithMarkWithParametersConstraint ? true : false;
true satisfies ButtonProperties extends Partial<PropertiesWithMarkWithParametersConstraint>
  ? true
  : false;

optionalPanelLocatorProperties satisfies Partial<PropertiesWithMarkWithParametersConstraint>;

false satisfies OptionalPanelProperties extends PropertiesWithMarkWithParametersConstraint
  ? true
  : false;
true satisfies OptionalPanelProperties extends Partial<PropertiesWithMarkWithParametersConstraint>
  ? true
  : false;

// @ts-expect-error
multiLocatorProperties satisfies PropertiesWithMarkWithParametersConstraint;
// @ts-expect-error
multiLocatorProperties satisfies Partial<PropertiesWithMarkWithParametersConstraint>;

false satisfies MultiLocator extends PropertiesWithMarkWithParametersConstraint ? true : false;
false satisfies MultiLocator extends Partial<PropertiesWithMarkWithParametersConstraint>
  ? true
  : false;

false satisfies Partial<MultiLocator> extends PropertiesWithMarkWithParametersConstraint
  ? true
  : false;
false satisfies Partial<MultiLocator> extends Partial<PropertiesWithMarkWithParametersConstraint>
  ? true
  : false;

export type WrapCreateLocatorWithParameters<
  Properties extends PropertiesWithMarkWithParametersConstraint,
> = CreateLocator<Properties>;

export type WrapGetLocatorParametersWithParameters<
  Properties extends PropertiesWithMarkWithParametersConstraint,
> = GetLocatorParameters<Properties>;

export type WrapRemoveMarkFromPropertiesWithParameters<
  Properties extends PropertiesWithMarkWithParametersConstraint,
> = RemoveMarkFromProperties<Properties>;

/**
 * Base tests of removeMarkFromProperties.
 */
const neverProperties = removeMarkFromProperties(neverValue);

true satisfies IsEqual<typeof neverProperties, unknown>;

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
true satisfies IsEqual<RemoveMarkFromProperties<never>, unknown>;

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
 * Tests of component inheritance (via properties extension).
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

  true satisfies IsEqual<typeof propertiesForEmptyProperties, unknown>;

  // @ts-expect-error
  const propertiesForEmptyObject = removeMarkFromProperties({} as object);

  true satisfies IsEqual<typeof propertiesForEmptyObject, unknown>;

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
      <PanelWithOptionalLocator {...anyLocator()} />
      {/* @ts-expect-error */}
      <PanelWithOptionalLocator {...anyLocator} />
      <PanelWithOptionalLocator {...locator({quux: 'foo'})} />
      <PanelWithOptionalLocator {...locator({quux: 'foo'})} {...propertiesWithAriaInvalid} />
      <Panel {...locator({quux: 'foo'})} />
      {/* @ts-expect-error */}
      <Panel {...locator()} />
      {/* @ts-expect-error */}
      <Link link="foo" {...locator()} />
      {/* @ts-expect-error */}
      <div {...properties} aria-invalid={false}></div>
      <div {...propertiesWithoutLocator} aria-invalid={false}></div>
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

  true satisfies IsEqual<typeof propertiesWithoutLocator, unknown>;

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

/**
 * Tests of optional parameters.
 */
export type ComponentWithRequiredParametersLocator = Locator<
  {foo: {bar: string}; qux: {quux?: string}; corge: Node<{foo: {baz: string}}, {waldo: string}>},
  {baz: string}
>;

export const ComponentWithRequiredParameters = (
  properties: Partial<Mark<ComponentWithRequiredParametersLocator>>,
) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  false satisfies undefined extends typeof locatorParameters ? true : false;

  return (
    <div {...locator({baz: ''})}>
      {/* @ts-expect-error */}
      <div {...locator()}></div>
      <div {...locator(locatorParameters)}></div>
      {/* @ts-expect-error */}
      <div {...locator({bar: ''})}></div>
      {/* @ts-expect-error */}
      <div {...locator({baz: 3})}></div>
      {/* @ts-expect-error */}
      <div {...locator(undefined)}></div>
      {/* @ts-expect-error */}
      <span {...locator.foo()}></span>
      <span {...locator.foo({bar: ''})}></span>
      {/* @ts-expect-error */}
      <span {...locator.foo({baz: ''})}></span>
      <span {...locator.qux()}></span>
      <span {...locator.qux(undefined)}></span>
      <span {...locator.qux({})}></span>
      <span {...locator.qux({quux: ''})}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux({qux: ''})}></span>
      <div {...locator.corge({waldo: ''})}>
        {/* @ts-expect-error */}
        <div {...locator.corge({})}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge(undefined)}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge({bar: ''})}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge({waldo: 3})}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge()}></div>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo()}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo(undefined)}></span>
        <span {...locator.corge.foo({baz: ''})}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo({bar: ''})}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo({baz: 3})}></span>
      </div>
    </div>
  );
};

export type ComponentWithRequiredSymbolParametersLocator = Locator<
  {
    foo: {[SYMBOL]: string};
    qux: {[SYMBOL]?: string};
    corge: Node<{foo: {[SYMBOL]: string}}, {[SYMBOL]: string}>;
  },
  {[SYMBOL]: string}
>;

export const ComponentWithRequiredSymbolParameters = (
  properties: Partial<Mark<ComponentWithRequiredSymbolParametersLocator>>,
) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  false satisfies undefined extends typeof locatorParameters ? true : false;

  return (
    <div {...locator({[SYMBOL]: ''})}>
      {/* @ts-expect-error */}
      <div {...locator()}></div>
      <div {...locator(locatorParameters)}></div>
      {/* @ts-expect-error */}
      <div {...locator({[SYMBOL]: 3})}></div>
      {/* @ts-expect-error */}
      <div {...locator(undefined)}></div>
      {/* @ts-expect-error */}
      <span {...locator.foo()}></span>
      <span {...locator.foo({[SYMBOL]: ''})}></span>
      <span {...locator.qux()}></span>
      <span {...locator.qux(undefined)}></span>
      <span {...locator.qux({})}></span>
      <span {...locator.qux({[SYMBOL]: ''})}></span>
      <div {...locator.corge({[SYMBOL]: ''})}>
        {/* @ts-expect-error */}
        <div {...locator.corge({})}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge(undefined)}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge({[SYMBOL]: 3})}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge()}></div>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo()}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo(undefined)}></span>
        <span {...locator.corge.foo({[SYMBOL]: ''})}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo({[SYMBOL]: 3})}></span>
      </div>
    </div>
  );
};

export type ComponentWithoutRequiredParametersLocator = Locator<
  {foo: {bar?: string}; qux: {quux: string}; corge: Node<{foo: {baz?: string}}, {waldo?: string}>},
  {baz?: string}
>;

export const ComponentWithoutRequiredParameters = (
  properties: Partial<Mark<ComponentWithoutRequiredParametersLocator>>,
) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  true satisfies undefined extends typeof locatorParameters ? true : false;

  return (
    <div {...locator({baz: ''})}>
      <div {...locator()}></div>
      <div {...locator(locatorParameters)}></div>
      {/* @ts-expect-error */}
      <div {...locator({bar: ''})}></div>
      {/* @ts-expect-error */}
      <div {...locator({baz: 3})}></div>
      <div {...locator(undefined)}></div>
      <span {...locator.foo()}></span>
      <span {...locator.foo({bar: ''})}></span>
      {/* @ts-expect-error */}
      <span {...locator.foo({baz: ''})}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux()}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux(undefined)}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux({})}></span>
      <span {...locator.qux({quux: ''})}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux({qux: ''})}></span>
      <div {...locator.corge({waldo: ''})}>
        <div {...locator.corge({})}></div>
        <div {...locator.corge(undefined)}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge({bar: ''})}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge({waldo: 3})}></div>
        <div {...locator.corge()}></div>
        <span {...locator.corge.foo()}></span>
        <span {...locator.corge.foo(undefined)}></span>
        <span {...locator.corge.foo({baz: ''})}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo({bar: ''})}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo({baz: 3})}></span>
      </div>
    </div>
  );
};

export type ComponentWithoutSymbolRequiredParametersLocator = Locator<
  {
    foo: {[SYMBOL]?: string};
    qux: {[SYMBOL]: string};
    corge: Node<{foo: {[SYMBOL]?: string}}, {[SYMBOL]?: string}>;
  },
  {[SYMBOL]?: string}
>;

export const ComponentWithoutSymbolRequiredParameters = (
  properties: Partial<Mark<ComponentWithoutSymbolRequiredParametersLocator>>,
) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  true satisfies undefined extends typeof locatorParameters ? true : false;

  return (
    <div {...locator({[SYMBOL]: ''})}>
      <div {...locator()}></div>
      <div {...locator(locatorParameters)}></div>
      {/* @ts-expect-error */}
      <div {...locator({[SYMBOL]: 3})}></div>
      <div {...locator(undefined)}></div>
      <span {...locator.foo()}></span>
      <span {...locator.foo({[SYMBOL]: ''})}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux()}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux(undefined)}></span>
      {/* @ts-expect-error */}
      <span {...locator.qux({})}></span>
      <span {...locator.qux({[SYMBOL]: ''})}></span>
      <div {...locator.corge({[SYMBOL]: ''})}>
        <div {...locator.corge({})}></div>
        <div {...locator.corge(undefined)}></div>
        {/* @ts-expect-error */}
        <div {...locator.corge({[SYMBOL]: 3})}></div>
        <div {...locator.corge()}></div>
        <span {...locator.corge.foo()}></span>
        <span {...locator.corge.foo(undefined)}></span>
        <span {...locator.corge.foo({[SYMBOL]: ''})}></span>
        {/* @ts-expect-error */}
        <span {...locator.corge.foo({[SYMBOL]: 3})}></span>
      </div>
    </div>
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

const Sublink = (properties: Mark<RenderedLocatorWithOptionalParameters>) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  true satisfies undefined extends typeof locatorParameters ? true : false;

  return (
    <div {...locator({foo: 'bar'})}>
      <span {...locator()}></span>
    </div>
  );
};

type LinkProperties = {link: string} & Mark<Locator<{link: RenderedLocatorWithOptionalParameters}>>;

export const Link = (properties: LinkProperties) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, Locator<{link: RenderedLocatorWithOptionalParameters}>>;
  true satisfies IsEqual<typeof locator, CreateLocator<LinkProperties>>;

  return (
    <span {...locator()}>
      {/* @ts-expect-error */}
      <a {...locator.link()}>Link</a>
      {/* @ts-expect-error */}
      <a {...locator.link({})}>Link</a>
      <Sublink {...locator.link({})} />
      <Sublink {...locator.link()} />
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
