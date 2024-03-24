import {createLocator as oldCreateLocator} from './oldApi';

import type {Attributes, CreateLocatorFunction, Options, Parameters} from './types';

/**
 * Creates locator by locator id and child locators description.
 */
export const createLocator = ((locatorId: string | object, children: Children | undefined) => {
  if (typeof locatorId !== 'string') {
    return oldCreateLocator(locatorId as any);
  }

  var locator: Locator;

  if (locatorId in locators) {
    duplicateLocator = locatorId;
    locator = locators[locatorId]!;
  } else {
    var cache: Cache = {__proto__: null as unknown as Attributes};

    locator = locators[locatorId] = ((parameters?: Parameters) =>
      getAttributes(locatorId, parameters, cache)) as Locator;
  }

  if (children !== undefined) {
    if (locatorIdAttribute === undefined) {
      for (var name in children) {
        locator[name] = locator;
      }
    } else {
      setChildLocators(locatorId, locator, children);
    }
  }

  return locator;
}) as CreateLocatorFunction;

/**
 * Set global locator options. Locators return attributes only after options are set.
 */
export const setOptions = (options: Options): void => {
  if (duplicateLocator !== undefined) {
    throw new Error(`More than one locator with id "${duplicateLocator}" has been declared`);
  }

  if (prematurelyCalledLocator !== undefined) {
    throw new Error(
      `The locator with id "${prematurelyCalledLocator}" was called before the options were set`,
    );
  }

  ({childLocatorIdSeparator, locatorIdAttribute, parameterAttributePrefix} = options);

  for (var locatorId in locators) {
    var locator = locators[locatorId]!;

    setChildLocators(locatorId, locator, locator);
  }
};

export {
  anyLocator,
  createRootLocator,
  getLocatorParameters,
  removeMarkFromProperties,
  setGlobalProductionMode,
} from './oldApi';

export type * from './oldApi';

type Cache = Record<string, Attributes>;

type Children = Readonly<Record<string, unknown>>;

type LocatorFunction = (parameters?: Parameters) => Attributes;

type Locator = LocatorFunction & Record<string, LocatorFunction>;

var childLocatorIdSeparator: string | undefined;

var getAttributes = (
  locatorId: string,
  parameters: Parameters | undefined,
  cache: Cache,
): Attributes => {
  if (locatorIdAttribute === undefined) {
    prematurelyCalledLocator = locatorId;

    return;
  }

  var key = parameters == null ? '' : getKey(parameters);
  var attributes: Record<string, string> | undefined = cache[key];

  if (attributes !== undefined) {
    return attributes;
  }

  attributes = cache[key] = {[locatorIdAttribute]: locatorId};

  if (parameters != null) {
    for (var name in parameters) {
      attributes[parameterAttributePrefix + name] = String(parameters[name]);
    }
  }

  return attributes;
};

var getKey = (parameters: Parameters): string => {
  var parts: (string | number)[] = [];

  for (var name in parameters) {
    var parameter = String(parameters[name]);

    parts.push(name, parameter.length, parameter);
  }

  return parts.join('>');
};

var duplicateLocator: string | undefined;

var locatorIdAttribute: string | undefined;

var locators: Record<string, Locator> = {__proto__: null as unknown as Locator};

var parameterAttributePrefix: string | undefined;

var prematurelyCalledLocator: string | undefined;

var setChildLocators = (locatorId: string, locator: Locator, children: Children): void => {
  for (var name in children) {
    if (name !== 'root') {
      const cache: Cache = {__proto__: null as unknown as Attributes};
      const childLocatorId = locatorId + childLocatorIdSeparator + name;

      locator[name] = (parameters?: Parameters) => getAttributes(childLocatorId, parameters, cache);
    }
  }
};
