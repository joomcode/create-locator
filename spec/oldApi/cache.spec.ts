import type {Locator} from 'create-locator';

import {assert, assertShallowEqual, getShallowCopy, type Test} from './utils';

type AnyLocator = (parameters?: unknown) => {second: AnyLocator};

type RootLocator = Locator<{foo: Record<string, string>}, Record<string, string>>;

const attributesAreCached = (
  locator: AnyLocator,
  locatorName: string,
  parametersArray: readonly unknown[],
  isDevelopment: boolean,
): void => {
  const attributesSet = new Set();

  assert(locator() === locator());

  assert(
    (locator() !== locator(undefined)) === isDevelopment,
    `${locatorName}: attributes without parameters is${
      isDevelopment ? ' not' : ''
    } equal to attributes with undefined parameters`,
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
    );

    assertShallowEqual(attributes, attributesCopy);
    assertShallowEqual(attributes, secondAttributesCopy);
    assertShallowEqual(attributes, thirdAttributesCopy);
    assertShallowEqual(attributes, fourthAttributesCopy);

    attributesSet.add(attributes);

    if (isDevelopment && locatorName === 'locatorWithMap') {
      const mappedAttributesChains = new Set();

      for (const secondParameters of parametersArray) {
        const mapped = locator(parameters).second(secondParameters);
        const mappedCopy = locator(getShallowCopy(parameters)).second(secondParameters);
        const mappedSecondCopy = locator(parameters).second(getShallowCopy(secondParameters));

        assert(mapped === mappedCopy && mapped === mappedSecondCopy);

        mappedAttributesChains.add(mapped);
      }

      assert(
        mappedAttributesChains.size === parametersArray.length,
        `${locatorName}: has correct number of cached mapped attributes chains`,
      );
    }
  }

  assert(
    attributesSet.size === (isDevelopment ? parametersArray.length : 1),
    `${locatorName}: has correct number of cached attributes`,
  );
};

export const testCache: Test = ([_createLocator, createRootLocator], environment) => {
  const isDevelopment = environment === 'development';

  const rootLocator = createRootLocator<RootLocator>('root');
  const locatorWithMap = createRootLocator<RootLocator, object>('root', {
    mapAttributesChain: (attributesChain) => attributesChain,
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

  attributesAreCached(
    rootLocator as unknown as AnyLocator,
    'rootLocator',
    parametersArray,
    isDevelopment,
  );
  attributesAreCached(
    rootLocator.foo as unknown as AnyLocator,
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
