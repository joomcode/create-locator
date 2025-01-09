import {createSimpleLocator} from './index.js';

import type {CreateTestUtilsOptions, LocatorFunction, TestUtils} from './types';

/**
 * Creates locator utils for tests (`locator`, `selector` and `testId` functions).
 */
export const createTestUtils = <Locator>({
  attributesOptions,
  createLocatorByCssSelector,
  supportWildcardsInCssSelectors,
}: CreateTestUtilsOptions<Locator>): TestUtils<Locator> => {
  const {getTestId, locator: createAttributes} = createSimpleLocator({
    attributesOptions,
    isProduction: false,
  });

  const getSelector: LocatorFunction<string> = (...args) => {
    const attributes = createAttributes(...(args as [string]));

    return Object.keys(attributes)
      .map((name) => getAttributeCss(name, attributes[name]!, supportWildcardsInCssSelectors))
      .join('');
  };

  const locator: LocatorFunction<Locator> = (...args) =>
    createLocatorByCssSelector(getSelector(...(args as [string])));

  return {getSelector, getTestId, locator};
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
