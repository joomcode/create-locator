import {createLocator, getLocatorParameters, removeLocatorFromProperties} from '../index';
import {
  createLocator as productionCreateLocator,
  getLocatorParameters as productionGetLocatorParameters,
  removeLocatorFromProperties as productionRemoveLocatorFromProperties,
} from '../production';

import type {CreateLocator, GetLocatorParameters, RemoveLocatorFromProperties} from '../types';

import {testBasicInteractions} from './basicInteractions.spec';
import {testCache} from './cache.spec';
import {testRender} from './render.spec';

declare global {
  const process: {env: {_START: string}};

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

type Api = readonly [
  createLocator: CreateLocator,
  getLocatorParameters: GetLocatorParameters,
  removeLocatorFromProperties: RemoveLocatorFromProperties,
];

const {log} = console;
let testsCount = 0;

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

export type {Checks} from './types.spec';

export type Test = (api: Api, environment: string) => void;

const ok = (message: string) => log(`\x1B[32m[OK]\x1B[39m ${message}`);

const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

const createLocatorWithIsProduction = ((...args: Parameters<typeof createLocator>) => {
  if (typeof args[0] === 'string') {
    args[1] = {...args[1], isProduction: true};
  }

  return createLocator(...args);
}) as unknown as typeof createLocator;

const environments: Readonly<Record<string, Api>> = {
  development: [createLocator, getLocatorParameters, removeLocatorFromProperties],
  production: [
    productionCreateLocator,
    productionGetLocatorParameters,
    productionRemoveLocatorFromProperties,
  ],
  productionWithDevParameters: [
    productionCreateLocator,
    getLocatorParameters,
    productionRemoveLocatorFromProperties,
  ],
  productionFromOptionsWithDevParameters: [
    createLocatorWithIsProduction,
    getLocatorParameters,
    productionRemoveLocatorFromProperties,
  ],
  productionFromOptionsWithProdParameters: [
    createLocatorWithIsProduction,
    productionGetLocatorParameters,
    productionRemoveLocatorFromProperties,
  ],
};
const tests: readonly Test[] = [testBasicInteractions, testCache, testRender];

for (const test of tests) {
  log(`${test.name}<`);

  for (const [environment, api] of Object.entries(environments)) {
    log(` ${environment}:`);
    test(api, environment);
  }

  log('>');
}

ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
