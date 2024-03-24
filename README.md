# create-locator 📌

[![NPM version][npm-image]][npm-url]
[![dependencies: none][dependencies-none-image]][dependencies-none-url]
[![minzipped size][size-image]][size-url]
[![code style: prettier][prettier-image]][prettier-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![License MIT][license-image]][license-url]

Creates typed (via TypeScript) component locators for unit-tests and e2e-tests.

_Locators_ are marks on components and HTML elements that allow you to find elements in tests.
In the HTML output, locators are usually represented as `data-test*` attributes.

Locators do not change the behavior or appearance of a component.
In production, locators disappear completely, leaving no attributes.

Passing from a component to its child components, locators form a static typed project locator tree
that is convenient to use in tests. This tree represents a visual blocks of the project
(pages, large blocks on pages, individual elements and controls inside blocks),
which is a simplified version of the project component tree. The locator tree is also conveniently
thought of as a tree of interfaces of your product, useful for designers and product managers.

Each locator has a unique path in this locator tree, and a string with this _path_
in the some `data-test*` path attribute allows you to unambiguously find all elements
marked with a specific locator on the rendered HTML page.

## Basic examples

Let's mark the `Foo` component with locators (here are examples on React,
but the markup is independent of the rendering library, and support any rendering in HTML).

Let's imagine that in the `Foo` we want to mark its root HTML element,
its two inner elements (`bar` and `qux`), and its child component `Baz`,
which itself is already marked up:

```tsx
import {createLocator, type Locator, type Mark} from 'create-locator';
import {Baz, type BazLocator} from 'src/components/Baz';

export type FooLocator = Locator<{ // declare locator type
  bar: void; // element locator without parameters
  baz: BazLocator; // child component locator
  qux: {quux: string}; // element locator with parameters
}>;

type Properties = {···} & Mark<FooLocator>; // mark component properties with locator type

const Foo = ({···, ...rest}: Properties) => {
  const locator = createLocator(rest); // create locator by properties or rest of properties

  return (
    <div {...locator()}> {/* mark element with locator */}
      <span {...locator.bar()}>📌</span>
      <Baz {...locator.baz()} /> {/* mark component with locator */}
      <div {...locator.qux({quux: 'corge'})}> {/* mark element with locator with parameters */}
        Hello👋 world!
      </div>
    </div>
  );
};
```

If, imagine, an `Baz` component has no inner elements and no child components,
then its locator can be declared using `void`:

```tsx
export type BazLocator = Locator<void>; // equivalent of Locator<{}>
```

When marking up a root application component, you need to specify a _root_ locator type,
and a _prefix_ that starts the paths of all locators in this component tree:

```tsx
import {createRootLocator, type Locator} from 'create-locator';
import {Foo, type FooLocator} from 'src/components/Foo';
import {Main, type MainLocator} from 'src/components/Main';

export type RootLocator = Locator<{
  foo: FooLocator;
  main: MainLocator;
}>;

// create root locator by root locator type and path prefix
const rootLocator = createRootLocator<RootLocator>('app');

const App = () => {
  return (
    <>
      <Foo {...rootLocator.foo()} />
      <Main {...rootLocator.main()} />
    </>
  );
};
```

The root locator is always created outside the component render function, as a singleton
(so as not to be re-created on re-renders), because all its features and parameters are static
(known even before the code is run).

In addition to the prefix, as the second argument in the root locator
you can specify options for generating attributes from locators.

Here is a complete list of these options with their default values (each can be omitted):

```tsx
// create root locator by root locator type, path prefix and options
const rootLocator = createRootLocator<RootLocator>('app', {
  // if true, then locator attributes will not be rendered at all
  isProduction: false,

  // attribute name prefix with which locator parameters will be rendered into attributes
  parameterAttributePrefix: 'data-test-',

  // attribute to which the unique locator path in the locator tree will be rendered
  pathAttribute: 'data-testid',

  // separator between path parts in a locator path string
  pathSeparator: '-',
});
```

You should not use the `pathAttribute` and attributes starting with `parameterAttributePrefix`
on component properties and on HTML elements because they will now place by the `create-locator` 📌
(usually it's just all `data-test*` attributes).

The `Foo` component defined above and inserted into the `App` has the path `app-foo`
in the locator tree, and therefore, with these default options,
it will be rendered into HTML with such `data-test*` attributes:

```tsx
<div data-testid="app-foo">
  <span data-testid="app-foo-bar">📌</span>
  <Baz data-testid="app-foo-baz" /> {/* that is, the Baz with locator prefix `app-foo-baz` */}
  <div data-testid="app-foo-qux" data-test-quxx="corge">
    Hello👋 world!
  </div>
</div>
```

Remember, that all attribute names in HTML documents get ASCII-lowercased automatically,
so it makes sense to use only lower case for `parameterAttributePrefix`, `pathAttribute`
and `pathSeparator`, and for locator parameter names
(the `create-locator` 📌 does not correct attribute names in any way by itself).

## Install

Requires [node](https://nodejs.org/en/) version 8 or higher and
[TypeScript](https://www.typescriptlang.org/) version 5 or higher:

```sh
npm install create-locator
```

The `create-locator` 📌 works in any environment that supports ES2015 (uses `Proxy` internally).

## Static components

Sometimes in an application, some components are always rendered in the same place,
under the same conditions, and therefore do not have properties
(they simply do not make sense to set properties, because all their properties are known in advance,
they are static).

Such components can therefore be called _static_. For example,
these can be components of individual pages that are rendered not through an insert into the JSX,
but using some kind of router. The root application component can also
be considered an example of a static component.

Static component is located in the locator tree in one place, in a fixed path,
and it don't have parameters (for the same reason it don't have properties). Therefore,
the locator of a static component can also be obtained statically, as a singleton,
outside the component render function (and then it will not be necessary to add properties
to the component just for the sake of marking it with locators):

```tsx
export type MainPageLocator = Locator<{
  ···
}>;

// MainPage is located in the locator tree along a fixed path `rootLocator.mainPage`
const locator = createLocator(rootLocator.mainPage());

// MainPage is a static component without properties
export const MainPage = () => {
  return (
    <div {...locator()}>
      ···
    </div>
  );
};
```

## Optional locators

If the component you need to mark up with locators may not get markup at runtime in some cases,
you can mark the component properties with an optional (partial) locator type
(for example, if this is a public component of your library, whose users may not use locators for testing).

In this case, when marking the component properties with a locator type,
it is enough to wrap the `Mark` with locator type in a standard `Partial` generic:

```tsx
// mark component properties with optional locator type
type Properties = {···} & Partial<Mark<FooLocator>>;
```

The markup code inside the component does not need to be changed, it does not depend on whether
the locator is optional or required. But marking the properties of a component
(which using locators) with at least an optional locator remains mandatory,
the `create-locator` 📌 will check this at the type level.

If there is no locator in the component properties at runtime
(i.e. we render `<Foo />` instead of `<Foo {...rootLocator.foo()} />`), then the locators
inside the `Foo` component (and its children) go into production mode, that is,
they do not add any attributes to properties of components and to HTML elements.

## Locators in unit tests and other test environments

Sometimes we need to render components marked with locators in some test environments —
in unit tests, in Storybook's stories, and so on. There are two ways to do this,
depending on whether or not you need locator attributes on HTML elements
in this environment to find those elements.

If you don't need locator attributes (as in production mode, for example, in Storybook's stories),
you can use the so-called "any locator", which allows you to correctly
(from the point of view of types) mark any component:

```tsx
import {anyLocator} from 'create-locator';
import {Foo} from './Foo';

test('Foo renders correctly', () => {
  render(<Foo {...anyLocator()} />); // renders just like <Foo />
  ···
});
```

If you need locator attributes to find elements (for example, in unit tests),
you can statically create a locator for a component as a standard root locator:

```tsx
import {createRootLocator, type Locator} from 'create-locator';
import {Foo, type FooLocator} from './Foo';

const locator = createRootLocator<FooLocator>('root');

test('Foo renders correctly', () => {
  render(<Foo {...locator()} />); // renders with locator attributes
  ···
});
```

## Map locators to selectors

In the code of tests, we need to obtain element selectors from locators in the form in which
your test framework uses them (for example, in [Playwright](https://playwright.dev/) such selectors
are themselves called [locators](https://playwright.dev/docs/locators)).

For this purpose, the `mapAttributesChain` mapping function is used, which is added to the root locator options in tests:

```tsx
const rootLocator = createRootLocator<RootLocator, Selector>('app', {
  ···
  mapAttributesChain: (attributesChain) => {
    ···

    return selector;
  },
};
```

Here `Selector` is the element selector type used by your test framework (for example,
for [Playwright](https://playwright.dev/) it is the `Locator` type from `'@playwright/test'`).
The `mapAttributesChain` function accepts a chain of attributes (type `readonly Attributes[]`,
where `Attributes` is `Readonly<Record<string, string>>`), and must return a selector of type `Selector`.

The `mapAttributesChain` function is called for a locator received as a chain of calls and reading
child locators from the `rootLocator`, when it is called without parameters, for example:

```tsx
const bazSelector: Selector = rootLocator.foo({qux: 'quux'}).bar.baz();
```

An attribute chain is an array that contains the attribute objects of those locators
for which parameters are specified in the chain, as well as the attribute object
of the locator itself, located at the end of the chain. The order of the attribute objects
in the array corresponds to the order of the locators in the chain — from the root locator
to our locator at the end of the chain (which is called without parameters).

For example, for a chain of locators `rootLocator.foo({qux: 'quux'}).bar.baz()`, the attributes chain
(with the default options of the root locator) will be like this:

```tsx
[{'data-testid': 'app-foo', 'data-test-qux': 'quux'}, {'data-testid': 'app-foo-bar-baz'}];
```

It can be seen that the attribute objects for the `rootLocator` and for the `rootLocator.foo.bar`
are missing here, because no parameters were passed to them (and there is no point in taking
into account parent attribute objects without parameters in the selector, since their `data-testid`
is already included in the `data-testid` of the end locator).

If you need to pass parameters to the end locator, the chain of locators will look like this:

```tsx
const bazSelector: Selector = rootLocator({corge: 'garply'}).foo.bar.baz({grault: 'quux'})();
```

Note the call without parameters at the end of the chain. In a chain of locators with `mapAttributesChain`,
there is a simple rule — calling a locator with parameters returns the same locator
(but with set parameters), and a call without parameters returns the result of calling the `mapAttributesChain`,
that is, a selector, and thus it complete the chain.

For this chain of locators `rootLocator({corge: 'garply'}).foo.bar.baz({grault: 'quux'})()`,
the attributes chain will be like this:

```tsx
[
  {'data-testid': 'app', 'data-test-corge': 'garply'},
  {'data-testid': 'app-foo-bar-baz', 'data-test-grault': 'quux'},
];
```

To get a standard CSS attribute selector from an attributes chain you can use
the `getCssSelectorFromAttributesChain` function exported from a separate entry point
`create-locator/getCssSelectorFromAttributesChain`. For example, for the above attributes chain,
the `getCssSelectorFromAttributesChain` function will return the following CSS selector:

```tsx
`[data-testid="app"][data-test-corge="garply"] [data-testid="app-foo-bar-baz"][data-test-grault="quux"]`;
```

The `getCssSelectorFromAttributesChain` function also supports stars in attribute values (anywhere in an attribute).
For example, an attributes chain `[{'data-testid': 'app', 'data-test-foo': 'bar*'}]`
(derived from a locators chain `rootLocator({foo: 'bar*'})`) would be converted to a CSS selector
`[data-testid="app"][data-test-foo^="bar"]`, which is satisfied by any attribute value starting with `bar`.

The `getCssSelectorFromAttributesChain` function can be used, for example,
in [Playwright](https://playwright.dev/) tests to map locators directly into string CSS selectors,
which can already be passed to the `page.locator` function inside the test:

```tsx
// in test's utility file with definition of `rootLocator`
import {getCssSelectorFromAttributesChain} from 'create-locator/getCssSelectorFromAttributesChain';

···

// `string`, because `getCssSelectorFromAttributesChain` returns `string`
const rootLocator = createLocator<RootLocator, string>('app', {
  ···
  mapAttributesChain: getCssSelectorFromAttributesChain,
};

// in some file with tests
test('Some test', async ({page}) => {
  const bazSelector = rootLocator.foo.bar.baz();

  await page.locator(bazSelector).click();

  ···
});

```

## Production entry point

The _production mode_ is enabled using the `isProduction` field in the options on the root locator
(this is a mode in which the `create-locator` 📌 does not add any attributes to
properties of components and to HTML elements).

But you can also use a separate `create-locator/production` entry point to build
your application in production (for example, replacing the `create-locator` in production with the
`create-locator/production` using the [resolve.alias](https://webpack.js.org/configuration/resolve/#resolvealias)
setting or other similar settings of your bundler).

The `create-locator/production` entry point has exactly the same API as the `create-locator`
(including exported types), but all functions exported from `create-locator/production` already work
in production mode (and only in it, so **try not to mix imports** from `create-locator/production`
and from `create-locator` in one build).

The `create-locator/production` entry point is about five times smaller than the `create-locator`
(less than 500 bytes after minification), and the functions from it do not consume CPU and memory resources.

If you cannot change the entry point in a production build to `create-locator/production`,
but want to minimize the impact of locators on the application's performance (in production),
you can use the `setGlobalProductionMode` function.

This function must be called before creating the root locator:

```tsx
import {createLocator, type Locator, setGlobalProductionMode} from 'create-locator';

···

if (IS_PRODUCTION) {
  setGlobalProductionMode();
}

const rootLocator = createRootLocator<RootLocator>('app', {
  isProduction: IS_PRODUCTION,
  ···
});
```

After calling the `setGlobalProductionMode` function, all other functions from the public API
(`createLocator`, `getLocatorParameters` and `removeMarkFromProperties`) will work in production mode,
regardless of the `isProduction` option of root locator, as if they were imported from the `create-locator/production`.
In this mode, functions work as quickly as possible, because they do not look for the parent locator
in the component properties, but immediately return the necessary universal production values.

Note that the `setGlobalProductionMode` function modifies the global state in this way.

## Using HTML attributes as component properties

In some rare cases, we want to allow a component to accept any properties (attributes)
of some HTML element — for example, to have component `Button` accept any attributes
of the `button` element (usually via `JSX.IntrinsicElements`):

```tsx
export type ButtonLocator = Locator<···>;

// component Button accepts any properties of the button element
type ButtonProperties = BaseButtonProperties &
  JSX.IntrinsicElements['button'] &
  Mark<ButtonLocator>;
```

With these types of component properties, the `create-locator` 📌 will treat the `Button` component
as an HTML element, and this will lead to type errors when marking the `Button` with locator
(because you cannot mark HTML element with component locator).

Specifically, you'll get a warning error when using component properties in an `createLocator`,
`getLocatorParameters`, and `removeMarkFromProperties` functions with text like this:
`'This component behaves like an element; use LocatorOfElement for it'`.

To avoid all these errors, use `LocatorOfElement` instead of `Locator` when declaring
a locator type for such components (the API of these generics is completely the same):

```tsx
import {type LocatorOfElement, ···} from 'create-locator';

···

export type ButtonLocator = LocatorOfElement<···>;

// component Button accepts any properties of the button element
type ButtonProperties = BaseButtonProperties &
  JSX.IntrinsicElements['button'] &
  Mark<ButtonLocator>;
```

## Thanks

Inspired by ideas from the package [chain-id](https://www.npmjs.com/package/chain-id)
and from its author [leutsky](https://github.com/leutsky) ✨.

## License

[MIT][license-url]

[conventional-commits-image]: https://img.shields.io/badge/Conventional_Commits-1.0.0-yellow.svg 'The Conventional Commits specification'
[conventional-commits-url]: https://www.conventionalcommits.org/en/v1.0.0/
[dependencies-none-image]: https://img.shields.io/badge/dependencies-none-success.svg 'No dependencies'
[dependencies-none-url]: https://github.com/joomcode/create-locator/blob/main/package.json
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg 'The MIT License'
[license-url]: LICENSE
[npm-image]: https://img.shields.io/npm/v/create-locator.svg 'create-locator'
[npm-url]: https://www.npmjs.com/package/create-locator
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg 'Prettier code formatter'
[prettier-url]: https://prettier.io/
[size-image]: https://img.shields.io/bundlephobia/minzip/create-locator 'create-locator'
[size-url]: https://bundlephobia.com/package/create-locator
