import {createLocator} from 'create-locator';

import type {Attributes, IsEqual} from 'create-locator/types';

createLocator('');

{
  const locator = createLocator('', {});

  true satisfies IsEqual<string & keyof typeof locator, never>;
}

createLocator('', {foo: null});

createLocator('', {foo: null, bar: {}});

const locator = createLocator('', {foo: null, bar: {}, baz: {} as {qux: string}});

export type Locator = typeof locator;

{
  // @ts-expect-error
  const wrongLocator = createLocator('', {baz: {} as {qux: number}});

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocator('' as string);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

createLocator('')() satisfies Attributes;

// @ts-expect-error
createLocator('')({}) satisfies Attributes;

createLocator('', {root: null})() satisfies Attributes;

createLocator('', {foo: {}, root: null})() satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {}, root: undefined})() satisfies Attributes;

createLocator('', {foo: {}})() satisfies Attributes;

createLocator('', {root: {}})({}) satisfies Attributes;

createLocator('', {root: {}})() satisfies Attributes;

createLocator('', {root: {} as {bar?: string}})() satisfies Attributes;

// @ts-expect-error
createLocator('', {root: {} as {bar: string}})() satisfies Attributes;

// @ts-expect-error
createLocator('', {root: {} as {bar: string}})({}) satisfies Attributes;

// @ts-expect-error
createLocator('', {root: {} as {bar: string}})({baz: ''}) satisfies Attributes;

createLocator('', {root: {} as {bar: string}})({bar: ''}) satisfies Attributes;

// @ts-expect-error
createLocator('', {root: {} as {bar: 'baz'}})({bar: ''}) satisfies Attributes;

createLocator('', {root: {} as {bar: 'baz'}})({bar: 'baz'}) satisfies Attributes;

// @ts-expect-error
createLocator('', {root: {} as {bar: 'baz'}}).root;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).root;

createLocator('', {foo: {} as {bar: 'baz'}}).foo;

// @ts-expect-error
createLocator('', {foo: undefined});

createLocator('', {foo: {} as {bar: 'baz'}}).foo({bar: 'baz'}) satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).bar({bar: 'baz'}) satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).foo({bar: ''}) satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).foo() satisfies Attributes;

const locatorId = '' as string;

{
  // @ts-expect-error
  const wrongLocator = createLocator(locatorId);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocator(locatorId, {foo: {}});

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocator('', {foo: ''});

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocator('', {} as object);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  // @ts-expect-error
  const wrongLocator = createLocator('', {} as Record<string, unknown>);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}

{
  const wrongLocator = createLocator('', {} as never);

  true satisfies IsEqual<typeof wrongLocator, unknown>;
}
