import type {CreateLocator, GetLocatorParameters} from './types';

const attributes = {'data-test-create-locator': undefined};
const toString = () => '';

const proxy: () => unknown = new Proxy(
  Object.setPrototypeOf(() => {}, null),
  {
    apply: () => attributes,
    defineProperty: () => false,
    deleteProperty: () => false,
    get(target, property) {
      if (property === 'toString' || property === 'toJSON') return toString;

      return proxy satisfies typeof target;
    },
    preventExtensions: () => false,
  },
);

export const createLocator = (() => proxy) as CreateLocator;

export const getLocatorParameters = (() => proxy) as GetLocatorParameters;

export type {Locator, Node} from './types';
