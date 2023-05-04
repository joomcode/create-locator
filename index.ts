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
 * Symbol key for locator in path attribute value.
 */
const LOCATOR = Symbol.for('create-locator:locator');

/**
 * Symbol key for options of root locator.
 */
const OPTIONS = Symbol.for('create-locator:options');

/**
 * Symbol key for path of locator.
 */
const PATH = Symbol.for('create-locator:path');

/**
 * Options of root locator, maybe with mapping attributes function.
 */
type Options = Partial<MapAttributes<Attributes>> & RootOptions;

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
  [LOCATOR]: LocatorProxy;
  [OPTIONS]: Options;
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
 * Proxy handler for locator proxy.
 */
const handler: ProxyHandler<LocatorProxy> = {
  apply(target, thisArg, [parameters]): Attributes {
    const {mapAttributes, parameterAttributePrefix, pathAttribute} = target[OPTIONS];
    const attributes: Record<string, string> = {[pathAttribute]: target[PATH]};

    setAttributesFromParameters(attributes, parameterAttributePrefix, parameters);

    if (mapAttributes) {
      return mapAttributes(attributes);
    }

    const pathAttributeValue: PathAttributeValue = {
      [LOCATOR]: target[LOCATOR],
      parameters,
      toJSON: toString,
      toString,
    };

    attributes[pathAttribute] = pathAttributeValue as unknown as string satisfies typeof thisArg;

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

    target[property] = createLocatorProxy(options, newPath);

    return target[property];
  },
  preventExtensions: () => false,
};

/**
 * Creates a proxy object that represents the locator at runtime, by root options and path.
 */
const createLocatorProxy = (options: Options, path: string): LocatorProxy => {
  const target = Object.assign<object, Omit<LocatorProxy, typeof LOCATOR>>(
    Object.setPrototypeOf(() => {}, null),
    {[OPTIONS]: options, [PATH]: path, [Symbol.toPrimitive]: toJSON, toJSON},
  ) as LocatorProxy;
  const locatorProxy = new Proxy(target, handler);

  target[LOCATOR] = locatorProxy;

  return locatorProxy;
};

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
 * Proxy object that represents the locator at production runtime.
 */
const productionLocator = productionCreateLocator('app');

/**
 * Method toJSON (and, in fact, toString) for locator proxy.
 */
function toJSON(this: LocatorProxy): string {
  return this[PATH];
}

/**
 * Method toString for path attribute value.
 */
function toString(this: PathAttributeValue): string {
  return this[LOCATOR][PATH];
}

/**
 * Creates root locator (by prefix and options) or component locator (by component properties).
 */
export const createLocator = ((
  prefixOrProperties: string | Properties,
  maybeOptions?: Options,
): LocatorProxy => {
  if (typeof prefixOrProperties === 'string') {
    const options: Options = {...DEFAULT_OPTIONS, ...maybeOptions};

    if (options.isProduction) {
      return productionLocator as unknown as LocatorProxy;
    }

    return createLocatorProxy(options, prefixOrProperties);
  }

  const pathAttributeValue = getPathAttributeValueFromProperties(prefixOrProperties);

  if (!pathAttributeValue) {
    return productionLocator as unknown as LocatorProxy;
  }

  return pathAttributeValue[LOCATOR];
}) as unknown as CreateLocator;

/**
 * Get parameters of component locator by component properties.
 */
export const getLocatorParameters = ((properties: Properties) => {
  const pathAttributeValue = getPathAttributeValueFromProperties(properties);

  return pathAttributeValue?.parameters || productionLocator;
}) as GetLocatorParameters;

/**
 * Removes locator mark from properties (or rest properties) object.
 * Returns properties without attributes produced by the locator.
 */
export const removeLocatorFromProperties = ((properties: Properties) => {
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
}) as RemoveLocatorFromProperties;

export type {Locator, Node} from './types';
