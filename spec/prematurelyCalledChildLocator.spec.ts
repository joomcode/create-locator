import {createLocator, setOptions} from 'create-locator';

import {assert, defaultOptions, locatorId} from './utils.js';

const locator = createLocator(locatorId, {foo: {}, bar: null, root: {}});

locator.foo({qux: ''});

try {
  setOptions(defaultOptions);

  throw new Error('');
} catch (error) {
  const {message} = error as Error;

  assert(
    message.includes(`"${locatorId}"`) && message.includes('was called before'),
    `throws correct "called before options were set" error for child locator (${message})`,
  );
}
