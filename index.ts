import type {Attributes, CreateLocator, MapAttributes, RootOptions} from './types';

import './production';

/**
 * Symbol key for cache of locators.
 */
const CACHE = Symbol.for('create-locator:cache');

/**
 * Symbol key for options of app root locator.
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
 * Options of app root locator, maybe with mapping attributes function.
 */
type Options = Partial<MapAttributes<Attributes>> & RootOptions;

/**
 * Proxied presentation of locator for component render execution context.
 */
type ProxiedLocator = Record<string, unknown> &
  Readonly<{[CACHE]: Cache; [OPTIONS]: Options; [PREFIX]: string}>;

/**
 * Stringified presentation of locator for properties and attributes.
 */
type StringifiedLocator = Readonly<{
  [CACHE]: Cache;
  prefix: string;
  toJSON(): string;
  toString(): string;
}>;

/**
 * Default options of app root locator (without mapping attributes function).
 */
const DEFAULT_OPTIONS: RootOptions = {
  isProduction: false,
  locatorAttribute: 'data-testid',
  pathDelimiter: '.',
  parameterAttributePrefix: 'data-test-',
};

/**
 * Get attributes object for proxied locator and given parameters.
 */
const getAttributes = (target: ProxiedLocator, parameters: object = {}): Attributes => {
  const attributes = {[target[OPTIONS].locatorAttribute]: target[PREFIX]};

  for (const [key, value] of Object.entries(parameters)) {
    attributes[`${target[OPTIONS].parameterAttributePrefix}${key}`] = value;
  }

  return attributes;
};

/**
 * Method toString for stringified locator.
 */
function toString(this: StringifiedLocator): string {
  return this.prefix;
}

/**
 * Proxy hanlder for proxied locator.
 */
const handler: ProxyHandler<ProxiedLocator> = {
  apply(target, thisArg, args): Attributes | Readonly<Record<string, StringifiedLocator>> {
    if (target[OPTIONS].mapAttributes) {
      return target[OPTIONS].mapAttributes(getAttributes(target, args[0]));
    }

    if (args.length > 0) {
      return getAttributes(target, args[0]) satisfies typeof thisArg;
    }

    const stringifiedLocator: StringifiedLocator = {
      [CACHE]: target[CACHE],
      prefix: target[PREFIX],
      toJSON: toString,
      toString,
    };

    return {[target[OPTIONS].locatorAttribute]: stringifiedLocator};
  },
  defineProperty: () => false,
  deleteProperty: () => false,
  get(target, property) {
    if (typeof property !== 'string' || property in target) {
      return target[property as string];
    }

    const newPrefix = `${target[PREFIX]}${target[OPTIONS].pathDelimiter}${property}`;

    if (!(newPrefix in target[CACHE])) {
      target[CACHE][newPrefix] = createProxiedLocator(newPrefix, target[OPTIONS], target[CACHE]);
    }

    target[property] = target[CACHE][newPrefix];

    return target[property];
  },
  preventExtensions: () => false,
};

/**
 * Creates a proxy object that represents the locator at runtime.
 */
const createProxiedLocator = (prefix: string, options: Options, cache: Cache): ProxiedLocator => {
  const target = Object.assign<object, ProxiedLocator>(
    Object.setPrototypeOf(() => {}, null),
    {[CACHE]: cache, [OPTIONS]: options, [PREFIX]: prefix},
  );

  return new Proxy(target, handler);
};

/**
 * Creates app root locator (by prefix and options)
 * or component root locator (by component properties).
 */
export const createLocator = ((
  prefixOrProps: string | object,
  maybeOptions?: Options,
): ProxiedLocator => {
  if (typeof prefixOrProps === 'string') {
    const cache: Cache = Object.create(null);
    const options: Options = {...DEFAULT_OPTIONS, ...maybeOptions};
    const proxiedLocator = createProxiedLocator(prefixOrProps, options, cache);

    cache[prefixOrProps] = proxiedLocator;

    return proxiedLocator;
  }

  for (const value of Object.values(prefixOrProps) as Partial<StringifiedLocator>[]) {
    if (CACHE in value) {
      return value[CACHE][value.prefix!]!;
    }
  }

  throw new TypeError(`Properties do not contain a locator (${prefixOrProps})`);
}) as CreateLocator;

export type {Locator, Node} from './types';
