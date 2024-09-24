import type {Attributes, CreateLocatorOptions, LocatorFunction, LocatorParameters} from './types';

/**
 * Creates locator function by locator options.
 */
export const createSimpleLocator = ({
  attributesOptions,
  isProduction,
}: CreateLocatorOptions): LocatorFunction => {
  var emptyLocator: Attributes = {__proto__: {toString: () => ''} as string};

  if (isProduction) {
    return () => emptyLocator;
  }

  var {parameterAttributePrefix, testIdAttribute, testIdSeparator} = attributesOptions;

  var Locator = class implements Attributes {
    [name: string]: string;

    readonly testId!: string;

    constructor(testId: string) {
      this[testIdAttribute as 'testId'] = testId;
    }

    // @ts-expect-error: method is incompatible with index signature of class
    toString(): string {
      return this[testIdAttribute as 'testId'];
    }
  };

  return ((...args: readonly unknown[]) => {
    var parts: string[] = [];

    for (var index = 0; index < args.length; index += 1) {
      var arg = args[index];

      if (arg == null) {
        return emptyLocator;
      }

      if (index === args.length - 1 && typeof arg === 'object') {
        var locator = new Locator(parts.join(testIdSeparator));

        for (var name of Object.keys(arg)) {
          var value = (arg as LocatorParameters)[name];

          if (value != null) {
            locator[parameterAttributePrefix + name] = String(value);
          }
        }

        return locator;
      }

      var part = String(arg);

      if (part === '') {
        return emptyLocator;
      }

      parts.push(part);
    }

    return new Locator(parts.join(testIdSeparator));
  }) as LocatorFunction;
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
