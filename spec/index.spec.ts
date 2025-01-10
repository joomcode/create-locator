import {createSimpleLocator} from 'create-locator';

import {assert, attributesOptions, ok, testsCount} from './utils.js';

export type * from './createTestLocator.types.spec.js';
export type * from './types.spec.js';

let startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

await import('./oldApi/index.spec.js');

startTestsTime = Date.now();

await import('./createTestLocator.spec.js');

const {getTestId, locator} = createSimpleLocator({attributesOptions, isProduction: false});

const {parameterAttributePrefix, testIdAttribute, testIdSeparator} = attributesOptions;

const attributes = locator('foo', 'bar', {qux: 'quux'});
const testId = getTestId('foo', 'bar', {qux: 'quux'});

assert(locator('bar')[testIdAttribute] === 'bar', 'has correct testId');

assert(locator('foo') !== locator('foo'), 'attributes are not cached');

assert(
  attributes !== locator('foo', 'bar', {qux: 'quux'}),
  'attributes with parameters are not cached',
);

assert(Object.keys(attributes).length === 2, 'has correct number of attributes');

assert(Object.keys(attributes)[0] === testIdAttribute, 'used correct idAttribute');

assert(
  Object.keys(attributes)[1] === `${parameterAttributePrefix}qux`,
  'used correct attribute name for parameter',
);

assert(attributes[testIdAttribute] === `foo${testIdSeparator}bar`, 'has correct testId from parts');

assert(attributes[`${parameterAttributePrefix}qux`] === 'quux', 'has correct parameter value');

assert(testId === attributes[testIdAttribute], 'getTestId return correct value');

const emptyLocator = locator(undefined);
const emptyTestId = getTestId(undefined);

// @ts-expect-error
assert(emptyLocator === locator(), 'support empty arguments list of testId parts');

assert(emptyLocator === locator(null), 'support null in testId');

assert(emptyLocator === locator(''), 'support empty string in testId');

assert(
  emptyLocator === locator('baz', undefined) &&
    emptyLocator === locator('baz', undefined, 'bar') &&
    emptyLocator === locator('baz', undefined, {foo: 2}),
  'support undefined in testId parts',
);

assert(
  emptyLocator === locator('baz', null) &&
    emptyLocator === locator('baz', null, 'bar') &&
    emptyLocator === locator('baz', null, {foo: true}),
  'support null in testId parts',
);

assert(
  emptyLocator === locator('foo', '') &&
    emptyLocator === locator('foo', '', 'bar') &&
    emptyLocator === locator('foo', '', {bar: null}),
  'support empty string in testId parts',
);

assert(emptyTestId === '', 'empty locator has empty testId');

assert(Object.keys(emptyLocator).length === 0, 'empty locator has no attributes');

assert(
  Object.keys(locator('foo', {bar: null, baz: undefined})).length === 1,
  'skip empty parameters',
);

assert(getTestId(3) === '3', 'support numbers as testId');

assert(getTestId(true) === 'true', 'support boolean as testId');

assert(
  locator('foo', {qux: 3})[`${parameterAttributePrefix}qux`] === '3',
  'support numbers as parameter value',
);

assert(
  locator('foo', {qux: false})[`${parameterAttributePrefix}qux`] === 'false',
  'support boolean as parameter value',
);

assert(
  locator('foo', {bar: false, baz: 12})[`${parameterAttributePrefix}baz`] === '12',
  'support multi parameters',
);

const {getTestId: productionGetTestId, locator: productionLocator} = createSimpleLocator({
  attributesOptions,
  isProduction: true,
});

assert(productionLocator('foo') !== emptyLocator, 'createSimpleLocator creates new empty locator');

assert(
  productionGetTestId('foo') === '' && productionLocator('foo') === productionLocator(null),
  'production locator is empty',
);

ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
