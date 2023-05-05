# create-locator 📌

[![NPM version][npm-image]][npm-url]
[![dependencies: none][dependencies-none-image]][dependencies-none-url]
[![minzipped size][size-image]][size-url]
[![code style: prettier][prettier-image]][prettier-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![License MIT][license-image]][license-url]

Creates typed (via TypeScript) component locators for unit-tests and e2e-tests.

Locators are marks on components and HTML elements that allow you to find elements in tests.
In the HTML output, locators are usually represented as `data-test-*` attributes.

Locators do not change the behavior or appearance of a component.
In production, locators disappear completely, leaving no attributes.

Passing from a component to its child components, locators form a static typed project locator tree
that is convenient to use in tests. This tree represents a visual blocks of the project
(pages, large blocks on pages, individual elements and controls inside blocks),
which is a simplified version of the project component tree.

Each locator has a unique path in this locator tree, and a string with this **path**
in the some `data-test-*` path attribute allows you to unambiguously find all elements
marked with a specific locator on the rendered HTML page.

## Basic examples

Let's mark the `Foo` component with locators (here are examples on React,
but the markup is independent of the rendering library, and support any rendering in HTML).

Let's imagine that in the `Foo` we want to mark its root HTML element,
its two inner elements (`bar` and `qux`), and its child component `Baz`,
which itself is already marked up:

```tsx
import {createLocator, type Locator} from 'create-locator';
import {Baz, type BazLocator} from 'src/components/Baz';

export type FooLocator = Locator<{ // declare locator type
  bar: {}; // element locator without parameters
  baz: BazLocator; // component locator
  qux: {quux: string}; // element locator with parameters
}>;

type Properties = {···} & FooLocator; // mark component properties with locator type

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

When marking up a root application component, you need to specify a root component locator type,
and a prefix that starts the paths of all locators in this component tree:

```tsx
import {createLocator, type Locator} from 'create-locator';
import {Foo, type FooLocator} from 'src/components/Foo';
import {Main, type MainLocator} from 'src/components/Main';

export type AppLocator = Locator<{
  foo: FooLocator;
  main: MainLocator;
}>;

// create root locator by root component locator type and path prefix
const rootLocator = createLocator<AppLocator>('app');

const App = () => {
  return (
    <>
      <Foo {...rootLocator.foo()} />
      <Main {...rootLocator.main()} />
    </>
  );
};
```

The root locator is always created outside the component, as a singleton
(so as not to be re-created on re-renders).

In addition to the prefix, as the second argument in the root locator
you can specify options for generating attributes from locators.

Here is a complete list of these options with their default values (each can be omitted):

```tsx
// create root locator by root component locator type, path prefix and options
const rootLocator = createLocator<AppLocator>('app', {
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
on component properties and on HTML elements because they will now place by `create-locator` 📌.

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
(`create-locator` 📌 does not correct attribute names in any way by itself).

## Install

Requires [node](https://nodejs.org/en/) version 8 or higher:

```sh
npm install create-locator
```

`create-locator` 📌 works in any environment that supports ES2015 (uses `Proxy` internally).

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
[size-url]: https://bundlephobia.com/
