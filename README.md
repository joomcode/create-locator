# create-locator 📌

[![NPM version][npm-image]][npm-url]
[![dependencies: none][dependencies-none-image]][dependencies-none-url]
[![minzipped size][size-image]][size-url]
[![code style: prettier][prettier-image]][prettier-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![License MIT][license-image]][license-url]

The `create-locator` 📌 library allows you to mark HTML elements with locators and
find these elements by their locators in tests.

Marking an HTML element with a locator in the application code looks like this (example in JSX):

```tsx
export const Foo = () => {
  return <div {...locator('foo')}>Hello👋 world!</div>;
};
```

In the browser, this element will render into the following DOM structure:

```tsx
<div data-testid="foo">Hello👋 world!</div>
```

In tests you can use locators in this way (example in [Playwright](https://playwright.dev/)):

```tsx
await locator('foo').click();
```

## Install

```sh
npm install create-locator
```

## Usage

The first argument of the locator function is called the locator's `testId`.
Typically, it’s a unique string that allows you to find the element marked by the locator in tests.

The locator can also have an optional set of arbitrary parameters (only the line with the locator is shown):

```tsx
<div {...locator('foo', {bar: 'baz'})}>
```

This element with the locator will render into the following DOM structure:

```tsx
<div data-testid="foo" data-test-bar="baz">
```

The values of the parameters can also be numbers and boolean values:

```tsx
<div {...locator('foo', {bar: true, baz: 12})}>
```

This will render as:

```tsx
<div data-testid="foo" data-test-bar="true" data-test-baz="12">
```

Parameters with `null` and `undefined` values will be omitted:

```tsx
<div {...locator('foo', {bar: null, baz: undefined, qux: false})}>
```

This will render as:

```tsx
<div data-testid="foo" data-test-qux="false">
```

The `testId` of the locator can consist of multiple parts, including numbers and boolean values:

```tsx
<div {...locator('foo', 'qux', 3)}>
```

This will render as:

```tsx
<div data-testid="foo-qux-3">
```

An object with parameters can also follow several parts of the `testId`:

```tsx
<div {...locator('foo', 'qux', 3, {bar: true, baz: 12})}>
```

This will render as:

```tsx
<div data-testid="foo-qux-3" data-test-bar="true" data-test-baz="12">
```

The ability to specify a `testId` composed of multiple parts is useful for dynamic components,
which can accept an optional `testId` string property in their props:

```tsx
type Properties = {testId?: string};

export const Button = ({testId}: Properties) => (
  <label {...locator(testId, 'label')}>
    <button {...locator(testId, 'button')}>{/* ... */}</button>
  </label>
);
```

For example, with `testId="submitButton"`, this will render into the following DOM structure:

```tsx
<label data-testid="submitButton-label">
  <button data-testid="submitButton-button">{/* ... */}</button>
</label>
```

## Initialization

To create `locator` function, first define the attributes options in a separate file
(since you will import them in both your application code and your test code):

```ts
// app/attributesOptions.ts

import type {AttributesOptions} from 'create-locator';

export const attributesOptions: AttributesOptions = {
  parameterAttributePrefix: 'data-test-',
  testIdAttribute: 'data-testid',
  testIdSeparator: '-',
};
```

Then create `locator` function and additional `getTestId` function in application code using these options
and the boolean parameter `isProduction` (if `isProduction` is `true`, no one locator attributes are rendered):

```ts
// app/locator.ts

import {createSimpleLocator} from 'create-locator';
import {attributesOptions} from './attributesOptions';

const isProduction: boolean = /* ... */;

export const {locator, getTestId} = createSimpleLocator({attributesOptions, isProduction});
```

In test code, create `locator` function and additional `getSelector` and `getTestId` functions in a similar manner
(using the example of the [Playwright](https://playwright.dev/),
where `getPage` is the function of getting the current Playwright page):

```ts
// tests/locator.ts

import {createTestLocator} from 'create-locator';
import {attributesOptions} from '../app/attributesOptions';
import {getPage} from './getPage';

export const {locator, getSelector, getTestId} = createTestLocator({
  attributesOptions,
  createLocatorByCssSelector: (selector) => getPage().locator(selector),
  supportWildcardsInCssSelectors: true,
});
```

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
