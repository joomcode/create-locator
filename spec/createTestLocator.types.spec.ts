import type {CreateTestLocatorOptions, LocatorFunction, LocatorKit} from 'create-locator';

import {createTestLocator} from 'create-locator/createTestLocator';

import {
  attributesOptions,
  createLocatorByCssSelector,
  type IsEqual,
  type Locator,
} from './utils.js';

const {getSelector, getTestId, locator} = createTestLocator({
  attributesOptions,
  createLocatorByCssSelector,
  supportWildcardsInCssSelectors: true,
} satisfies CreateTestLocatorOptions<Locator>) satisfies LocatorKit<Locator>;

// @ts-expect-error
createTestLocator({attributesOptions, createLocatorByCssSelector});

// @ts-expect-error
createTestLocator({attributesOptions, supportWildcardsInCssSelectors: true});

createTestLocator({
  // @ts-expect-error
  attributesOptions: {},
  createLocatorByCssSelector,
  supportWildcardsInCssSelectors: true,
});

true satisfies IsEqual<typeof locator, LocatorFunction<Locator>>;

true satisfies IsEqual<typeof getSelector, LocatorFunction<string>>;

true satisfies IsEqual<typeof getTestId, LocatorFunction<string>>;

locator('foo') satisfies Locator;

getSelector('foo') satisfies string;

getTestId('foo') satisfies string;

locator('foo', 'bar') satisfies Locator;

getSelector('foo', 3, 'bar') satisfies string;

getTestId(undefined, null, true, 4) satisfies string;

locator('baz', 'qux', {foo: 3, bar: undefined}) satisfies Locator;

getSelector(undefined, null, true, 4, {foo: true, bar: 13, qux: null}) satisfies string;

// @ts-expect-error
getTestId(Symbol());

// @ts-expect-error
locator({});

// @ts-expect-error
getSelector('foo', 'bar', {foo: true}, 'baz');
