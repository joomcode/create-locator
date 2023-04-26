import type {
  Attributes,
  CreateLocator,
  GetLocatorParameters,
  MapAttributes,
  RemoveLocatorFromProperties,
  RootOptions,
} from './types';

import {createLocator as productionCreateLocator} from './production';

/**
 * Symbol key for cache of locators.
 */
const CACHE = Symbol.for('create-locator:cache');

/**
 * Symbol key for options of root locator.
 */
const OPTIONS = Symbol.for('create-locator:options');

/**
 * Symbol key for prefix of locator.
 */
const PREFIX = Symbol.for('create-locator:prefix');

/**
 * Cache with proxied locators by their prefix.
 */
type Cache = Record<string, ProxiedLocator>;

/**
 * Options of root locator, maybe with mapping attributes function.
 */
type Options = Partial<MapAttributes<Attributes>> & RootOptions;

/**
 * Component properties, maybe marked with component locator.
 */
type Properties = Readonly<Record<string, object | StringifiedLocator>>;

/**
 * Proxied presentation of locator for component render execution context.
 */
type ProxiedLocator = Record<string, unknown> &
  Readonly<{[CACHE]: Cache; [OPTIONS]: Options; [PREFIX]: string}>;

/**
 * Stringified presentation of locator for attributes object.
 */
type StringifiedLocator = Readonly<{
  [CACHE]: Cache;
  parameters: object | undefined;
  [PREFIX]: string;
  toJSON(): string;
  toString(): string;
}>;

/**
 * Default options of root locator (without mapping attributes function).
 */
const DEFAULT_OPTIONS: RootOptions = {
  isProduction: false,
  parameterAttributePrefix: 'data-test-',
  pathAttribute: 'data-testid',
  pathSeparator: '-',
};

/**
 * Proxy object that represents the locator at production runtime.
 */
const productionLocator = productionCreateLocator('app');

/**
 * Proxy hanlder for proxied locator.
 */
const handler: ProxyHandler<ProxiedLocator> = {
  apply(target, thisArg, args): Attributes {
    const attributes: Record<string, string> = {
      [target[OPTIONS].pathAttribute]: target[PREFIX],
    } satisfies typeof thisArg;

    if (args[0]) {
      for (const [key, value] of Object.entries(args[0] as Attributes)) {
        attributes[`${target[OPTIONS].parameterAttributePrefix}${key}`] = value;
      }
    }

    if (target[OPTIONS].mapAttributes) {
      return target[OPTIONS].mapAttributes(attributes);
    }

    const stringifiedLocator: StringifiedLocator = {
      [CACHE]: target[CACHE],
      parameters: args[0] ? args[0] : undefined,
      [PREFIX]: target[PREFIX],
      toJSON: toString,
      toString,
    };

    attributes[target[OPTIONS].pathAttribute] = stringifiedLocator as unknown as string;

    return attributes;
  },
  defineProperty: () => false,
  deleteProperty: () => false,
  get(target, property) {
    if (typeof property !== 'string' || property in target) {
      return target[property as string];
    }

    const newPrefix = `${target[PREFIX]}${target[OPTIONS].pathSeparator}${property}`;

    if (!(newPrefix in target[CACHE])) {
      target[CACHE][newPrefix] = createProxiedLocator(newPrefix, target[OPTIONS], target[CACHE]);
    }

    target[property] = target[CACHE][newPrefix];

    return target[property];
  },
  preventExtensions: () => false,
};

/**
 * Creates a proxy object that represents the locator at runtime, by prefix, root options and cache.
 */
const createProxiedLocator = (prefix: string, options: Options, cache: Cache): ProxiedLocator => {
  const target = Object.assign<object, ProxiedLocator>(
    Object.setPrototypeOf(() => {}, null),
    {
      [CACHE]: cache,
      [OPTIONS]: options,
      [PREFIX]: prefix,
      [Symbol.toPrimitive]: toString,
      toJSON: toString,
    },
  );

  return new Proxy(target, handler);
};

/**
 * Get stringified locator from component properties that marked with locator.
 * Throws an error if the properties are not marked with a locator.
 */
const getStringifiedLocatorFromProperties = (
  properties: Properties,
): StringifiedLocator | undefined => {
  for (const value of Object.values(properties)) {
    if (value !== null && typeof value === 'object' && CACHE in value) {
      return value;
    }
  }

  return;
};

/**
 * Method toString for stringified locator.
 */
function toString(this: StringifiedLocator): string {
  return this[PREFIX];
}

/**
 * Creates root locator (by prefix and options) or component locator (by component properties).
 */
export const createLocator = ((
  prefixOrProperties: string | Properties,
  maybeOptions?: Options,
): ProxiedLocator => {
  if (typeof prefixOrProperties === 'string') {
    const options: Options = {...DEFAULT_OPTIONS, ...maybeOptions};

    if (options.isProduction) {
      return productionLocator as unknown as ProxiedLocator;
    }

    const cache: Cache = Object.create(null);
    const proxiedLocator = createProxiedLocator(prefixOrProperties, options, cache);

    cache[prefixOrProperties] = proxiedLocator;

    return proxiedLocator;
  }

  const stringifiedLocator = getStringifiedLocatorFromProperties(prefixOrProperties);

  if (!stringifiedLocator) {
    return productionLocator as unknown as ProxiedLocator;
  }

  return stringifiedLocator[CACHE][stringifiedLocator[PREFIX]]!;
}) as unknown as CreateLocator;

/**
 * Get parameters of component locator by component properties.
 */
export const getLocatorParameters = ((properties: Properties) => {
  const stringifiedLocator = getStringifiedLocatorFromProperties(properties);

  if (!stringifiedLocator) {
    return productionLocator;
  }

  return stringifiedLocator.parameters;
}) as GetLocatorParameters;

/**
 * Removes locator mark from properties (or rest properties) object.
 * Returns properties without attributes produced by the locator.
 */
export const removeLocatorFromProperties = ((properties: Properties) => {
  const stringifiedLocator = getStringifiedLocatorFromProperties(properties);

  if (!stringifiedLocator) {
    return properties;
  }

  const {parameters} = stringifiedLocator;
  const target = stringifiedLocator[CACHE][stringifiedLocator[PREFIX]]!;

  const locatorAttributes = [target[OPTIONS].pathAttribute];

  if (parameters) {
    for (const key of Object.keys(parameters)) {
      locatorAttributes.push(`${target[OPTIONS].parameterAttributePrefix}${key}`);
    }
  }

  const propertiesWithoutLocator: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties as Record<string, unknown>)) {
    if (!locatorAttributes.includes(key)) {
      propertiesWithoutLocator[key] = value;
    }
  }

  return propertiesWithoutLocator;
}) as RemoveLocatorFromProperties;

export type {Locator, Node} from './types';
