import type {
  CreateLocatorFunction,
  GetLocatorParametersFunction,
  RemoveLocatorFromPropertiesFunction,
} from '../types';

import type {Tree} from './memory.spec';

declare global {
  const process: {
    env: {_START: string};
    memoryUsage(): Readonly<Record<string, number>>;
    nextTick(fn: () => void): void;
  };

  type WithAriaInvalid = {
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined;
  };

  namespace JSX {
    export interface IntrinsicElements {
      a: WithAriaInvalid;
      button: WithAriaInvalid;
      div: WithAriaInvalid;
      h1: WithAriaInvalid;
      label: WithAriaInvalid;
      main: WithAriaInvalid;
      span: WithAriaInvalid;
    }
  }
}

type Component = (properties?: object) => object;

const getRandomString = (): string => Math.random().toString(27).slice(2);

export type Api = readonly [
  createLocator: CreateLocatorFunction,
  getLocatorParameters: GetLocatorParametersFunction,
  removeLocatorFromProperties: RemoveLocatorFromPropertiesFunction,
];

export function assert(value: unknown, message?: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }

  if (message) {
    testsCount += 1;

    log('  ✅', message);
  }
}

export const assertPropertiesAreEqual = (
  keys: readonly (string | symbol)[],
  a: object,
  b: object,
  message?: string,
): void => {
  for (const key of keys) {
    const descriptorA = Object.getOwnPropertyDescriptor(a, key)!;
    const descriptorB = Object.getOwnPropertyDescriptor(b, key)!;
    const descriptorKeys = Object.keys(descriptorA) as (keyof typeof descriptorA)[];

    assert(
      descriptorKeys.length === Object.keys(descriptorB).length,
      message ? `${message}: descriptors for key "${String(key)}" has equal length` : undefined,
    );

    for (const descriptorKey of descriptorKeys) {
      assert(
        descriptorA[descriptorKey] === descriptorB[descriptorKey],
        message
          ? `${message}: descriptor properties "${descriptorKey}" are equal for key "${String(
              key,
            )}"`
          : undefined,
      );
    }
  }
};

export const assertShallowEqual = (a: object, b: object): void => {
  const keys = Reflect.ownKeys(a);

  assert(keys.length === Reflect.ownKeys(b).length);

  assertPropertiesAreEqual(keys, a, b);
};

export type {Checks} from './types.spec';

export const createRandomTree = (): Tree => {
  const tree: Tree = {};

  for (let i = 0; i < 3; i += 1) {
    const subtree: Tree = {};

    for (let j = 0; j < 3; j += 1) {
      subtree[getRandomString()] = getRandomString();
    }

    tree[getRandomString()] = subtree;
  }

  return tree;
};

/**
 * Returns true if types are exactly equal and false otherwise.
 * IsEqual<{foo: string}, {foo: string}> = true.
 * IsEqual<{readonly foo: string}, {foo: string}> = false.
 */
export type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

export const getShallowCopy = <T>(value: T): T => {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    return value;
  }

  const copy = Object.create(Object.getPrototypeOf(value));

  for (const key of Reflect.ownKeys(value as object)) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(value, key)!);
  }

  return copy;
};

export const {log} = console;

export const ok = (message: string) => log(`\x1B[32m[OK]\x1B[39m ${message}`);

export const React = {
  createElement(ComponentOrTag: Component | string, properties: object, ...children: object[]) {
    properties = {children, ...properties};

    if (typeof ComponentOrTag === 'function') {
      return ComponentOrTag(properties);
    }

    return {tag: ComponentOrTag, properties};
  },
};

export type Test = (api: Api, environment: string) => void;

export let testsCount = 0;
