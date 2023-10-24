import type {Attributes} from './types';

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
 * Regexp to split a string by stars.
 */
const starsRegexp = /\*+/;

/**
 * Get CSS selector string for single attribute.
 */
const getAttributeCssSelector = (attributeName: string, attributeValue: string): string => {
  const valueParts = attributeValue.split(starsRegexp);

  if (valueParts.length === 1) {
    return attributeSelectors.exact(attributeName, attributeValue);
  }

  const lastPart = valueParts[valueParts.length - 1]!;

  const startsWithStar = valueParts[0] === '';
  const endsWithStar = lastPart === '';

  if (startsWithStar && endsWithStar && valueParts.length === 2) {
    return attributeSelectors.any(attributeName);
  }

  const cssSelectors: string[] = [];

  if (!startsWithStar) {
    cssSelectors.push(attributeSelectors.startsWith(attributeName, valueParts[0]!));
  }

  for (let index = 1; index < valueParts.length - 1; index += 1) {
    cssSelectors.push(attributeSelectors.contains(attributeName, valueParts[index]!));
  }

  if (!endsWithStar) {
    cssSelectors.push(attributeSelectors.endsWith(attributeName, lastPart));
  }

  return cssSelectors.join('');
};

/**
 * Get CSS selector string from attributes object.
 */
const getCssSelectorFromAttributes = (attributes: Attributes): string => {
  const attributeCssSelectors: string[] = [];

  for (const attributeName of Object.keys(attributes)) {
    const attributeValue = attributes[attributeName]!;
    const cssSelector = getAttributeCssSelector(attributeName, attributeValue);

    attributeCssSelectors.push(cssSelector);
  }

  return attributeCssSelectors.join('');
};

/**
 * Get CSS selector string from attributes chain.
 * This function is convenient to use inside `mapAttributesChain` function.
 */
export const getCssSelectorFromAttributesChain = (
  attributesChain: readonly Attributes[],
): string => {
  const cssSelectors = attributesChain.map(getCssSelectorFromAttributes).filter(Boolean);

  if (cssSelectors.length === 0) {
    return '*';
  }

  return cssSelectors.join(' ');
};
