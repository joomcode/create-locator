import type {CreateTestUtilsOptions, LocatorFunction, TestUtils} from 'create-locator';

import {createTestUtils} from 'create-locator/createTestUtils';

import {
  attributesOptions,
  createLocatorByCssSelector,
  type IsEqual,
  type Locator,
} from './utils.js';

const {locator, selector, testId} = createTestUtils({
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

true satisfies IsEqual<typeof selector, LocatorFunction<string>>;

true satisfies IsEqual<typeof testId, LocatorFunction<string>>;

locator('foo') satisfies Locator;

selector('foo') satisfies string;

testId('foo') satisfies string;

locator('foo', 'bar') satisfies Locator;

selector('foo', 3, 'bar') satisfies string;

testId(undefined, null, true, 4) satisfies string;

locator('baz', 'qux', {foo: 3, bar: undefined}) satisfies Locator;

selector(undefined, null, true, 4, {foo: true, bar: 13, qux: null}) satisfies string;

// @ts-expect-error
testId(Symbol());

// @ts-expect-error
locator({});

// @ts-expect-error
selector('foo', 'bar', {foo: true}, 'baz');
