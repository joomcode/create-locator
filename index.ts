import type {
  AppLocatorKit,
  Attributes,
  CreateLocatorOptions,
  LocatorFunction,
  LocatorParameters,
} from './types';

/**
 * Creates locator function by locator options.
 */
export const createSimpleLocator = ({
  attributesOptions,
  isProduction,
}: CreateLocatorOptions): AppLocatorKit => {
  var emptyLocator: Attributes = {};

  if (isProduction) {
    return {getTestId: () => '', locator: () => emptyLocator};
  }

  var {parameterAttributePrefix, testIdAttribute, testIdSeparator} = attributesOptions;

  var getTestId: LocatorFunction<string> = (...args: readonly unknown[]) => {
    var parts: string[] = [];

    for (var index = 0; index < args.length; index += 1) {
      var arg = args[index];

      if (arg == null) {
        return '';
      }

      if (index === args.length - 1 && typeof arg === 'object') {
        return parts.join(testIdSeparator);
      }

      var part = String(arg);

      if (part === '') {
        return '';
      }

      parts.push(part);
    }

    return parts.join(testIdSeparator);
  };

  var locator: LocatorFunction = (...args: readonly unknown[]) => {
    var testId = getTestId(...(args as [string]));

    if (testId === '') {
      return emptyLocator;
    }

    var locator = {[testIdAttribute]: testId};
    var parameters = args[args.length - 1];

    if (parameters !== null && typeof parameters === 'object') {
      for (var name of Object.keys(parameters)) {
        var value = (parameters as LocatorParameters)[name];

        if (value != null) {
          locator[parameterAttributePrefix + name] = String(value);
        }
      }
    }

    return locator;
  };

  return {getTestId, locator};
};

export {
  anyLocator,
  createLocator,
  createRootLocator,
  getLocatorParameters,
  removeMarkFromProperties,
  setGlobalProductionMode,
} from './oldApi.js';

export type * from './oldApi';

export type * from './types';
