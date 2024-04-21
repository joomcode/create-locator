import type {CreateLocatorCreatorInTestsFunction, Parameters, Target} from './types';

/**
 * Creates `createLocatorInTests` function by `createSelector` function.
 */
export const createLocatorCreatorInTests: CreateLocatorCreatorInTestsFunction = (
  createSelectorFromCss,
  options,
) => {
  const {childSeparator, disableWildcards, idAttribute, parameterPrefix} = options;

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

  const getSelector = (cache: Cache, css: string): unknown => {
    if (css in cache) {
      return cache[css];
    }

    const selector = createSelectorFromCss(css);

    cache[css] = selector;

    return selector;
  };

  const get: ProxyHandler<Target>['get'] = (target, property) => {
    const maybeLocator = target[property];

    if (typeof maybeLocator === 'function') {
      return maybeLocator;
    }

    const locatorId = target.toString();

    const cache: Cache = Object.create(null);
    const childLocatorId = locatorId + childSeparator + String(property);

    const toCss = (parameters?: Parameters) => getCss(childLocatorId, parameters);
    const childLocator = (parameters?: Parameters) => getSelector(cache, toCss(parameters));

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

  return (locatorId: string) => {
    const cache: Cache = Object.create(null);

    const toCss = (parameters?: Parameters) => getCss(locatorId, parameters);
    const target = ((parameters?: Parameters) => getSelector(cache, toCss(parameters))) as Target;

    target.toCss = toCss;
    target.toJSON = target.toString = target[Symbol.toPrimitive] = () => locatorId;

    return new Proxy(target, {get, ...handler}) as any;
  };
};

type Cache = Record<string, unknown>;

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
