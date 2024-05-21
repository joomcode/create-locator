import {
  createLocator,
  createRootLocator,
  getLocatorParameters,
  removeMarkFromProperties,
  setGlobalProductionMode,
} from 'create-locator';

import {testBasicInteractions} from './basicInteractions.spec.js';
import {testCache} from './cache.spec.js';
import {testGetCssSelectorFromAttributesChain} from './getCssSelectorFromAttributesChain.spec.js';
import {testRender} from './render.spec.js';
import {type Api, log, ok, type Test, testsCount} from './utils.js';

const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

const createRootLocatorWithIsProduction = ((...args: Parameters<typeof createRootLocator>) => {
  if (typeof args[0] === 'string') {
    args[1] = {...args[1], isProduction: true};
  }

  return createRootLocator(...args);
}) as unknown as typeof createRootLocator;

const environments: Readonly<Record<string, Api>> = {
  development: [
    createLocator,
    createRootLocator,
    getLocatorParameters,
    removeMarkFromProperties,
    setGlobalProductionMode,
  ],
  productionFromOptionsWithDevParameters: [
    createLocator,
    createRootLocatorWithIsProduction,
    getLocatorParameters,
    removeMarkFromProperties,
    setGlobalProductionMode,
  ],
};

// Since `testBasicInteractions` turn on global production mode, it must run after other API tests.
const tests: readonly Test[] = [testCache, testRender, testBasicInteractions];

for (const test of tests) {
  log(`${test.name}<`);

  for (const environment of Object.keys(environments)) {
    log(` ${environment}:`);
    test(environments[environment]!, environment);
  }

  log('>');
}

log('getCssSelectorFromAttributesChain<');
log(` development:`);
testGetCssSelectorFromAttributesChain();
log('>');

ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
