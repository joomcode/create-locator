import {createTestUtils} from 'create-locator/createTestUtils';

import {assert, attributesOptions, createLocatorByCssSelector} from './utils.js';

const {and, chain, createLocatorOperator, has, locator, not, or, selectorByLocator} =
  createTestUtils({
    attributesOptions,
    createLocatorByCssSelector,
    supportWildcardsInCssSelectors: true,
  });

const {parameterAttributePrefix, testIdAttribute, testIdSeparator} = attributesOptions;

const testId = 'foo';

const fooLocator = locator(testId, {bar: 'baz'});
const barLocator = locator('bar');

assert(locator(testId).selector === `[${testIdAttribute}="${testId}"]`, 'creates correct selector');

assert(
  fooLocator.selector === selectorByLocator.get(fooLocator),
  'selectorByLocator works correctly',
);

assert(Object.keys(locator('foo')).length === 2, 'locator object has correct number of properties');

assert(Object.keys(locator('foo'))[1] === 'selector', 'selector has correct shape');

assert(
  fooLocator.selector === `[${testIdAttribute}="${testId}"][${parameterAttributePrefix}bar="baz"]`,
  'selector has parameter value',
);

assert(locator('foo') !== locator('foo'), 'locators are not cached');

assert(
  locator(testId, 'bar').selector === `[${testIdAttribute}="${testId}${testIdSeparator}bar"]`,
  'correctly join parts of testId',
);

assert(
  locator(testId, 'bar', {qux: 3}).selector ===
    `[${testIdAttribute}="${testId}${testIdSeparator}bar"][${parameterAttributePrefix}qux="3"]`,
  'creates correct selector with multipart testId and parameters',
);

assert(
  locator(testId, {qux: 'bar*baz'}).selector ===
    `[${testIdAttribute}="${testId}"][${parameterAttributePrefix}qux^="bar"][${parameterAttributePrefix}qux$="baz"]`,
  'supports wildcards',
);

assert(
  locator(testId, {foo: 'bar*baz'}).selector ===
    selectorByLocator.get(locator(testId, {foo: 'bar*baz'})),
  'selectorByLocator works correctly with wildcards',
);

{
  const testIdAttribute = 'data-othertest';

  const {locator} = createTestUtils({
    attributesOptions: {...attributesOptions, testIdAttribute},
    createLocatorByCssSelector,
    supportWildcardsInCssSelectors: false,
  });

  assert(
    locator(testId, {qux: 'bar*baz'}).selector ===
      `[${testIdAttribute}="${testId}"][${parameterAttributePrefix}qux="bar*baz"]`,
    'can disable wildcards',
  );
}

assert(
  and(fooLocator, barLocator).selector === `${fooLocator.selector}${barLocator.selector}`,
  'operator "and" works correctly',
);

assert(and(fooLocator) === fooLocator, 'operator "and" works correctly with one locator');

assert(
  chain(fooLocator, barLocator).selector === `${fooLocator.selector} ${barLocator.selector}`,
  'operator "chain" works correctly',
);

assert(chain(fooLocator) === fooLocator, 'operator "chain" works correctly with one locator');

assert(
  has(fooLocator, barLocator).selector === `:has(${fooLocator.selector}, ${barLocator.selector})`,
  'operator "has" works correctly',
);

assert(
  has(fooLocator).selector === `:has(${fooLocator.selector})`,
  'operator "has" works correctly with one locator',
);

assert(
  not(fooLocator, barLocator).selector === `:not(${fooLocator.selector}, ${barLocator.selector})`,
  'operator "not" works correctly',
);

assert(
  not(fooLocator).selector === `:not(${fooLocator.selector})`,
  'operator "not" works correctly with one locator',
);

assert(
  or(fooLocator, barLocator).selector === `:is(${fooLocator.selector}, ${barLocator.selector})`,
  'operator "or" works correctly',
);

assert(or(fooLocator) === fooLocator, 'operator "or" works correctly with one locator');

assert(selectorByLocator instanceof WeakMap, 'selectorByLocator is instance of WeakMap');

const locatorOperator = createLocatorOperator((...selectors) => selectors.join('qux'));

assert(
  locatorOperator(fooLocator, barLocator).selector ===
    `${fooLocator.selector}qux${barLocator.selector}`,
  'operator "or" works correctly',
);

assert(
  locatorOperator(fooLocator) === fooLocator,
  'locator operator works correctly with one locator',
);

let throwsCount = 0;

try {
  // @ts-expect-error
  and();
} catch {
  throwsCount += 1;
}

try {
  // @ts-expect-error
  chain();
} catch {
  throwsCount += 1;
}

try {
  // @ts-expect-error
  has();
} catch {
  throwsCount += 1;
}

try {
  // @ts-expect-error
  locatorOperator();
} catch {
  throwsCount += 1;
}

try {
  // @ts-expect-error
  not();
} catch {
  throwsCount += 1;
}

try {
  // @ts-expect-error
  or();
} catch {
  throwsCount += 1;
}

assert(throwsCount === 6, 'locator operators throw without arguments');
