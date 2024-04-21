import type {OptionsInTests} from 'create-locator';
import {createLocatorCreatorInTests} from 'create-locator/createLocatorCreatorInTests';
import type {IsEqual} from 'create-locator/types';

import {defaultOptions, locatorId} from './utils';

import type {Locator as OtherLocator} from './index.spec';
import type {Locator, LocatorWithName} from './types.spec';

type Selector = {isSelector: true};

const createSelector = (css: string): Selector => ({isSelector: true, css}) as Selector;

const createLocatorInTests = createLocatorCreatorInTests(createSelector, defaultOptions);

const locator = createLocatorInTests<Locator>('');

locator() satisfies Selector;

// @ts-expect-error
locator(undefined);

// @ts-expect-error
locator({});

locator.foo() satisfies Selector;

// @ts-expect-error
locator.foo(undefined);

// @ts-expect-error
locator.foo({});

locator.toString() satisfies '';

locator.toCss() satisfies string;

// @ts-expect-error
locator.toCss(null);

// @ts-expect-error
locator.toCss(undefined);

// @ts-expect-error
locator.toCss({});

locator.foo.toString() satisfies string;

locator.foo.toCss() satisfies string;

// @ts-expect-error
locator.foo.toCss(null);

// @ts-expect-error
locator.foo.toCss(undefined);

// @ts-expect-error
locator.foo.toCss({});

locator.bar.toCss() satisfies string;

// @ts-expect-error
locator.bar.toCss(null);

locator.bar.toCss(undefined) satisfies string;

locator.bar.toCss({}) satisfies string;

locator.bar.toCss({quux: ''}) satisfies string;

// @ts-expect-error
locator.bar.toCss({quux: 3});

locator.baz.toCss({qux: ''}) satisfies string;

// @ts-expect-error
locator.baz.toCss({foo: '', qux: ''});

// @ts-expect-error
locator.baz.toCss(null);

// @ts-expect-error
locator.baz.toCss(undefined);

// @ts-expect-error
locator.baz.toCss({});

// @ts-expect-error
locator.baz.toCss({quux: ''});

// @ts-expect-error
locator.baz.toCss({qux: 3});

// @ts-expect-error
createLocatorInTests<Locator>(locatorId);

// @ts-expect-error
createLocatorInTests<OtherLocator>('');

createLocatorInTests<OtherLocator>(locatorId).toString() satisfies typeof locatorId;

createLocatorInTests<OtherLocator>(locatorId).toCss() satisfies string;

createLocatorInTests<OtherLocator>(locatorId).toCss({}) satisfies string;

createLocatorInTests<OtherLocator>(locatorId).toCss({foo: ''}) satisfies string;

// @ts-expect-error
createLocatorInTests<OtherLocator>(locatorId).toCss({foo: 2}) satisfies string;

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
  const wrongCreateLocator = createLocatorCreatorInTests(createSelector, {} as OptionsInTests);

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
locator.foo(null);

locator.foo.toCss() satisfies string;

// @ts-expect-error
locator.foo.toCss({});

// @ts-expect-error
locator.foo.toCss(null);

// @ts-expect-error
locator.foo({}) satisfies Selector;

locator.bar({}) satisfies Selector;

locator.bar.toString() satisfies `${(typeof defaultOptions)['childSeparator']}bar`;

locator.bar() satisfies Selector;

locator.baz({qux: ''}) satisfies Selector;

locator.baz.toString() satisfies `${(typeof defaultOptions)['childSeparator']}baz`;

// @ts-expect-error
locator.baz({qux: 2}) satisfies Selector;

// @ts-expect-error
locator.baz({quux: ''}) satisfies Selector;

// @ts-expect-error
locator.baz({}) satisfies Selector;

// @ts-expect-error
locator.baz() satisfies Selector;

const locatorWithName = createLocatorInTests<LocatorWithName>('');

locatorWithName.length() satisfies Selector;

locatorWithName.name() satisfies Selector;

createLocatorInTests<OtherLocator>(
  locatorId,
).foo.toString() satisfies `${typeof locatorId}${(typeof defaultOptions)['childSeparator']}foo`;
