import type {CreateLocator, GetLocatorParameters, RemoveLocatorFromProperties} from './types';

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

export const createLocator = (() => proxy) as unknown as CreateLocator;

export const getLocatorParameters = (() => proxy) as GetLocatorParameters;

export const removeLocatorFromProperties = ((properties) =>
  properties) as RemoveLocatorFromProperties;

export type {Locator, Node} from './types';
