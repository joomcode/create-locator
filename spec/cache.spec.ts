import type {Locator} from '../index';

import {assert, assertPropertiesAreEqual, type Test} from './index.spec';

type RootLocator = Locator<{foo: Record<string, string>}, Record<string, string>>;

type AnyLocator = (parameters?: unknown) => object;

const assertShallowEqual = (a: object, b: object): void => {
  const keys = Reflect.ownKeys(a);

  assert(keys.length === Reflect.ownKeys(b).length);

  assertPropertiesAreEqual(keys, a, b);
};

const getShallowCopy = <T>(value: T): T => {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    return value;
  }

  const copy = Object.create(Object.getPrototypeOf(value));

  for (const key of Reflect.ownKeys(value as object)) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(value, key)!);
  }

  return copy;
};

const attributesAreCached = (
  locator: AnyLocator,
  locatorName: string,
  parametersArray: readonly unknown[],
  isDevelopment: boolean,
): void => {
  const attributesSet = new Set();

  assert(
    locator() === locator(undefined),
    `${locatorName}: attributes without parameters is equal to attributes with undefined parameters`,
  );

  for (const parameters of parametersArray) {
    const attributes = locator(parameters);
    const attributesCopy = getShallowCopy(attributes);

    const secondAttributes = locator(parameters);
    const secondAttributesCopy = getShallowCopy(secondAttributes);

    const thirdAttributes = locator(getShallowCopy(parameters));
    const thirdAttributesCopy = getShallowCopy(thirdAttributes);

    const fourthAttributes = locator(getShallowCopy(parameters));
    const fourthAttributesCopy = getShallowCopy(fourthAttributes);

    assert(
      attributes === secondAttributes &&
        attributes === thirdAttributes &&
        attributes === fourthAttributes,
      `${locatorName}: attributes cached for parameters ${JSON.stringify(parameters)}`,
    );

    assertShallowEqual(attributes, attributesCopy);
    assertShallowEqual(attributes, secondAttributesCopy);
    assertShallowEqual(attributes, thirdAttributesCopy);
    assertShallowEqual(attributes, fourthAttributesCopy);

    attributesSet.add(attributes);
  }

  assert(
    attributesSet.size === (isDevelopment ? parametersArray.length : 1),
    `${locatorName}: has correct number of attributes`,
  );
};

export const testCache: Test = ([createLocator], environment) => {
  const isDevelopment = environment === 'development';

  const rootLocator = createLocator<RootLocator>('root');
  const locatorWithMap = createLocator<RootLocator, object>('root', {
    mapAttributes: (attributes) => attributes,
  });

  const SYMBOL = Symbol();

  const parametersArray = [
    undefined,
    null,
    {},
    0,
    3,
    '3',
    '0',
    '+0',
    'foo',
    true,
    false,
    {__proto__: {toString: () => 'foo'}},
    {__proto__: {toString: () => 'bar'}},
    {foo: 1},
    {foo: 1, bar: 'baz'},
    {foo: 1, bar: 'baz', qux: undefined},
    {foo: 1, bar: 'baz', qux: undefined, [SYMBOL]: null},
  ];

  const last = getShallowCopy(parametersArray[parametersArray.length - 1]);

  Object.defineProperty(last, 'quux', {});

  parametersArray.push(last);

  attributesAreCached(rootLocator as AnyLocator, 'rootLocator', parametersArray, isDevelopment);
  attributesAreCached(
    rootLocator.foo as AnyLocator,
    'childLocator',
    parametersArray,
    isDevelopment,
  );
  attributesAreCached(
    locatorWithMap as AnyLocator,
    'locatorWithMap',
    parametersArray,
    isDevelopment,
  );
};