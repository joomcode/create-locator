import {createLocator, setOptions} from 'create-locator';

import './oldApi/index.spec';

export type * from './types.spec';

const assert = (value: boolean, message: string): void => {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }
};

const locator = createLocator('1', {foo: {}, bar: null});

setOptions({
  childLocatorIdSeparator: '-',
  locatorIdAttribute: 'data-testid',
  parameterAttributePrefix: 'data-test-',
});

locator();

const attributes = locator.foo({qux: 'quux'});

locator.bar();

assert(attributes === locator.foo({qux: 'quux'}), 'attributes are cached');

assert(Object.keys(attributes!).length === 2, 'has correct number of attributes');

assert(Object.keys(attributes!)[0] === 'data-testid', 'used correct locatorIdAttribute');

assert(
  Object.keys(attributes!)[1] === 'data-test-qux',
  'used correct attribute name for parameter',
);

assert(attributes!['data-testid'] === '1-foo', 'has correct child locatorId');

assert(attributes!['data-test-qux'] === 'quux', 'has correct parameter value');
