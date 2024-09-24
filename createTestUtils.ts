import {createSimpleLocator as createLocatorFunction} from './index.js';

import type {
  CreateSelectorFunction,
  CreateTestUtilsOptions,
  LocatorFunction,
  LocatorOperator,
  TestUtils,
} from './types';

/**
 * Creates locator utils for tests (locator operators and `locator` function).
 */
export const createTestUtils = <Locator extends object>({
  attributesOptions,
  createLocatorByCssSelector,
  supportWildcardsInCssSelectors,
}: CreateTestUtilsOptions<Locator>): TestUtils<Locator> => {
  const createAttributes = createLocatorFunction({attributesOptions, isProduction: false});
  const selectorByLocator = new WeakMap<Locator, string>();

  const createLocator = (selector: string): Locator => {
    const locator = createLocatorByCssSelector(selector);

    selectorByLocator.set(locator, selector);

    return locator;
  };

  const locator: LocatorFunction<Locator> = (...args) => {
    const attributes = createAttributes(...(args as [string]));
    const selector = Object.keys(attributes)
      .map((name) => getAttributeCss(name, attributes[name]!, supportWildcardsInCssSelectors))
      .join('');

    return createLocator(selector);
  };

  const createLocatorOperator =
    (createSelector: CreateSelectorFunction): LocatorOperator<Locator> =>
    (...locators) => {
      if (locators.length === 0) {
        throw new Error('Empty argument list');
      }

      const selectors = locators.map((locator) => {
        const selector = selectorByLocator.get(locator);

        if (selector === undefined) {
          throw new Error(`Cannot find selector for locator ${locator} in selectorByLocator map`);
        }

        return selector;
      }) as [string, ...string[]];

      const selector = createSelector(...selectors);

      if (selector === selectors[0]) {
        return locators[0];
      }

      return createLocator(selector);
    };

  const and = createLocatorOperator((...selectors) => selectors.join(''));
  const chain = createLocatorOperator((...selectors) => selectors.join(' '));
  const has = createLocatorOperator((...selectors) => `:has(${selectors.join(', ')})`);
  const not = createLocatorOperator((...selectors) => `:not(${selectors.join(', ')})`);
  const or = createLocatorOperator((...selectors) =>
    selectors.length === 1 ? selectors[0] : `:is(${selectors.join(', ')})`,
  );

  return {and, chain, createLocatorOperator, has, locator, not, or, selectorByLocator};
};

/**
 * Get CSS selector string for single attribute.
 */
const getAttributeCss = (
  name: string,
  value: string,
  supportWildcardsInCssSelectors: boolean,
): string => {
  if (!supportWildcardsInCssSelectors) {
    return attributeSelectors.exact(name, value);
  }

  const valueParts = value.split(asterisksRegex);

  if (valueParts.length === 1) {
    return attributeSelectors.exact(name, value);
  }

  const lastPart = valueParts[valueParts.length - 1]!;

  const startsWithAsterisk = valueParts[0] === '';
  const endsWithAsterisk = lastPart === '';

  if (startsWithAsterisk && endsWithAsterisk && valueParts.length === 2) {
    return attributeSelectors.any(name);
  }

  const cssParts: string[] = [];

  if (!startsWithAsterisk) {
    cssParts.push(attributeSelectors.startsWith(name, valueParts[0]!));
  }

  for (let index = 1; index < valueParts.length - 1; index += 1) {
    cssParts.push(attributeSelectors.contains(name, valueParts[index]!));
  }

  if (!endsWithAsterisk) {
    cssParts.push(attributeSelectors.endsWith(name, lastPart));
  }

  return cssParts.join('');
};

/**
 * Attribute CSS selectors by attribute value inclusion type.
 */
const attributeSelectors = {
  any: (name: string) => `[${name}]`,
  contains: (name: string, value: string) => `[${name}*="${value}"]`,
  endsWith: (name: string, value: string) => `[${name}$="${value}"]`,
  exact: (name: string, value: string) => `[${name}="${value}"]`,
  startsWith: (name: string, value: string) => `[${name}^="${value}"]`,
};

/**
 * Regex to split a string by asterisks.
 */
const asterisksRegex = /\*+/;
