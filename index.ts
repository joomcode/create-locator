import {createLocator as oldCreateLocator} from './oldApi';

import type {Attributes, CreateLocatorFunction, Options, Parameters} from './types';

/**
 * Creates locator by locator id and child locators description.
 */
export const createLocator = ((locatorId: string | object, children?: Children) => {
  if (typeof locatorId !== 'string') {
    return oldCreateLocator(locatorId as any);
  }

  var locator: Locator;

  if (locatorId in locators) {
    if (idAttribute !== undefined) {
      throwDuplicateError(locatorId);
    }

    duplicateLocator = locatorId;
    locator = locators[locatorId]!;
  } else {
    locator = locators[locatorId] = ((parameters?: Parameters) =>
      getAttributes(locatorId, parameters)) as Locator;
  }

  if (children !== undefined) {
    if (idAttribute === undefined) {
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
    throwDuplicateError(duplicateLocator);
  }

  if (prematurelyCalledLocator !== undefined) {
    throw new Error(
      `Locator with id "${prematurelyCalledLocator}" or it's child locator was called before the options were set`,
    );
  }

  ({childSeparator, idAttribute, parameterPrefix} = options);

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

export type {Options, OptionsInTests} from './types';

type Children = Readonly<Record<string, unknown>>;

type LocatorFunction = (parameters?: Parameters) => Attributes;

type Locator = LocatorFunction & Record<string, LocatorFunction>;

var childSeparator: string | undefined;

var duplicateLocator: string | undefined;

var getAttributes = (locatorId: string, parameters: Parameters | undefined): Attributes => {
  if (idAttribute === undefined) {
    prematurelyCalledLocator = locatorId;

    return;
  }

  var attributes = {[idAttribute]: locatorId};

  if (parameters != null) {
    for (var name in parameters) {
      attributes[parameterPrefix + name] = String(parameters[name]);
    }
  }

  return attributes;
};

var idAttribute: string | undefined;

var locators: Record<string, Locator> = {__proto__: null as unknown as Locator};

var parameterPrefix: string | undefined;

var prematurelyCalledLocator: string | undefined;

var setChildLocators = (locatorId: string, locator: Locator, children: Children): void => {
  for (var name in children) {
    if (name !== 'root') {
      const childLocatorId = locatorId + childSeparator + name;

      if (childLocatorId in locators) {
        throwDuplicateError(childLocatorId);
      }

      Object.defineProperty(locator, name, {
        configurable: true,
        enumerable: true,
        value: (locators[childLocatorId] = ((parameters?: Parameters) =>
          getAttributes(childLocatorId, parameters)) as Locator),
        writable: true,
      });
    }
  }
};

var throwDuplicateError = (locatorId: string): void => {
  throw new Error(`More than one locator with id "${locatorId}" has been created`);
};
