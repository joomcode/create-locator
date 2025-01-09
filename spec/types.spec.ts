import {createSimpleLocator} from 'create-locator';

import type {
  Attributes,
  AttributesOptions,
  CreateLocatorOptions,
  LocatorFunction,
} from 'create-locator';

import {attributesOptions, type IsEqual} from './utils.js';

createSimpleLocator({attributesOptions, isProduction: true});

{
  const {locator} = createSimpleLocator({attributesOptions, isProduction: false});

  true satisfies IsEqual<string & keyof typeof locator, never>;
}

attributesOptions satisfies AttributesOptions;

// @ts-expect-error
createSimpleLocator({attributesOptions, isProduction: 3});

// @ts-expect-error
createSimpleLocator({attributesOptions: {}, isProduction: false});

// @ts-expect-error
createSimpleLocator({attributesOptions});

// @ts-expect-error
createSimpleLocator({isProduction: false});

const {locator} = createSimpleLocator({
  attributesOptions,
  isProduction: true,
} satisfies CreateLocatorOptions);

true satisfies IsEqual<typeof locator, LocatorFunction>;

// @ts-expect-error
locator();

// @ts-expect-error
locator({});

locator('') satisfies Attributes;

locator(null);

locator(undefined) satisfies Attributes;

locator('foo') satisfies Attributes;

locator('foo', null);

// @ts-expect-error
locator('foo', Symbol());

locator('bar', {foo: ''}) satisfies Attributes;

locator('bar', {foo: 3});

locator('bar', {foo: true});

// @ts-expect-error
locator('bar', {foo: Symbol()});

locator('baz', {qux: ''}) satisfies Attributes;

// @ts-expect-error
locator({foo: ''});

// @ts-expect-error
locator({qux: 3});

locator('foo', {length: true, name: 3});

locator('foo', 'bar') satisfies Attributes;

locator('foo', 'bar', 'baz') satisfies Attributes;

locator('foo', undefined, 'baz') satisfies Attributes;

locator('foo', null, 'baz') satisfies Attributes;

// @ts-expect-error
locator(Symbol(), null, 'baz') satisfies Attributes;

locator('foo', undefined, {foo: 3}) satisfies Attributes;

locator('foo', 'baz', {foo: 'qux'}) satisfies Attributes;

locator('foo', 'bar', 'baz', {foo: true}) satisfies Attributes;

locator('foo', 'bar', 'baz', {foo: undefined});

// @ts-expect-error
locator('foo', 'bar', 'baz', {foo: Symbol()});

locator('foo', 'bar', 'baz', {foo: null});

// @ts-expect-error
locator('foo', 'bar', {foo: true}, 'baz');
