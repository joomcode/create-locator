import {
  createLocator,
  type CreateLocator,
  getLocatorParameters,
  type GetLocatorParameters,
  type Locator,
  type Node,
  type PropertiesWithLocator,
  type PropertiesWithLocatorWithParameters,
  removeLocatorFromProperties,
  type RemoveLocatorFromProperties,
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
];

// @ts-expect-error
const locatorForEmptyProperties = createLocator({});

locatorForEmptyProperties satisfies object;

const propertiesWithAriaInvalid = {} as {'aria-invalid': AriaInvalidValue};

/**
 * Base tests of component, element and node locator.
 */
export type LabelLocator = Locator<{}, {level: string}>;
export type LabelProperties = {level?: string; text: string} & LabelLocator;

const Label = ({level, text, ...rest}: LabelProperties) => {
  const locator = createLocator(rest);
  const levelString = String(level);

  // @ts-expect-error
  createLocator();

  // @ts-expect-error
  createLocator({});

  // @ts-expect-error
  createLocator({} as object);

  // @ts-expect-error
  createLocator({} as {foo: string});

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
      <Label text="bar" {...locator.label({level: 'foo'})} {...propertiesWithAriaInvalid} />
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

type HeaderProperties = {foo?: number} & HeaderLocator;

const Header = ({foo, ...rest}: HeaderProperties) => {
  const locator = createLocator(rest);

  // @ts-expect-error
  locator.foo = {} as unknown as any;

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

  true satisfies IsEqual<typeof locator, CreateLocator<MainLocator>>;
  true satisfies IsEqual<typeof locator, CreateLocator<MainProperties>>;
  true satisfies IsEqual<typeof locator, CreateLocator<Partial<MainLocator>>>;
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

export const App = () => {
  const locatorByProperties = createLocator({} as AppLocator);

  true satisfies IsEqual<typeof appLocator, typeof locatorByProperties>;

  // @ts-expect-error
  createLocator<Partial<AppLocator>>('app');

  // @ts-expect-error
  createLocator<AppLocator>();

  // @ts-expect-error
  createLocator<AppLocator>({});

  const render = () => {
    // @ts-expect-error
    createLocator<RenderedLocator>();

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

// @ts-expect-error
createLocator<AppLocator, Selector>('app');
// @ts-expect-error
createLocator<AppLocator, Selector>('app', {});
// @ts-expect-error
createLocator<AppLocator, Selector>('app', {mapAttributes() {}});

declare const mapAttributesToNever: () => never;

const mappedToNeverLocator = createLocator<AppLocator, never>('app', {
  mapAttributes: mapAttributesToNever,
});

mappedToNeverLocator.header() satisfies never;

const mapAttributes = (attributes: {}) => attributes as Selector;

// @ts-expect-error
createLocator<Partial<AppLocator>, Selector>('app', {mapAttributes});

createLocator<AppLocator, Selector>('app', {mapAttributes});

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
export type RootLocatorVariable = CreateLocator<AppLocator, Selector>;

// @ts-expect-error
Object satisfies CreateLocator<{}>;

// @ts-expect-error
Object satisfies CreateLocator<object>;

// @ts-expect-error
export type ConvertTypes<SomeLocator> = CreateLocator<SomeLocator>;

true satisfies IsEqual<typeof rootLocator, RootLocatorVariable>;

true satisfies IsEqual<never, CreateLocator<Partial<AppLocator>, Selector>>;

declare const mappedToBigint: CreateLocator<Locator<{foo: {}}>, bigint>;

mappedToBigint.foo() satisfies bigint;

declare const mappedToNever: CreateLocator<Locator<{foo: {}}>, never>;

mappedToNever.foo() satisfies never;

declare const mappedWithLocatorToNever: CreateLocator<Locator<{foo: Locator<{}>}>, never>;

mappedWithLocatorToNever.foo() satisfies never;

true satisfies IsEqual<typeof appLocator, CreateLocator<AppLocator>>;
true satisfies IsEqual<typeof appLocator, CreateLocator<Partial<AppLocator>>>;

/**
 * Base tests of getLocatorParameters.
 */
type BannerParameters = {id: `id${string}`; [SYMBOL]?: number};
type BannerLocator = Locator<{text: {}}, BannerParameters>;

export const Banner = (properties: BannerLocator) => {
  const locator = createLocator(properties);
  const locatorParameters = getLocatorParameters(properties);

  true satisfies IsEqual<typeof locatorParameters, BannerParameters>;
  true satisfies IsEqual<typeof locatorParameters, GetLocatorParameters<typeof properties>>;

  type LocatorWithEmptyParameters = Locator<{foo: {}}, {}>;

  // @ts-expect-error
  Object satisfies GetLocatorParameters<LocatorWithEmptyParameters>;

  const propertiesWithEmptyParameters = {} as LocatorWithEmptyParameters;
  const locatorWithEmptyParameters = createLocator(propertiesWithEmptyParameters);

  // @ts-expect-error
  getLocatorParameters(propertiesWithEmptyParameters);

  // @ts-expect-error
  getLocatorParameters();

  // @ts-expect-error
  getLocatorParameters({foo: 2});

  locatorWithEmptyParameters();

  // @ts-expect-error
  locatorWithEmptyParameters({});

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

export const RenderedBanner = (properties: RenderedLocator) => {
  const locator = createLocator(properties);
  // @ts-expect-error
  const locatorParameters = getLocatorParameters(properties);

  // @ts-expect-error
  Object satisfies GetLocatorParameters<typeof properties>;

  const optionalProperties = {} as Partial<RenderedLocator>;

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
true satisfies IsEqual<BannerParameters, GetLocatorParameters<BannerLocator>>;
true satisfies IsEqual<BannerParameters, GetLocatorParameters<Partial<BannerLocator>>>;

// @ts-expect-error
Object satisfies GetLocatorParameters<{foo: ''}>;

/**
 * Base tests of PropertiesWithLocator.
 */
const labelProperties = {} as LabelProperties;

// @ts-expect-error
({}) satisfies PropertiesWithLocator;

labelProperties satisfies PropertiesWithLocator;
labelProperties satisfies Partial<PropertiesWithLocator>;

true satisfies ButtonProperties extends PropertiesWithLocator ? true : false;
true satisfies ButtonProperties extends Partial<PropertiesWithLocator> ? true : false;

const optionalPanelLocatorProperties = {} as OptionalPanelLocator;

optionalPanelLocatorProperties satisfies Partial<PropertiesWithLocator>;

false satisfies OptionalPanelLocator extends PropertiesWithLocator ? true : false;
true satisfies OptionalPanelLocator extends Partial<PropertiesWithLocator> ? true : false;

const multiLocatorProperties = {} as MultiLocator;

multiLocatorProperties satisfies PropertiesWithLocator;
multiLocatorProperties satisfies Partial<PropertiesWithLocator>;

true satisfies MultiLocator extends PropertiesWithLocator ? true : false;
true satisfies MultiLocator extends Partial<PropertiesWithLocator> ? true : false;

false satisfies Partial<MultiLocator> extends PropertiesWithLocator ? true : false;
true satisfies Partial<MultiLocator> extends Partial<PropertiesWithLocator> ? true : false;

export type WrapCreateLocator<Properties extends PropertiesWithLocator> = CreateLocator<Properties>;
export type WrapGetLocatorParameters<Properties extends PropertiesWithLocator> =
  // @ts-expect-error
  GetLocatorParameters<Properties>;
export type WrapRemoveLocatorFromProperties<Properties extends PropertiesWithLocator> =
  RemoveLocatorFromProperties<Properties>;

/**
 * Base tests of PropertiesWithLocatorWithParameters.
 */
// @ts-expect-error
({}) satisfies PropertiesWithLocatorWithParameters;

labelProperties satisfies PropertiesWithLocatorWithParameters;
labelProperties satisfies Partial<PropertiesWithLocatorWithParameters>;

true satisfies ButtonProperties extends PropertiesWithLocatorWithParameters ? true : false;
true satisfies ButtonProperties extends Partial<PropertiesWithLocatorWithParameters> ? true : false;

optionalPanelLocatorProperties satisfies Partial<PropertiesWithLocatorWithParameters>;

false satisfies OptionalPanelLocator extends PropertiesWithLocatorWithParameters ? true : false;
true satisfies OptionalPanelLocator extends Partial<PropertiesWithLocatorWithParameters>
  ? true
  : false;

// @ts-expect-error
multiLocatorProperties satisfies PropertiesWithLocatorWithParameters;
// @ts-expect-error
multiLocatorProperties satisfies Partial<PropertiesWithLocatorWithParameters>;

false satisfies MultiLocator extends PropertiesWithLocatorWithParameters ? true : false;
false satisfies MultiLocator extends Partial<PropertiesWithLocatorWithParameters> ? true : false;

false satisfies Partial<MultiLocator> extends PropertiesWithLocatorWithParameters ? true : false;
false satisfies Partial<MultiLocator> extends Partial<PropertiesWithLocatorWithParameters>
  ? true
  : false;

export type WrapCreateLocatorWithParameters<
  Properties extends PropertiesWithLocatorWithParameters,
> = CreateLocator<Properties>;

export type WrapGetLocatorParametersWithParameters<
  Properties extends PropertiesWithLocatorWithParameters,
> = GetLocatorParameters<Properties>;

export type WrapRemoveLocatorFromPropertiesWithParameters<
  Properties extends PropertiesWithLocatorWithParameters,
> = RemoveLocatorFromProperties<Properties>;

/**
 * Base tests of removeLocatorFromProperties.
 */
type ButtonLocator = Locator<{bar: {}}, {type: string}>;
type ButtonOwnProperties = {[SYMBOL]: bigint; foo?: number; bar: boolean};
type ButtonProperties = ButtonLocator & {children: unknown} & ButtonOwnProperties;
type ButtonOwnPropertiesWithReadonly = {foo?: 'baz'; readonly bar: boolean};

export const Button = ({children, ...restProps}: ButtonProperties) => {
  const locator = createLocator(restProps);
  const restPropertiesWithoutLocator = removeLocatorFromProperties(restProps);

  true satisfies IsEqual<ButtonOwnProperties, typeof restPropertiesWithoutLocator>;

  const properties = {} as ButtonLocator & ButtonOwnPropertiesWithReadonly;
  const propertiesWithoutLocator = removeLocatorFromProperties(properties);

  true satisfies IsEqual<
    RemoveLocatorFromProperties<typeof properties>,
    typeof propertiesWithoutLocator
  >;
  true satisfies IsEqual<ButtonOwnPropertiesWithReadonly, typeof propertiesWithoutLocator>;

  const locatorWithFullProperties = createLocator(properties);
  // @ts-expect-error
  const locatorByPropertiesWithoutLocator = createLocator(propertiesWithoutLocator);

  true satisfies IsEqual<ButtonOwnPropertiesWithReadonly, typeof propertiesWithoutLocator>;

  // @ts-expect-error
  const locatorWithoutType = createLocator(restPropertiesWithoutLocator);

  // @ts-expect-error
  createLocator({} as unknown as {[SYMBOL]: 'bar'});

  true satisfies IsEqual<typeof locatorForEmptyProperties, typeof locatorWithoutType>;

  return (
    <button {...locator({type: 'foo'})}>
      {/* @ts-expect-error */}
      <label {...restProps}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithoutType}>{children}</label>
      <label {...locatorWithoutType()}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithoutType.bar()}>{children}</label>
      <label {...locatorWithFullProperties({type: 'qux'})}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorWithFullProperties()}>{children}</label>
      <label {...locatorByPropertiesWithoutLocator()}>{children}</label>
      {/* @ts-expect-error */}
      <label {...locatorByPropertiesWithoutLocator({type: 'qux'})}>{children}</label>
      <label {...locator.bar()}>{children}</label>
    </button>
  );
};

/**
 * Base tests of RemoveLocatorFromProperties.
 */
true satisfies RemoveLocatorFromProperties<ButtonProperties> extends ButtonOwnProperties
  ? true
  : false;

false satisfies ButtonOwnProperties extends RemoveLocatorFromProperties<ButtonProperties>
  ? true
  : false;

// @ts-expect-error
({foo: ''}) satisfies RemoveLocatorFromProperties<{foo: string}>;

/**
 * Base tests of component inheritance (via properties extension).
 */

export const ButtonWithoutLocator = (properties: ButtonOwnProperties & {children: unknown}) => {
  // @ts-expect-error
  return <button {...properties}></button>;
};

type LogButtonLocator = Locator<{button: ButtonLocator; close: Record<never, string>}>;
type LogButtonProperties = ButtonProperties & {namespace: string} & LogButtonLocator;

export const LogButton = ({namespace, ...rest}: LogButtonProperties) => {
  // @ts-expect-error
  const locator = createLocator(rest);

  // @ts-expect-error
  getLocatorParameters(rest);

  // @ts-expect-error
  removeLocatorFromProperties(rest);

  console.log(namespace);

  return (
    <>
      {/* TODO: should be an error */}
      <Button {...rest} />
      {/* @ts-expect-error */}
      <Button {...locator.button()} {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator.button()} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator()} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator} />
      <ButtonWithoutLocator {...rest} />
    </>
  );
};

type ClearedLogButtonProperties = RemoveLocatorFromProperties<ButtonProperties> & {
  namespace: string;
} & LogButtonLocator;

export const ClearedLogButton = ({namespace, ...rest}: ClearedLogButtonProperties) => {
  const locator = createLocator(rest);

  console.log(namespace);

  return (
    <>
      <Button {...rest} {...locator.button({type: 'foo'})} />
      {/* @ts-expect-error */}
      <Button {...locator.button({type: 'foo'})} {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator()} />
      {/* @ts-expect-error */}
      <Button {...rest} {...locator} />
      <ButtonWithoutLocator {...rest} />
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

createLocator({} as RenderedLocatorWithSymbolProperty);

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

  const propertiesWithSymbol = {} as RenderedLocatorWithSymbolProperty & {[SYMBOL]: number};

  createLocator(propertiesWithSymbol);

  const propertiesWithoutLocator = removeLocatorFromProperties(propertiesWithSymbol);

  // @ts-expect-error
  createLocator(propertiesWithoutLocator);

  return <div {...locator({})}></div>;
};

const RenderedWithOtherOptionalParameters = (
  properties: RenderedLocatorWithOtherOptionalParameters,
) => {
  const locator = createLocator(properties);

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

const Panel = (properties: PanelLocator) => {
  const locator = createLocator(properties);

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

const PanelWithParameters = (properties: PanelWithParametersLocator) => {
  const locator = createLocator(properties);

  return <div {...locator({foo: 'bar'})}></div>;
};

const panelWithParametersProperties = {} as PanelWithParametersLocator & SomeProperties;
const optionalPanelWithParametersProperties = {} as Partial<PanelWithParametersLocator> &
  SomeProperties;

const panelParameters = getLocatorParameters(panelWithParametersProperties);
const optionalPanelParameters = getLocatorParameters(optionalPanelWithParametersProperties);

true satisfies IsEqual<typeof panelParameters, typeof optionalPanelParameters>;

const locatorWithParameters = createLocator(panelWithParametersProperties);
const optionalLocatorWithParameters = createLocator(optionalPanelWithParametersProperties);

true satisfies IsEqual<typeof locatorWithParameters, typeof optionalLocatorWithParameters>;
false satisfies IsEqual<typeof locatorWithParameters, typeof locatorForEmptyProperties>;

const panelWithParametersPropertiesWithoutLocator = removeLocatorFromProperties(
  panelWithParametersProperties,
);
const optionalPanelWithParametersPropertiesWithoutLocator = removeLocatorFromProperties(
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
type OptionalPanelLocator = Partial<{qux: string} & PanelLocator>;

const panelProperties = {} as PanelLocator;

const panelLocator = createLocator(panelProperties);

const PanelWithOptionalLocator = (properties: OptionalPanelLocator) => {
  const locator = createLocator(properties);

  true satisfies IsEqual<typeof locator, typeof panelLocator>;
  false satisfies IsEqual<typeof locator, typeof locatorForEmptyProperties>;

  const propertiesWithoutLocator = removeLocatorFromProperties(properties);

  false satisfies IsEqual<typeof properties, typeof propertiesWithoutLocator>;

  const parameters = getLocatorParameters(panelProperties);
  const parametersWithOptionalLocator = getLocatorParameters(properties);

  const someProperties = {} as {foo: 'bar'};
  const somePropertiesWithSymbol = {} as typeof someProperties & {[SYMBOL]: 'baz'};

  // @ts-expect-error
  createLocator(someProperties);
  // @ts-expect-error
  createLocator(somePropertiesWithSymbol);
  // @ts-expect-error
  createLocator(propertiesWithoutLocator);

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
  const propertiesForEmptyProperties = removeLocatorFromProperties({});

  // @ts-expect-error
  removeLocatorFromProperties({} as object);

  // @ts-expect-error
  removeLocatorFromProperties(someProperties);
  // @ts-expect-error
  removeLocatorFromProperties(somePropertiesWithSymbol);
  // @ts-expect-error
  removeLocatorFromProperties(propertiesWithoutLocator);

  true satisfies IsEqual<typeof parameters, typeof parametersWithOptionalLocator>;

  true satisfies IsEqual<typeof parametersForEmptyProperties, {}>;
  true satisfies IsEqual<typeof propertiesForEmptyProperties, {}>;

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
  // @ts-expect-error
  const locatorForObjectType = createLocator({} as object);

  true satisfies IsEqual<typeof locator, typeof locatorForEmptyProperties>;
  true satisfies IsEqual<typeof locatorForObjectType, typeof locatorForEmptyProperties>;

  // @ts-expect-error
  const propertiesWithoutLocator = removeLocatorFromProperties(properties);

  true satisfies IsEqual<typeof properties, typeof propertiesWithoutLocator>;

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
    <PanelWithoutLocator {...locatorForEmptyProperties()} />
  </>
);

// @ts-expect-error
export type TextAreaLocator = Partial<Locator<{button: Partial<Locator<{}>>; input: {}}>>;
