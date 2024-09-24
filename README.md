# create-locator 📌

[![NPM version][npm-image]][npm-url]
[![dependencies: none][dependencies-none-image]][dependencies-none-url]
[![minzipped size][size-image]][size-url]
[![code style: prettier][prettier-image]][prettier-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![License MIT][license-image]][license-url]

The `create-locator` 📌 library allows you to mark HTML elements with locators and
find these elements by their locators in tests.

Marking an HTML element with a locator in the application code looks like this (in the JSX example):

```tsx
export const Foo = () => {
  return <div {...locator('foo')}>Hello👋 world! 📌</div>;
};
```

In the browser, this element will render into the following DOM structure:

```tsx
<div data-testid="foo">Hello👋 world! 📌</div>
```

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
type Properties = {..., testId?: string};

export const Button = ({..., testId}: Properties) => (
  <label {...locator(testId, 'label')}>
    <button {...locator(testId, 'button')}>{/* ... */}</button>
  </label>
)
```

For example, with `testId="submitButton"`, this will render into the following DOM structure:

```tsx
<label data-testid="submitButton-label">
  <button data-testid="submitButton-button">{/* ... */}</button>
</label>
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
