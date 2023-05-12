import type {
  CreateLocatorFunction,
  GetLocatorParametersFunction,
  RemoveLocatorFromPropertiesFunction,
} from './types';

const attributes = {};
const toString = () => '';

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

export const createLocator = (() => proxy) as unknown as CreateLocatorFunction;

export const getLocatorParameters = (() => proxy) as GetLocatorParametersFunction;

export const removeLocatorFromProperties = ((properties) =>
  properties) as RemoveLocatorFromPropertiesFunction;

export type {
  CreateLocator,
  GetLocatorParameters,
  Locator,
  Node,
  RemoveLocatorFromProperties,
} from './types';
