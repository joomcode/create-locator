import type {
  CreateLocatorFunction,
  GetLocatorParametersFunction,
  RemoveMarkFromPropertiesFunction,
} from './types';

const attributes = {};

const proxy: () => unknown = new Proxy(
  Object.setPrototypeOf(() => {}, null),
  {
    apply: () => attributes,
    defineProperty: () => true,
    deleteProperty: () => true,
    get(target, property) {
      if (property === Symbol.toPrimitive || property === 'toJSON') return toString;

      return proxy satisfies typeof target;
    },
    preventExtensions: () => false,
  },
);

const toString = () => '';

export const createLocator = (() => proxy) as CreateLocatorFunction;

export const getLocatorParameters = (() => proxy) as GetLocatorParametersFunction;

export const removeMarkFromProperties = ((properties) =>
  properties) as RemoveMarkFromPropertiesFunction;

export type {
  CreateLocator,
  GetLocatorParameters,
  Locator,
  Mark,
  Node,
  PropertiesWithMark,
  PropertiesWithMarkWithParameters,
  RemoveMarkFromProperties,
} from './types';
