/// <reference path="./global.d.ts" />

import {createLocator, setOptions} from 'create-locator';
import {fork} from 'node:child_process';

import './oldApi/index.spec';
import {assert, defaultOptions, locatorId} from './utils';

export type * from './createLocatorCreatorInTests.spec';
export type * from './createLocatorCreatorInTests.types.spec';
export type * from './duplicateAfterSetOptions.spec';
export type * from './duplicateChildAndChildLocator.spec';
export type * from './duplicateChildLocator.spec';
export type * from './duplicateRootLocator.spec';
export type * from './prematurelyCalledChildLocator.spec';
export type * from './prematurelyCalledRootLocator.spec';
export type * from './types.spec';

fork('./spec/build/createLocatorCreatorInTests.spec.js');
fork('./spec/build/duplicateAfterSetOptions.spec.js');
fork('./spec/build/duplicateChildAndChildLocator.spec.js');
fork('./spec/build/duplicateChildLocator.spec.js');
fork('./spec/build/duplicateRootLocator.spec.js');
fork('./spec/build/prematurelyCalledChildLocator.spec.js');
fork('./spec/build/prematurelyCalledRootLocator.spec.js');

const locator = createLocator(locatorId, {foo: {}, bar: null, root: {}});

export type Locator = typeof locator;

setOptions(defaultOptions);

const {childSeparator, idAttribute, parameterPrefix} = defaultOptions;

locator();

{
  const attributes = locator.foo({qux: 'quux'});

  locator.bar();

  assert(Object.keys(locator()!).length === 1, 'root locator has correct number of attributes');

  assert(locator() !== locator(), 'attributes from root locator are not cached');

  assert(Object.keys(locator()!)[0] === idAttribute, 'root locator used correct idAttribute');

  assert(locator()![idAttribute] === locatorId, 'root locator has correct locatorId');

  assert(locator({qux: '2'})![`${parameterPrefix}qux`] === '2', 'root locator has parameter value');

  assert(attributes !== locator.foo({qux: 'quux'}), 'attributes are not cached');

  assert(Object.keys(attributes!).length === 2, 'has correct number of attributes');

  assert(Object.keys(attributes!)[0] === idAttribute, 'used correct idAttribute');

  assert(
    Object.keys(attributes!)[1] === `${parameterPrefix}qux`,
    'used correct attribute name for parameter',
  );

  assert(
    attributes![idAttribute] === `${locatorId}${childSeparator}foo`,
    'has correct child locatorId',
  );

  assert(attributes![`${parameterPrefix}qux`] === 'quux', 'has correct parameter value');
}

{
  const locator = createLocator('id', {length: {}, name: {}});

  assert(
    locator.length()![idAttribute] === `id${childSeparator}length`,
    'works with property "length"',
  );

  assert(locator.name()![idAttribute] === `id${childSeparator}name`, 'works with property "name"');
}

setOptions({
  childSeparator: 'childSeparator',
  idAttribute: 'id',
  parameterPrefix: 'prefix',
});

{
  const attributes = locator.foo({qux: 'quux'});

  assert(
    attributes!['id'] === `${locatorId}childSeparatorfoo`,
    'use actual idAttribute and separator',
  );

  assert(attributes!['prefixqux'] === 'quux', 'use actual parameterPrefix');
}
