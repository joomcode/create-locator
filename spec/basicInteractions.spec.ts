import type {Locator, Node} from '../index';

import {assert, assertPropertiesAreEqual, getShallowCopy, type Test} from './utils';

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
  // @ts-expect-error
  const propertiesWithoutParameters = {...locator()};
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

  const quux = {toString: () => 'toString'};
  const extendedParameters = {null: null, qux: 'bar', quux, undefined: undefined};

  const attributes = locator(extendedParameters);

  assert(attributes instanceof Object, 'call of locator returns attributes object');

  assert(
    Object.keys(attributes).length ===
      (isDevelopment ? 1 + Object.keys(extendedParameters).length : 0),
    'attributes object has correct number of properties',
  );

  const expectedAttributes = isDevelopment
    ? {
        'data-testid': 'root',
        'data-test-null': 'null',
        'data-test-qux': 'bar',
        'data-test-quux': 'toString',
        'data-test-undefined': 'undefined',
      }
    : {};

  assert(
    JSON.stringify(attributes) === JSON.stringify(expectedAttributes),
    'locator produce correct attributes',
  );

  if (isDevelopment) {
    const pathAttributeValue = attributes[Object.keys(attributes)[0] as keyof typeof attributes];

    assert(
      String(pathAttributeValue) === 'root',
      'pathAttributeValue correctly converts to string',
    );

    assert(
      JSON.stringify(pathAttributeValue) === JSON.stringify('root'),
      'pathAttributeValue correctly converts to JSON',
    );
  } else {
    assert(String(locator) === '', 'production proxy correctly converts to string');

    assert(
      JSON.stringify(locator) === JSON.stringify(''),
      'production proxy correctly converts to JSON',
    );
  }

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
  const parametersFromPropertiesWithoutParameters = getLocatorParameters(
    propertiesWithoutParameters,
  );

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
    [createLocator(undefined), createLocator(null), createLocator()].every(
      (item: object) => item === locatorByProperties,
    ),
    'createLocator do not throws an exception on falsy properties',
  );

  let deepLocator = locator;
  let deepAttributeName = 'root';

  for (const key of [...Object.getOwnPropertyNames(Object.prototype), 'length', 'name']) {
    // @ts-expect-error
    deepLocator = deepLocator[key];

    deepAttributeName += `-${key}`;

    // @ts-expect-error
    const attributesPair: Record<string, unknown> = {...locator[key]({foo: 'bar'})};
    const keys = Object.keys(attributesPair);

    assert(
      keys.length === (isDevelopment ? 2 : 0),
      `${key}: one parameter creates one additional attribute`,
    );

    assert(
      '' + attributesPair['data-testid'] === (isDevelopment ? `root-${key}` : 'undefined'),
      `${key}: creates correct path attribute value`,
    );

    assert(
      attributesPair['data-test-foo'] === (isDevelopment ? 'bar' : undefined),
      `${key}: creates correct attribute for parameter`,
    );
  }

  const deepAttributes: Record<string, unknown> = deepLocator({qux: 'bar'});

  assert(
    Object.keys(deepAttributes).length === (isDevelopment ? 2 : 0),
    'deepAttributes: one parameter creates one additional attribute',
  );

  assert(
    '' + deepAttributes['data-testid'] === (isDevelopment ? deepAttributeName : 'undefined'),
    'deepAttributes: creates correct path attribute value',
  );

  assert(
    deepAttributes['data-test-qux'] === (isDevelopment ? 'bar' : undefined),
    'deepAttributes: creates correct attribute for parameter',
  );

  assert(
    (parametersFromProperties === parameters) === isDevelopment,
    'getLocatorParameters returns correct parameters',
  );

  assert(
    getLocatorParameters(propertiesWithoutLocator) === parametersFromPropertiesWithoutParameters,
    'getLocatorParameters returns production singleton if there is no parameters',
  );

  assert(
    (getLocatorParameters(propertiesWithoutLocator) === parametersFromProperties) ===
      !isDevelopment,
    'getLocatorParameters returns singleton in production and only in production',
  );

  // @ts-expect-error
  const parametersForEmptyProperties = getLocatorParameters();

  assert(
    [
      getLocatorParameters(propertiesWithoutLocator),
      // @ts-expect-error
      getLocatorParameters(undefined),
      // @ts-expect-error
      getLocatorParameters(null),
    ].every((item) => item === parametersForEmptyProperties),
    'getLocatorParameters returns one single value for properties without parameters',
  );

  assert(
    // @ts-expect-error
    getLocatorParameters({...locator('bar')}) ===
      (isDevelopment ? 'bar' : getLocatorParameters(propertiesWithoutLocator)),
    'getLocatorParameters returns truthy string parameters',
  );

  assert(
    // @ts-expect-error
    getLocatorParameters({...locator(18)}) ===
      (isDevelopment ? 18 : getLocatorParameters(propertiesWithoutLocator)),
    'getLocatorParameters returns truthy number parameters',
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

  assert(
    // @ts-expect-error
    removeLocatorFromProperties('foo') === 'foo',
    'removeLocatorFromProperties returns the same string for string',
  );

  assert(
    // @ts-expect-error
    removeLocatorFromProperties(13) === 13,
    'removeLocatorFromProperties returns the same number for number',
  );

  const propertiesAfterRemovingLocator = removeLocatorFromProperties(propertiesWithParameters);

  assert(
    Object.getPrototypeOf(propertiesAfterRemovingLocator) ===
      Object.getPrototypeOf(propertiesWithParameters),
    'removeLocatorFromProperties copies properties prototype',
  );

  assertPropertiesAreEqual(
    propertiesWithParametersKeys,
    propertiesWithParameters,
    propertiesAfterRemovingLocator,
    'removeLocatorFromProperties copies properties with correct descriptors',
  );

  assert(
    // @ts-expect-error
    createLocator(propertiesAfterRemovingLocator) === createLocator({}),
    'removeLocatorFromProperties really remove locator ',
  );

  const propertiesFromObjectPrototype = getShallowCopy(Object.prototype);

  Object.assign(propertiesFromObjectPrototype, {...locator({qux: 'foo'})});

  const objectPrototypePropertiesAfterRemoving = removeLocatorFromProperties(
    // @ts-expect-error
    propertiesFromObjectPrototype,
  );

  assertPropertiesAreEqual(
    Object.getOwnPropertyNames(Object.prototype),
    Object.prototype,
    objectPrototypePropertiesAfterRemoving,
  );

  assertPropertiesAreEqual(
    Object.getOwnPropertyNames(Object.prototype),
    propertiesFromObjectPrototype,
    objectPrototypePropertiesAfterRemoving,
  );

  assert(
    isDevelopment === (propertiesFromObjectPrototype !== objectPrototypePropertiesAfterRemoving),
    'removeLocatorFromProperties copies properties object only in production',
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
