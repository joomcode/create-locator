import {createLocator, setOptions} from 'create-locator';

import {assert, defaultOptions, locatorId} from './utils.js';

createLocator(locatorId, {foo: {}, bar: null, root: {}});

createLocator(`${locatorId}-bar`, {foo: {}});

try {
  setOptions(defaultOptions);

  throw new Error('');
} catch (error) {
  const {message} = error as Error;

  assert(
    message.includes(`"${locatorId}-bar"`) && message.includes('More than one'),
    `throws correct "more than one locator" error for child locator (${message})`,
  );
}
