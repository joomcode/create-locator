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

export function assert(value: unknown, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }

  console.log('✅', message);
}

export type {Checks} from './types.spec';

export type Test = (
  createLocator: CreateLocator,
  getLocatorParameters: GetLocatorParameters,
  environment: string,
) => void;

const ok = (message: string) => console.log(`\x1B[32m[OK]\x1B[39m ${message}`);

const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

const createLocatorWithIsProduction = ((...args: Parameters<typeof createLocator>) => {
  if (typeof args[0] === 'string') {
    args[1] = {...args[1], isProduction: true};
  }

  return createLocator(...args);
}) as typeof createLocator;

testBasicInteractions(createLocator, getLocatorParameters, 'development');
testBasicInteractions(productionCreateLocator, productionGetLocatorParameters, 'production');
testBasicInteractions(
  productionCreateLocator,
  getLocatorParameters,
  'production-with-dev-parameters',
);
testBasicInteractions(
  createLocatorWithIsProduction,
  getLocatorParameters,
  'production-from-options-with-dev-parameters',
);
testBasicInteractions(
  createLocatorWithIsProduction,
  productionGetLocatorParameters,
  'production-from-options-with-prod-parameters',
);

testRender(createLocator, getLocatorParameters, 'development');
testRender(productionCreateLocator, productionGetLocatorParameters, 'production');
testRender(productionCreateLocator, getLocatorParameters, 'production-with-dev-parameters');
testRender(
  createLocatorWithIsProduction,
  getLocatorParameters,
  'production-from-options-with-dev-parameters',
);
testRender(
  createLocatorWithIsProduction,
  productionGetLocatorParameters,
  'production-from-options-with-prod-parameters',
);

ok(`All tests passed in ${Date.now() - startTestsTime}ms!`);
