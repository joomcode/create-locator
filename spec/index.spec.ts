import {createLocator, getLocatorParameters} from '../index';
import {
  createLocator as productionCreateLocator,
  getLocatorParameters as productionGetLocatorParameters,
} from '../production';

import type {CreateLocator, GetLocatorParameters} from '../types';

import {testBasicInteractions} from './basicInteractions.spec';
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

type Api = readonly [createLocator: CreateLocator, getLocatorParameters: GetLocatorParameters];

const {log} = console;
let testsCount = 0;

export function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }

  testsCount += 1;

  log('  ✅', message);
}

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
}) as typeof createLocator;

const environments: Readonly<Record<string, Api>> = {
  development: [createLocator, getLocatorParameters],
  production: [productionCreateLocator, productionGetLocatorParameters],
  productionWithDevParameters: [productionCreateLocator, getLocatorParameters],
  productionFromOptionsWithDevParameters: [createLocatorWithIsProduction, getLocatorParameters],
  productionFromOptionsWithProdParameters: [
    createLocatorWithIsProduction,
    productionGetLocatorParameters,
  ],
};
const tests: readonly Test[] = [testBasicInteractions, testRender];

for (const test of tests) {
  log(`${test.name}<`);

  for (const [environment, api] of Object.entries(environments)) {
    log(` ${environment}:`);
    test(api, environment);
  }

  log('>');
}

ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
