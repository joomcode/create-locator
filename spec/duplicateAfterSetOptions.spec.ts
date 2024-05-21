import {createLocator, setOptions} from 'create-locator';

import {assert, defaultOptions, locatorId} from './utils.js';

createLocator(locatorId, {foo: {}, bar: null, 'qux-quux': {}});

setOptions(defaultOptions);

try {
  createLocator(`${locatorId}-qux`, {quux: null});

  throw new Error('');
} catch (error) {
  const {message} = error as Error;

  assert(
    message.includes(`"${locatorId}-qux-quux"`) && message.includes('More than one'),
    `throws correct "more than one locator" error after set options for child and child locator (${message})`,
  );
}

try {
  createLocator(`${locatorId}-bar`, {foo: {}});

  throw new Error('');
} catch (error) {
  const {message} = error as Error;

  assert(
    message.includes(`"${locatorId}-bar"`) && message.includes('More than one'),
    `throws correct "more than one locator" error after set options for child locator (${message})`,
  );
}

try {
  createLocator(locatorId);

  throw new Error('');
} catch (error) {
  const {message} = error as Error;

  assert(
    message.includes(`"${locatorId}"`) && message.includes('More than one'),
    `throws correct "more than one locator" error after set options for root locator (${message})`,
  );
}
