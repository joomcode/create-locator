import {createLocator} from 'create-locator';
import type {Attributes, IsEqual} from 'create-locator/types';

createLocator('');

createLocator('', {});

createLocator('', {foo: null});

createLocator('', {foo: null, bar: {}});

createLocator('', {foo: null, bar: {}, baz: {} as {qux: string}});

// @ts-expect-error
const wrongLocator = createLocator('', {baz: {} as {qux: number}});

true satisfies IsEqual<typeof wrongLocator, unknown>;

createLocator('')() satisfies Attributes;

// @ts-expect-error
createLocator('')({}) satisfies Attributes;

createLocator('', {root: null})() satisfies Attributes;

createLocator('', {foo: {}, root: null})() satisfies Attributes;

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

createLocator('', {foo: {} as {bar: 'baz'}}).foo;

createLocator('', {foo: {} as {bar: 'baz'}}).foo({bar: 'baz'}) satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).bar({bar: 'baz'}) satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).foo({bar: ''}) satisfies Attributes;

// @ts-expect-error
createLocator('', {foo: {} as {bar: 'baz'}}).foo() satisfies Attributes;
