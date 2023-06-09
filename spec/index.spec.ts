import {createLocator, getLocatorParameters, removeMarkFromProperties} from 'create-locator';
import {
  createLocator as productionCreateLocator,
  getLocatorParameters as productionGetLocatorParameters,
  removeMarkFromProperties as productionRemoveMarkFromProperties,
} from 'create-locator/production';

import {testBasicInteractions} from './basicInteractions.spec';
import {testCache} from './cache.spec';
import {testRender} from './render.spec';
import {type Api, log, ok, type Test, testsCount} from './utils';

const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

const createLocatorWithIsProduction = ((...args: Parameters<typeof createLocator>) => {
  if (typeof args[0] === 'string') {
    args[1] = {...args[1], isProduction: true};
  }

  return createLocator(...args);
}) as unknown as typeof createLocator;

const environments: Readonly<Record<string, Api>> = {
  development: [createLocator, getLocatorParameters, removeMarkFromProperties],
  production: [
    productionCreateLocator,
    productionGetLocatorParameters,
    productionRemoveMarkFromProperties,
  ],
  productionWithDevParameters: [
    productionCreateLocator,
    getLocatorParameters,
    productionRemoveMarkFromProperties,
  ],
  productionFromOptionsWithDevParameters: [
    createLocatorWithIsProduction,
    getLocatorParameters,
    productionRemoveMarkFromProperties,
  ],
  productionFromOptionsWithProdParameters: [
    createLocatorWithIsProduction,
    productionGetLocatorParameters,
    productionRemoveMarkFromProperties,
  ],
};

const tests: readonly Test[] = [testBasicInteractions, testCache, testRender];

for (const test of tests) {
  log(`${test.name}<`);

  for (const environment of Object.keys(environments)) {
    log(` ${environment}:`);
    test(environments[environment]!, environment);
  }

  log('>');
}

ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
