import {createLocatorCreatorInTests} from 'create-locator/createLocatorCreatorInTests';
import type {IsEqual} from 'create-locator/types';

import {defaultOptions, locatorId} from './utils';

import type {Locator as OtherLocator} from './index.spec';
import type {Locator} from './types.spec';

type Selector = {isSelector: true};

const createSelector = (css: string): Selector => ({isSelector: true, css}) as Selector;

const createLocatorInTests = createLocatorCreatorInTests(createSelector, defaultOptions);

const locator = createLocatorInTests<Locator>('');

// @ts-expect-error
createLocatorInTests<Locator>(locatorId);

// @ts-expect-error
createLocatorInTests<OtherLocator>('');

createLocatorInTests<OtherLocator>(locatorId);

// @ts-expect-error
createLocatorInTests<Locator>('foo' as string);

{
  // @ts-expect-error
  const wrongCreateLocator = createLocatorCreatorInTests((css: number) => {}, defaultOptions);

  true satisfies IsEqual<typeof wrongCreateLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongCreateLocator = createLocatorCreatorInTests(createSelector);

  true satisfies IsEqual<typeof wrongCreateLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongCreateLocator = createLocatorCreatorInTests(createSelector, {});

  true satisfies IsEqual<typeof wrongCreateLocator, unknown>;
}

{
  const wrongCreateLocator = createLocatorCreatorInTests(createSelector, {
    ...defaultOptions,
    // @ts-expect-error
    disableWildcards: 2,
  });

  true satisfies IsEqual<typeof wrongCreateLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocatorInTests<Locator & OtherLocator>('');

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocatorInTests<Locator & OtherLocator>(locatorId);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocatorInTests<Locator & OtherLocator>('' as string);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocatorInTests<{}>('');

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocatorInTests<2>('');

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocatorInTests<''>('');

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

locator() satisfies Selector;

// @ts-expect-error
locator({}) satisfies Selector;

locator.foo() satisfies Selector;

// @ts-expect-error
locator.foo({}) satisfies Selector;

locator.bar({}) satisfies Selector;

locator.bar() satisfies Selector;

locator.baz({qux: ''}) satisfies Selector;

// @ts-expect-error
locator.baz({qux: 2}) satisfies Selector;

// @ts-expect-error
locator.baz({quux: ''}) satisfies Selector;

// @ts-expect-error
locator.baz({}) satisfies Selector;

// @ts-expect-error
locator.baz() satisfies Selector;
