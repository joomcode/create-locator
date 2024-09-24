import type {
  AnyLocator,
  CreateComponentLocator,
  CreateRootLocatorFunction,
  GetLocatorParametersFunction,
  RemoveMarkFromPropertiesFunction,
} from './oldTypes';

export const anyLocator: AnyLocator = new Proxy(
  Object.setPrototypeOf(() => {}, null),
  {
    apply: () => attributes,
    defineProperty: () => true,
    deleteProperty: () => true,
    get(target, property) {
      if (property === Symbol.toPrimitive || property === 'toJSON') return toString;

      return anyLocator satisfies typeof target;
    },
    preventExtensions: () => false,
  },
);

export const createLocator = (() => anyLocator) as unknown as CreateComponentLocator;

export const createRootLocator = (() => anyLocator) as CreateRootLocatorFunction;

export const getLocatorParameters = (() => anyLocator) as GetLocatorParametersFunction;

export const removeMarkFromProperties = ((properties) =>
  properties) as RemoveMarkFromPropertiesFunction;

export const setGlobalProductionMode = (): void => {};

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

const attributes = {};

const toString = (): string => '';
