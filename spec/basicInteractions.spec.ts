import type {Locator, Node} from '../index';

import {assert, type Test} from './index.spec';

type RootLocator = Locator<{toString: {foo: string}; bar: Node<{baz: {}}>}, {qux: string}>;

export const testBasicInteractions: Test = (
  [createLocator, getLocatorParameters, removeLocatorFromProperties],
  environment,
) => {
  const locator = createLocator<RootLocator>('root');
  const SYMBOL = Symbol();

  const anyLocator: any = locator.toString;
  const isDevelopment = environment === 'development';
  const parameters = {qux: 'quux', [SYMBOL]: 8};

  Object.defineProperty(parameters, 'bar', {value: 'baz'});

  const propertiesWithParameters = {...locator(parameters)};
  const keysWithLocator = Object.keys(propertiesWithParameters);

  assert(
    keysWithLocator.length === (isDevelopment ? 1 + Object.keys(parameters).length : 0),
    'locator creates correct number of properties',
  );

  Object.setPrototypeOf(propertiesWithParameters, {});

  (propertiesWithParameters as Record<symbol, unknown>)[SYMBOL] = 3;

  Object.defineProperty(propertiesWithParameters, 'foo', {value: 'bar'});
  Object.defineProperty(propertiesWithParameters, 'baz', {get: () => 9});

  const propertiesWithParametersKeys = [SYMBOL, 'foo', 'baz'];

  const propertiesWithoutLocator = {
    foo: {},
    bar: null,
    baz: '',
    qux: 0,
  } as unknown as RootLocator;

  if (isDevelopment) {
    const locatorKey = keysWithLocator[0];

    assert(typeof locatorKey === 'string', 'locator key is a string');

    const locatorValue = (propertiesWithParameters as Record<string, unknown>)[locatorKey!];

    assert(locatorValue instanceof Object, 'locator key is first');

    (propertiesWithoutLocator as Record<symbol, unknown>)[SYMBOL] = locatorValue;

    Object.defineProperty(propertiesWithoutLocator, locatorKey!, {value: locatorValue});
  }

  let locatorAsNumber: number = anyLocator;
  let throwCounter = 0;

  +locator;
  -locator;
  !locator;
  ~locator;
  ++locatorAsNumber;
  void locator;
  anyLocator + 2;
  3 + anyLocator;
  anyLocator + '';
  '' + anyLocator;
  Boolean(locator);
  Number(locator);
  Symbol(anyLocator);

  // @ts-expect-error
  getLocatorParameters({...locator(true)});
  // @ts-expect-error
  getLocatorParameters({...locator(false)});
  // @ts-expect-error
  getLocatorParameters({...locator()});
  // @ts-expect-error
  getLocatorParameters({...locator(undefined)});
  // @ts-expect-error
  getLocatorParameters({...locator(null)});

  const expectedThrowCounter = isDevelopment ? 4 : 1;
  const path = isDevelopment ? 'root-bar-baz' : '';
  const toStringPath = isDevelopment ? 'root-toString' : '';

  try {
    anyLocator.bar += 'quux';
  } catch (error) {
    throwCounter += 1;
    assert(error instanceof TypeError, 'redefining a property on locator throws an exception');
  }

  if (isDevelopment) {
    assert(
      Number.isNaN(locatorAsNumber) && Number.isNaN(Number(locator)),
      'locator converts to NaN as number',
    );
  } else {
    assert(Number(locator) === 0, 'production locator converts to 0 as number');
  }

  assert(Object(locator) === locator && typeof locator === 'function', 'locator is function');

  const attributes = locator({qux: 'bar'});

  assert(attributes instanceof Object, 'call of locator returns attributes object');

  assert(
    Object.keys(attributes).length === (isDevelopment ? 2 : 0),
    'attributes object has correct number of properties',
  );

  assert(String(locator.bar.baz) === '' + locator.bar.baz, 'locator converts to string in one way');
  assert(String(locator.bar.baz) === path, 'locator correctly converts to string');
  assert(
    String(locator.toString) === toStringPath,
    'locator with toString in path correctly converts to string',
  );

  assert(JSON.stringify(locator.bar.baz) === JSON.stringify(path), 'correctly converts to JSON');

  assert(
    JSON.stringify(locator.toString) === JSON.stringify(toStringPath),
    'locator with toString in path correctly converts to JSON',
  );

  if (isDevelopment) {
    // @ts-expect-error
    assert(locator[SYMBOL] === undefined, 'locator returns undefined for symbol properties');
  }

  assert(
    Boolean(createLocator(propertiesWithoutLocator)),
    'createLocator do not throws an exception if properties do not contain a locator',
  );

  const locatorByProperties = createLocator(propertiesWithoutLocator);
  const parametersFromProperties = getLocatorParameters(propertiesWithParameters);

  assert(
    // @ts-expect-error
    locatorByProperties === locatorByProperties.bar,
    'locator for unmarked properties is singleton ',
  );

  assert(
    (locator === locatorByProperties) === !isDevelopment,
    'locator is singleton in production and only in production',
  );

  assert(
    // @ts-expect-error
    createLocator(undefined) === createLocator(null) && createLocator() === locatorByProperties,
    'createLocator do not throws an exception on falsy properties',
  );

  assert(
    (parametersFromProperties === parameters) === isDevelopment,
    'getLocatorParameters returns correct parameters',
  );

  assert(
    (getLocatorParameters(propertiesWithoutLocator) === parametersFromProperties) ===
      !isDevelopment,
    'getLocatorParameters returns singleton in production and only in production',
  );

  assert(
    // @ts-expect-error
    getLocatorParameters(propertiesWithoutLocator) === getLocatorParameters() &&
      // @ts-expect-error
      getLocatorParameters(undefined) === getLocatorParameters(null),
    'getLocatorParameters returns one single value for properties without parameters',
  );

  assert(
    removeLocatorFromProperties(propertiesWithoutLocator) === propertiesWithoutLocator,
    'removeLocatorFromProperties returns original properties if they do not marked with locator',
  );

  assert(
    // @ts-expect-error
    removeLocatorFromProperties(undefined) === undefined,
    'removeLocatorFromProperties returns undefined for undefined properties',
  );

  assert(
    // @ts-expect-error
    removeLocatorFromProperties(null) === null,
    'removeLocatorFromProperties returns null for null',
  );

  const propertiesAfterRemovingLocator = removeLocatorFromProperties(propertiesWithParameters);

  assert(
    Object.getPrototypeOf(propertiesAfterRemovingLocator) ===
      Object.getPrototypeOf(propertiesWithParameters),
    'removeLocatorFromProperties copies properties prototype',
  );

  for (const key of propertiesWithParametersKeys) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(propertiesWithParameters, key)!;
    const descriptor = Object.getOwnPropertyDescriptor(propertiesAfterRemovingLocator, key);

    for (const descriptorKey of Object.keys(originalDescriptor)) {
      assert(
        (originalDescriptor as Record<string, unknown>)[descriptorKey] ===
          (descriptor as Record<string, unknown>)[descriptorKey],
        `removeLocatorFromProperties saves descriptor key ${descriptorKey} for key ${String(key)}`,
      );
    }
  }

  assert(
    createLocator(propertiesAfterRemovingLocator) === createLocator({}),
    'removeLocatorFromProperties really remove locator ',
  );

  try {
    delete anyLocator.corge;
  } catch (error) {
    throwCounter += 1;
    assert(error instanceof TypeError, 'deleting locator properties throws an exception');
  }

  try {
    Object.defineProperty(locator, 'foo', {configurable: true, writable: true});
  } catch (error) {
    throwCounter += 1;
    assert(error instanceof TypeError, 'defining a property on locator throws an exception');
  }

  try {
    Object.preventExtensions(locator);
  } catch (error) {
    throwCounter += 1;
    assert(error instanceof TypeError, 'preventing an extensions on locator throws an exception');
  }

  assert(throwCounter === expectedThrowCounter, 'all expected exceptions are thrown');
};
