import {createLocator, type Locator, type Node} from '../index';

declare global {
  const React: object;

  namespace JSX {
    export interface IntrinsicElements {
      div: {};
      h1: {};
      main: {};
      span: {};
    }
  }
}

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
  Node<{}, {foo: {}}>,
  // @ts-expect-error
  Node<{foo: {bar: 3}}>,
  // @ts-expect-error
  Node<{}, {foo: L1}>,
];

type LabelLocator = Locator<{}, {level: string}>;
type LabelProps = {level?: string; text: string} & LabelLocator;

const Label = ({level, text, ...rest}: LabelProps) => {
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

const Multi = (props: MultiLocator) => {
  const locator = createLocator(props);

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
  foo: LabelLocator;
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

const Header = (props: HeaderLocator) => {
  const locator = createLocator(props);

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
    </h1>
  );
};

const Wrapper = (props: HeaderLocator) => {
  const locator = createLocator(props);

  return (
    <div>
      {/* @ts-expect-error */}
      <Header {...locator} />
      {/* @ts-expect-error */}
      <Header {...locator.foo} />
      {/* @ts-expect-error */}
      <Header {...locator.foo()} />
      <Header {...locator()} />
    </div>
  );
};

type RenderedLocator = Locator<{
  header: HeaderLocator;
}>;

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

type MainLocator = Locator<
  {header: HeaderLocator; rendered: RenderedLocator; text: {value?: string}},
  {text: 'foo' | 'bar'}
>;
type MainProps = {render: Function} & MainLocator;

const Main = ({render, ...rest}: MainProps) => {
  const locator = createLocator(rest);

  locator.rendered;
  const rendered = render();

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
    </main>
  );
};

const MainWrapper = (props: MainLocator) => {
  const locator = createLocator(props);

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

type Selector = {isSelector: true};

const locator = createLocator<AppLocator, Selector>('app', {
  isProduction: true,
  locatorAttribute: 'data-testid',
  mapAttributes() {
    return {} as Selector;
  },
  pathDelimiter: '.',
  parameterAttributePrefix: 'data-test-',
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

locator() satisfies Selector;
locator.main({text: 'foo'}) satisfies Selector;
locator.main.header.alsosubtree.corge({bar: 'foo'}) satisfies Selector;
locator.main.header.alsosubtree.corge.garply() satisfies Selector;

// @ts-expect-error
locator.main.header.header;

// @ts-expect-error
locator.main.header.alsosubtree.corge({bar: 'baz'});
