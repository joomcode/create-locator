import {createLocatorCreatorInTests} from 'create-locator/createLocatorCreatorInTests';

import {assert, defaultOptions, locatorId} from './utils';

import type {Locator} from './index.spec';

type Selector = {css: string};

const createSelector = (css: string): Selector => ({css});

const createLocatorInTests = createLocatorCreatorInTests(createSelector, defaultOptions);

const locator = createLocatorInTests<Locator>(locatorId);

assert(locator().css === `[data-testid="${locatorId}"]`, 'creates correct css');

const selector = locator.foo({qux: 'quux'});

locator.bar();

assert(Object.keys(locator()).length === 1, 'selector has correct number of properties');

assert(locator() === locator(), 'selectors are cached');

assert(Object.keys(locator())[0] === 'css', 'selector has correct shape');

assert(
  locator({qux: '2'}).css === `[data-testid="${locatorId}"][data-test-qux="2"]`,
  'selector has parameter value',
);

assert(selector === locator.foo({qux: 'quux'}), 'selectors with parameters are cached');

assert(
  Object.keys(selector).length === 1,
  'selector with parameters has correct number of properties',
);

assert(Object.keys(selector)[0] === 'css', 'selector with parameters has correct shape');

assert(
  selector.css === `[data-testid="${locatorId}-foo"][data-test-qux="quux"]`,
  'selector has correct css',
);

assert(
  locator.foo().css === `[data-testid="${locatorId}-foo"]`,
  'creates correct css for child locators',
);

assert(
  locator.foo({bar: 'baz'}).css === `[data-testid="${locatorId}-foo"][data-test-bar="baz"]`,
  'creates correct css for child locators with parameters',
);

assert(
  locator({foo: 'bar*baz'}).css ===
    `[data-testid="${locatorId}"][data-test-foo^="bar"][data-test-foo$="baz"]`,
  'supports wildcards',
);

{
  const idAttribute = 'data-othertest';

  const createLocatorInTests = createLocatorCreatorInTests(createSelector, {
    ...defaultOptions,
    disableWildcards: true,
    idAttribute,
  });

  const locator = createLocatorInTests<Locator>(locatorId);

  assert(
    locator({foo: 'bar*baz'}).css === `[${idAttribute}="${locatorId}"][data-test-foo="bar*baz"]`,
    'can disable wildcards',
  );
}
