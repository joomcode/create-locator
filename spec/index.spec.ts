import {createLocator, getLocatorParameters} from '../index';
import {
  createLocator as productionCreateLocator,
  getLocatorParameters as productionGetLocatorParameters,
} from '../production';

import {testRender} from './render.spec';

export type {Checks} from './types.spec';

testRender(createLocator, getLocatorParameters, 'development');
testRender(productionCreateLocator, productionGetLocatorParameters, 'production');

console.log('[OK] All tests passed!');
