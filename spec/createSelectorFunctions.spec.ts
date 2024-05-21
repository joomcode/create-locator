import {createSelectorFunctions} from 'create-locator/createSelectorFunctions';

import {assert, defaultOptions, locatorId} from './utils.js';

import type {Locator} from './index.spec';
import type {LocatorWithName} from './types.spec';

type Selector = {css: string};

const createSelector = (css: string): Selector => ({css});

const {createLocatorInTests, findAnyOfSelectors, findChainOfSelectors} = createSelectorFunctions(
  createSelector,
  defaultOptions,
);

const {childSeparator, idAttribute, parameterPrefix} = defaultOptions;

const locator = createLocatorInTests<Locator>(locatorId);

assert(locator().css === `[${idAttribute}="${locatorId}"]`, 'creates correct css');

assert(locator().css === locator.toCss(), 'toCss works correctly');

assert(String(locator) === locatorId, 'converts to string correctly');

assert(locator.toString() === locatorId, 'has correct toString method');

assert(JSON.stringify(locator) === `"${locatorId}"`, 'converts to JSON correctly');

const selector = locator.foo({qux: 'quux'});

locator.bar();

assert(Object.keys(locator()).length === 1, 'selector has correct number of properties');

assert(locator() === locator(), 'selectors are cached');

assert(Object.keys(locator())[0] === 'css', 'selector has correct shape');

assert(
  locator({qux: '2'}).css === `[${idAttribute}="${locatorId}"][${parameterPrefix}qux="2"]`,
  'selector has parameter value',
);

assert(
  locator({qux: '2'}).css === locator.toCss({qux: '2'}),
  'toCss works correctly with parameters',
);

assert(selector === locator.foo({qux: 'quux'}), 'selectors with parameters are cached');

assert(
  Object.keys(selector).length === 1,
  'selector with parameters has correct number of properties',
);

assert(locator.foo === locator.foo, 'child locators are cached');

assert(
  String(locator.foo) === `${locatorId}${childSeparator}foo`,
  'child converts to string correctly',
);

assert(
  locator.foo.toString() === `${locatorId}${childSeparator}foo`,
  'child has correct toString method',
);

assert(
  JSON.stringify(locator.foo) === `"${locatorId}${childSeparator}foo"`,
  'child converts to JSON correctly',
);

assert(Object.keys(selector)[0] === 'css', 'selector with parameters has correct shape');

assert(
  selector.css ===
    `[${idAttribute}="${locatorId}${childSeparator}foo"][${parameterPrefix}qux="quux"]`,
  'selector has correct css',
);

assert(
  locator.foo().css === `[${idAttribute}="${locatorId}${childSeparator}foo"]`,
  'creates correct css for child locators',
);

assert(
  locator.foo({bar: 'baz'}).css ===
    `[${idAttribute}="${locatorId}${childSeparator}foo"][${parameterPrefix}bar="baz"]`,
  'creates correct css for child locators with parameters',
);

assert(
  locator.foo({bar: 'baz'}).css === locator.foo.toCss({bar: 'baz'}),
  'toCss works correctly for child locators with parameters',
);

assert(
  locator({foo: 'bar*baz'}).css ===
    `[${idAttribute}="${locatorId}"][${parameterPrefix}foo^="bar"][${parameterPrefix}foo$="baz"]`,
  'supports wildcards',
);

assert(
  locator({foo: 'bar*baz'}).css === locator.toCss({foo: 'bar*baz'}),
  'toCss works correctly with wildcards',
);

{
  const locator = createLocatorInTests<LocatorWithName>('');

  assert(
    locator.length().css === `[${idAttribute}="${childSeparator}length"]`,
    'works with property "length"',
  );

  assert(
    locator.name().css === `[${idAttribute}="${childSeparator}name"]`,
    'works with property "name"',
  );
}

{
  const idAttribute = 'data-othertest';

  const {createLocatorInTests} = createSelectorFunctions(createSelector, {
    ...defaultOptions,
    disableWildcards: true,
    idAttribute,
  });

  const locator = createLocatorInTests<Locator>(locatorId);

  assert(
    locator({foo: 'bar*baz'}).css ===
      `[${idAttribute}="${locatorId}"][${parameterPrefix}foo="bar*baz"]`,
    'can disable wildcards',
  );
}

const anyOfSelectors = findAnyOfSelectors(locator(), selector);

assert(
  anyOfSelectors.css === `:is(${selector.css}, ${locator().css})`,
  'findAnyOfSelectors works correctly',
);

const chainOfSelectors = findChainOfSelectors(locator(), selector);

assert(
  chainOfSelectors.css === `${locator().css} ${selector.css}`,
  'findChainOfSelectors works correctly',
);

assert(
  findAnyOfSelectors(anyOfSelectors, chainOfSelectors).css ===
    `:is(${selector.css}, ${locator().css}, ${chainOfSelectors.css})`,
  'findAnyOfSelectors works correctly with secondary selectors',
);

assert(
  findChainOfSelectors(anyOfSelectors, chainOfSelectors).css ===
    `${anyOfSelectors.css} ${chainOfSelectors.css}`,
  'findChainOfSelectors works correctly with secondary selectors',
);

assert(
  findAnyOfSelectors(locator(), locator()) === locator(),
  'findAnyOfSelectors works correctly with duplicate selectors',
);

assert(
  findAnyOfSelectors(locator(), selector, locator()) === anyOfSelectors,
  'findAnyOfSelectors works correctly with secondary duplicate selectors',
);

assert(
  findAnyOfSelectors(locator()) === locator(),
  'findAnyOfSelectors works correctly with single selector',
);

assert(
  findChainOfSelectors(locator()) === locator(),
  'findChainOfSelectors works correctly with single selector',
);
