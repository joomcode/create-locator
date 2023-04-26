import type {Locator, Node} from '../index';

import {assert, type Test} from './index.spec';

type RootLocator = Locator<{toString: {foo: string}; bar: Node<{baz: {}}>}, {qux: string}>;

export const testBasicInteractions: Test = ([createLocator, getLocatorParameters], environment) => {
  const locator = createLocator<RootLocator>('root');
  const SYMBOL = Symbol();

  const anyLocator: any = locator.toString;
  const parameters = {qux: 'quux'};
  const propertiesWithoutLocator = {
    foo: {},
    bar: null,
    baz: '',
    [SYMBOL]: 3,
    qux: 0,
  } as unknown as RootLocator;
  const propertiesWithParameters = {...locator(parameters)};

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

  const expectedThrowCounter = environment === 'development' ? 4 : 1;
  const path = environment === 'development' ? 'root-bar-baz' : '';
  const toStringPath = environment === 'development' ? 'root-toString' : '';

  try {
    anyLocator.bar += 'quux';
  } catch (error) {
    throwCounter += 1;
    assert(error instanceof TypeError, 'redefining a property on locator throws an exception');
  }

  if (environment === 'development') {
    assert(
      Number.isNaN(locatorAsNumber) && Number.isNaN(Number(locator)),
      'locator converts to NaN',
    );
  }

  assert(Object(locator) === locator && typeof locator === 'function', 'locator is function');

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

  assert(
    Boolean(createLocator(propertiesWithoutLocator)),
    'createLocator do not throws an exception if properties do not contain a locator',
  );

  if (environment === 'development') {
    assert(
      getLocatorParameters(propertiesWithParameters) === parameters,
      'getLocatorParameters returns correct parameters',
    );
  }

  assert(
    getLocatorParameters(propertiesWithoutLocator) === getLocatorParameters({}),
    'getLocatorParameters returns one single value for properties without parameters',
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
