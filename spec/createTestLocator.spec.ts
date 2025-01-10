import {createTestLocator} from 'create-locator/createTestLocator';

import {assert, attributesOptions, createLocatorByCssSelector} from './utils.js';

const {getSelector, getTestId, locator} = createTestLocator({
  attributesOptions,
  createLocatorByCssSelector,
  supportWildcardsInCssSelectors: true,
});

const {parameterAttributePrefix, testIdAttribute, testIdSeparator} = attributesOptions;

const fooLocator = locator('foo', {bar: 'baz'});

const fooSelector = getSelector('foo', {bar: 'baz'});

assert(locator('foo').selector === `[${testIdAttribute}="foo"]`, 'creates correct selector');

assert(fooLocator.selector === fooSelector, 'selector(...) works correctly');

assert(Object.keys(locator('foo')).length === 2, 'locator object has correct number of properties');

assert(Object.keys(locator('foo'))[1] === 'selector', 'selector has correct shape');

assert(
  locator('foo', undefined, {bar: 3}).selector === '',
  'locator(...) works correctly with empty testId',
);

assert(
  getSelector('foo', 'bar', null, {bar: 3}) === '',
  'selector(...) works correctly with empty testId',
);

assert(getTestId(undefined, 'foo', 'bar') === '', 'testId(...) works correctly with empty testId');

assert(
  getTestId('foo', 'bar') === ['foo', 'bar'].join(testIdSeparator),
  'testId(...) works correctly',
);

assert(
  fooLocator.selector === `[${testIdAttribute}="foo"][${parameterAttributePrefix}bar="baz"]`,
  'selector has parameter value',
);

assert(locator('foo') !== locator('foo'), 'locators are not cached');

assert(
  locator('foo', 'bar').selector === `[${testIdAttribute}="${'foo'}${testIdSeparator}bar"]`,
  'locator(...) correctly join parts of testId',
);

assert(
  getSelector('foo', 'bar') === `[${testIdAttribute}="${'foo'}${testIdSeparator}bar"]`,
  'selector(...) correctly join parts of testId',
);

assert(
  locator('foo', 'bar', {qux: 3}).selector ===
    `[${testIdAttribute}="${'foo'}${testIdSeparator}bar"][${parameterAttributePrefix}qux="3"]`,
  'locator(...) creates correct selector with multipart testId and parameters',
);

assert(
  getSelector('foo', 'bar', {qux: 3}) ===
    `[${testIdAttribute}="${'foo'}${testIdSeparator}bar"][${parameterAttributePrefix}qux="3"]`,
  'selector(...) creates correct selector with multipart testId and parameters',
);

assert(
  locator('foo', {qux: 'bar*baz'}).selector ===
    `[${testIdAttribute}="foo"][${parameterAttributePrefix}qux^="bar"][${parameterAttributePrefix}qux$="baz"]`,
  'locator(...) supports wildcards',
);

assert(
  getSelector('foo', {qux: 'bar*baz'}) ===
    `[${testIdAttribute}="foo"][${parameterAttributePrefix}qux^="bar"][${parameterAttributePrefix}qux$="baz"]`,
  'selector(...) supports wildcards',
);

assert(
  locator('foo', {foo: 'bar*baz*', qux: '*quux'}).selector ===
    getSelector('foo', {foo: 'bar*baz*', qux: '*quux'}),
  'locator(...) and selector(...) works correctly with complicated wildcards',
);

{
  const parameterAttributePrefix = 'data-othertest-';
  const testIdAttribute = 'data-othertestid';
  const testIdSeparator = '|';

  const {getSelector, getTestId, locator} = createTestLocator({
    attributesOptions: {parameterAttributePrefix, testIdAttribute, testIdSeparator},
    createLocatorByCssSelector,
    supportWildcardsInCssSelectors: false,
  });

  assert(
    locator('foo', 'quux', {qux: 'bar*baz'}).selector ===
      `[${testIdAttribute}="foo${testIdSeparator}quux"][${parameterAttributePrefix}qux="bar*baz"]`,
    'can disable wildcards',
  );

  assert(
    getSelector('foo', 'quux', {qux: 'bar*baz'}) ===
      `[${testIdAttribute}="foo${testIdSeparator}quux"][${parameterAttributePrefix}qux="bar*baz"]`,
    'respect non default attributes options',
  );

  assert(
    getTestId('foo', 'quux', {qux: 'bar*baz'}) === `foo${testIdSeparator}quux`,
    'testId(...) respect non default testIdSeparator',
  );
}
