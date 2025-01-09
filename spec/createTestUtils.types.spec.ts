import type {CreateTestUtilsOptions, LocatorFunction, TestUtils} from 'create-locator';

import {createTestUtils} from 'create-locator/createTestUtils';

import {
  attributesOptions,
  createLocatorByCssSelector,
  type IsEqual,
  type Locator,
} from './utils.js';

const {getSelector, getTestId, locator} = createTestUtils({
  attributesOptions,
  createLocatorByCssSelector,
  supportWildcardsInCssSelectors: true,
} satisfies CreateTestUtilsOptions<Locator>) satisfies TestUtils<Locator>;

// @ts-expect-error
createTestUtils({attributesOptions, createLocatorByCssSelector});

// @ts-expect-error
createTestUtils({attributesOptions, supportWildcardsInCssSelectors: true});

createTestUtils({
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
