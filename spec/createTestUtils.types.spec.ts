import type {
  CreateTestUtilsOptions,
  LocatorFunction,
  LocatorOperator,
  TestUtils,
} from 'create-locator';

import {createTestUtils} from 'create-locator/createTestUtils';

import {
  attributesOptions,
  createLocatorByCssSelector,
  type IsEqual,
  type Locator,
} from './utils.js';

const {and, chain, createLocatorOperator, has, locator, not, or, selectorByLocator} =
  createTestUtils({
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

true satisfies IsEqual<typeof and, LocatorOperator<Locator>>;

true satisfies IsEqual<typeof chain, LocatorOperator<Locator>>;

true satisfies IsEqual<typeof has, LocatorOperator<Locator>>;

true satisfies IsEqual<typeof not, LocatorOperator<Locator>>;

true satisfies IsEqual<typeof or, LocatorOperator<Locator>>;

locator('foo') satisfies Locator;

true satisfies IsEqual<typeof selectorByLocator, WeakMap<Locator, string>>;

const locatorOperator = createLocatorOperator((...selectors) => selectors.join(', '));

true satisfies IsEqual<typeof locatorOperator, LocatorOperator<Locator>>;

// @ts-expect-error
createLocatorOperator((...selectors) => selectors);

const fooLocator: Locator = locator('foo');
const barLocator: Locator = locator('bar', {});
const bazLocator: Locator = locator('baz', 'qux', {foo: 3});

or(fooLocator) satisfies Locator;
or(fooLocator, barLocator) satisfies Locator;
or(fooLocator, barLocator, bazLocator) satisfies Locator;

// @ts-expect-error
or();

// @ts-expect-error
or(undefined);

// @ts-expect-error
or(null);

// @ts-expect-error
or({});
