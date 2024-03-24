import type {
  Attributes,
  CreateRootLocatorFunction,
  FilledRootOptions,
  GetLocatorParametersFunction,
  RemoveMarkFromPropertiesFunction,
} from './oldTypes';
import type {CreateLocatorFunction} from './types';

import {anyLocator as productionAnyLocator} from './production';

/**
 * Proxy object that represents the locator in production mode (and, for example, in unit tests).
 */
export const anyLocator = productionAnyLocator;

/**
 * Creates component locator (by component properties).
 */
export const createLocator = ((
  prefixOrProperties: string | Properties,
  maybeOptions?: FilledRootOptions,
): LocatorProxy => {
  if (isGlobalProductionMode) {
    return anyLocator as unknown as LocatorProxy;
  }

  if (typeof prefixOrProperties === 'string') {
    const options: FilledRootOptions = Object.assign({}, DEFAULT_OPTIONS, maybeOptions);

    if (options.isProduction) {
      return anyLocator as unknown as LocatorProxy;
    }

    return createLocatorProxy(options, prefixOrProperties);
  }

  const pathAttributeValue = getPathAttributeValueFromProperties(prefixOrProperties);

  if (!pathAttributeValue) {
    return anyLocator as unknown as LocatorProxy;
  }

  return pathAttributeValue[LOCATOR];
}) as CreateLocatorFunction;

/**
 * Creates root locator (by prefix and options).
 */
export const createRootLocator = ((prefix: string, maybeOptions?: FilledRootOptions) => {
  if (isGlobalProductionMode) {
    return anyLocator as unknown as LocatorProxy;
  }

  const options: FilledRootOptions = Object.assign({}, DEFAULT_OPTIONS, maybeOptions);

  if (options.isProduction) {
    return anyLocator as unknown as LocatorProxy;
  }

  return createLocatorProxy(options, prefix);
}) as CreateRootLocatorFunction;

/**
 * Get component parameters of locator from parent component (by component properties).
 */
export const getLocatorParameters = ((properties: Properties) => {
  if (isGlobalProductionMode) {
    return anyLocator;
  }

  const pathAttributeValue = getPathAttributeValueFromProperties(properties);

  if (!pathAttributeValue) {
    return anyLocator;
  }

  if (pathAttributeValue.parameters === undefined) {
    return undefined;
  }

  return pathAttributeValue.parameters || anyLocator;
}) as GetLocatorParametersFunction;

/**
 * Removes locator mark from properties (or rest properties) object.
 * Returns properties without locator mark.
 */
export const removeMarkFromProperties = ((properties: Properties) => {
  if (isGlobalProductionMode) {
    return properties;
  }

  const pathAttributeValue = getPathAttributeValueFromProperties(properties);

  if (!pathAttributeValue) {
    return properties;
  }

  const {[LOCATOR]: locator, parameters} = pathAttributeValue;
  const {parameterAttributePrefix, pathAttribute} = locator[OPTIONS];
  const attributes = {__proto__: null, [pathAttribute]: ''} as Attributes;
  const propertiesWithoutLocator = {__proto__: Object.getPrototypeOf(properties)};

  setAttributesFromParameters(attributes, parameterAttributePrefix, parameters);

  for (const key of Reflect.ownKeys(properties)) {
    if (!(key in attributes)) {
      Object.defineProperty(
        propertiesWithoutLocator,
        key,
        Object.getOwnPropertyDescriptor(properties, key)!,
      );
    }
  }

  return propertiesWithoutLocator;
}) as RemoveMarkFromPropertiesFunction;

/**
 * Set production mode for all locators at all.
 */
export const setGlobalProductionMode = (): void => {
  isGlobalProductionMode = true;
};

/**
 * If `true`, then all locators work in production mode.
 */
var isGlobalProductionMode: boolean = false;

export type {
  AnyMark,
  Attributes,
  CreateLocator,
  GetLocatorParameters,
  Locator,
  LocatorConstraint,
  LocatorDescriptionConstraint,
  LocatorOfElement,
  Mark,
  Node,
  ParametersConstraint,
  PropertiesWithMarkConstraint,
  PropertiesWithMarkWithParametersConstraint,
  RemoveMarkFromProperties,
  RootOptions,
} from './oldTypes';

/**
 * Some locator parameters.
 */
type Parameters = Readonly<Record<string, unknown>>;

/**
 * Component properties, maybe marked with component locator.
 */
type Properties = Readonly<Record<string, object | PathAttributeValue>>;

/**
 * Locator proxy object.
 */
type LocatorProxy = Record<string, unknown> & {
  [ATTRIBUTES]?: Attributes | undefined;
  [CACHE]: Record<string, Attributes | LocatorProxy>;
  [LOCATOR]: LocatorProxy;
  [OPTIONS]: FilledRootOptions;
  [PARENT]?: LocatorProxy | undefined;
  [PATH]: string;
};

/**
 * Path attribute value with locator and locator parameters.
 */
type PathAttributeValue = Readonly<{
  [LOCATOR]: LocatorProxy;
  parameters: Parameters | undefined;
  toJSON(): string;
  toString(): string;
}>;

/**
 * Adds before the string its length.
 */
const addLength = (value: unknown): string => {
  const str = String(value);

  return `${str.length}:${str}`;
};

/**
 * create-locator 📌 package url on npm website.
 */
const packageUrl = 'https://www.npmjs.com/package/create-locator';

/**
 * Symbol key for cache of locator attributes.
 */
const ATTRIBUTES = Symbol.for(`${packageUrl}#attributes`);

/**
 * Symbol key for cache of locator call results.
 */
const CACHE = Symbol.for(`${packageUrl}#cache`);

/**
 * Creates a proxy object that represents the locator at runtime, by root options and path.
 */
const createLocatorProxy = (
  options: FilledRootOptions,
  path: string,
  parent?: LocatorProxy,
  attributes?: Attributes,
): LocatorProxy => {
  const cache = {__proto__: null} as unknown as Record<string, Attributes>;
  const target: LocatorProxy = Object.setPrototypeOf(() => {}, null);

  delete target['length'];
  delete target['name'];

  Object.assign<object, Omit<LocatorProxy, typeof LOCATOR>>(target, {
    [CACHE]: cache,
    [OPTIONS]: options,
    [PATH]: path,
    [Symbol.toPrimitive]: toJSON,
    toJSON,
  });

  const locatorProxy = new Proxy(target, handler);

  target[LOCATOR] = locatorProxy;

  if (parent || attributes) {
    target[ATTRIBUTES] = attributes;
    target[PARENT] = parent;
  }

  return locatorProxy;
};

/**
 * Default options of root locator (without mapping attributes function).
 */
const DEFAULT_OPTIONS: FilledRootOptions = {
  isProduction: false,
  parameterAttributePrefix: 'data-test-',
  pathAttribute: 'data-testid',
  pathSeparator: '-',
};

/**
 * Get string key for any value for its caching.
 */
const getKey = (value: unknown): string => {
  const type = typeof value;
  const parts = [type, addLength(value)];

  if (value && (type === 'object' || type === 'function')) {
    for (const key of Reflect.ownKeys(value)) {
      parts.push(addLength(key), addLength((value as Attributes)[key as string]));
    }
  }

  return parts.join('');
};

/**
 * Get a chain of parent attributes for `mapAttributesChain` function.
 */
const getParentAttributesChain = (target: LocatorProxy): readonly Attributes[] => {
  const attributesChain: Attributes[] = [
    target[ATTRIBUTES] || {[target[OPTIONS].pathAttribute]: target[PATH]},
  ];

  let currentTarget: LocatorProxy | undefined = target;

  while ((currentTarget = currentTarget[PARENT])) {
    if (currentTarget[ATTRIBUTES]) {
      attributesChain.unshift(currentTarget[ATTRIBUTES]);
    }
  }

  return attributesChain;
};

/**
 * Get path attribute value from component properties that marked with locator.
 */
const getPathAttributeValueFromProperties = (
  properties: Properties,
): PathAttributeValue | undefined => {
  for (const key of Object.keys(properties || true)) {
    const value = properties[key];

    if (value !== null && typeof value === 'object' && LOCATOR in value) {
      return value;
    }
  }

  return;
};

/**
 * Proxy handler for locator proxy.
 */
const handler: ProxyHandler<LocatorProxy> = {
  apply(target, _thisArg, args): Attributes | LocatorProxy {
    const cache = target[CACHE];
    const [parameters] = args;
    const key = args.length ? getKey(parameters) : 'noArgs';

    if (key in cache) {
      return cache[key]!;
    }

    const {mapAttributesChain, parameterAttributePrefix, pathAttribute} = target[OPTIONS];
    const attributes: Record<string, string> = {[pathAttribute]: target[PATH]};

    setAttributesFromParameters(attributes, parameterAttributePrefix, parameters);

    if (mapAttributesChain) {
      const mappingResult = args.length
        ? createLocatorProxy(target[OPTIONS], target[PATH], target[PARENT], attributes)
        : mapAttributesChain(getParentAttributesChain(target));

      cache[key] = mappingResult;

      return mappingResult;
    }

    const pathAttributeValue: PathAttributeValue = {
      [LOCATOR]: target[LOCATOR],
      parameters,
      toJSON: toString,
      toString,
    };

    attributes[pathAttribute] = pathAttributeValue as unknown as string;

    cache[key] = attributes;

    return attributes;
  },
  defineProperty: () => false,
  deleteProperty: () => false,
  get(target, property) {
    if (typeof property !== 'string' || property in target) {
      return target[property as string];
    }

    const options = target[OPTIONS];
    const newPath = `${target[PATH]}${options.pathSeparator}${property}`;

    target[property] = createLocatorProxy(
      options,
      newPath,
      options.mapAttributesChain ? target : undefined,
    );

    return target[property];
  },
  preventExtensions: () => false,
};

/**
 * Symbol key for locator in path attribute value.
 */
const LOCATOR = Symbol.for(`${packageUrl}#locator`);

/**
 * Symbol key for options of root locator.
 */
const OPTIONS = Symbol.for(`${packageUrl}#options`);

/**
 * Symbol key for parent locator.
 */
const PARENT = Symbol.for(`${packageUrl}#parent`);

/**
 * Symbol key for path of locator.
 */
const PATH = Symbol.for(`${packageUrl}#path`);

/**
 * Set attributes from parameters to attributes object.
 */
const setAttributesFromParameters = (
  attributes: Record<string, string>,
  parameterAttributePrefix: string,
  parameters: Parameters | undefined,
): void => {
  if (parameters) {
    for (const key of Object.keys(parameters)) {
      attributes[`${parameterAttributePrefix}${key}`] = String(parameters[key]);
    }
  }
};

/**
 * Method `toJSON` (and, in fact, `toString`) for locator proxy.
 */
const toJSON = function (this: LocatorProxy): string {
  return this[PATH];
};

/**
 * Method `toString` for path attribute value.
 */
const toString = function (this: PathAttributeValue): string {
  return this[LOCATOR][PATH];
};
