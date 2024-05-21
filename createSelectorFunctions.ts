import type {CreateSelectorFunctionsFunction, Parameters, Target} from './types';

/**
 * Creates `createLocatorInTests` and `findAnyOfSelectors` functions by `createSelector` function.
 */
export const createSelectorFunctions = ((createSelectorFromCss, options) => {
  const {childSeparator, disableWildcards, idAttribute, parameterPrefix} = options;

  const cache: Cache = Object.create(null);

  const getCss = (locatorId: string, parameters: Parameters | undefined): string => {
    const attributes: [name: string, value: string][] = [[idAttribute, locatorId]];

    if (parameters != null) {
      for (const name in parameters) {
        attributes.push([parameterPrefix + name, String(parameters[name])]);
      }
    }

    return attributes
      .map(([name, value]) => getAttributeCss(name, value, disableWildcards))
      .join('');
  };

  const getSelector = (css: string, cssStrings?: CssStrings): object => {
    if (css in cache) {
      return cache[css]!;
    }

    const selector = createSelectorFromCss(css);

    allSelectors.set(selector, cssStrings ?? [css]);

    cache[css] = selector;

    return selector;
  };

  const get: ProxyHandler<Target>['get'] = (target, property) => {
    const maybeLocator = target[property];

    if (typeof maybeLocator === 'function') {
      return maybeLocator;
    }

    const locatorId = target.toString();
    const childLocatorId = locatorId + childSeparator + String(property);

    const toCss = (parameters?: Parameters) => getCss(childLocatorId, parameters);
    const childLocator = (parameters?: Parameters) => getSelector(toCss(parameters));

    childLocator.toCss = toCss;
    childLocator.toJSON = childLocator.toString = () => childLocatorId;

    Object.defineProperty(target, property, {
      configurable: true,
      enumerable: true,
      value: childLocator,
      writable: true,
    });

    return childLocator;
  };

  const createLocatorInTests = (locatorId: string): object => {
    const toCss = (parameters?: Parameters) => getCss(locatorId, parameters);
    const target = ((parameters?: Parameters) => getSelector(toCss(parameters))) as Target;

    target.toCss = toCss;
    target.toJSON = target.toString = target[Symbol.toPrimitive] = () => locatorId;

    return new Proxy(target, {get, ...handler}) as any;
  };

  const findAnyOfSelectors = (...selectors: readonly object[]): object => {
    if (selectors.length === 0) {
      throw new Error('Empty argument list');
    }

    if (selectors.length === 1) {
      return selectors[0]!;
    }

    const cssStringsSet = new Set<string>();

    for (const selector of selectors) {
      const cssStringsOfSelector = getCssStringsOfSelector(selector);

      for (const cssString of cssStringsOfSelector) {
        cssStringsSet.add(cssString);
      }
    }

    const cssStrings = [...cssStringsSet].sort(compare) as unknown as CssStrings;
    const css = getCssOfSelector(cssStrings);

    return getSelector(css, cssStrings);
  };

  const findChainOfSelectors = (...selectors: readonly object[]): object => {
    if (selectors.length === 0) {
      throw new Error('Empty argument list');
    }

    if (selectors.length === 1) {
      return selectors[0]!;
    }

    const cssParts: string[] = [];

    for (const selector of selectors) {
      const cssStringsOfSelector = getCssStringsOfSelector(selector);

      cssParts.push(getCssOfSelector(cssStringsOfSelector));
    }

    const css = cssParts.join(' ');

    return getSelector(css);
  };

  return {createLocatorInTests, findAnyOfSelectors, findChainOfSelectors};
}) as CreateSelectorFunctionsFunction;

/**
 * Cache of selectors by their CSS string.
 */
type Cache = Record<string, object>;

/**
 * Not empty array of CSS strings of selector.
 */
type CssStrings = readonly [string, ...string[]];

/**
 * Weak map `Selector` -> `list of CSS selector strings` with all created selectors.
 */
const allSelectors = new WeakMap<object, CssStrings>();

/**
 * Compare function for sorting array of CSS strings in selectors.
 */
const {compare} = new Intl.Collator('en');

/**
 * Get CSS selector string for single attribute.
 */
const getAttributeCss = (name: string, value: string, disableWildcards = false): string => {
  if (disableWildcards) {
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
 * Get CSS of selector by array of it's CSS strings.
 */
const getCssOfSelector = (cssStrings: CssStrings): string =>
  cssStrings.length === 1 ? cssStrings[0] : `:is(${cssStrings.join(', ')})`;

/**
 * Get array of CSS strings of selector.
 */
const getCssStringsOfSelector = (selector: object): CssStrings => {
  const cssStrings = allSelectors.get(selector);

  if (cssStrings === undefined) {
    throw new Error(`Selector not created by createLocatorInTests function: ${selector}`);
  }

  return cssStrings;
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

/**
 * Proxy handler for locator proxy.
 */
const handler: ProxyHandler<Target> = {
  defineProperty: () => false,
  deleteProperty: () => false,
  ownKeys: () => [],
  preventExtensions: () => false,
};
