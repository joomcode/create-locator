import type {Locator, Node} from '../index';

import {assert, type Test} from './index.spec';

type RootLocator = Locator<{toString: {foo: string}; bar: Node<{baz: {}}>}, {qux: string}>;

export const testBasicInteractions: Test = (createLocator, getLocatorParameters, environment) => {
  const locator = createLocator<RootLocator>('root');

  const anyLocator: any = locator.toString;
  const propertiesWihtoutLocator = {foo: {}, bar: null, baz: '', qux: 0} as unknown as RootLocator;
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

  let expectedThrowCounter = environment === 'development' ? 6 : 1;

  if (environment.endsWith('with-dev-parameters')) {
    expectedThrowCounter += 1;
  }

  if (environment.startsWith('production-from-options')) {
    expectedThrowCounter += 1;
  }

  const path = environment === 'development' ? 'root-bar-baz' : '';
  const toStringPath = environment === 'development' ? 'root-toString' : '';

  try {
    anyLocator.bar += 'quux';
  } catch (error) {
    throwCounter += 1;
    assert(
      error instanceof TypeError,
      `${environment}: redefining a property on locator throws an exception`,
    );
  }

  if (environment === 'development') {
    assert(
      Number.isNaN(locatorAsNumber) && Number.isNaN(Number(locator)),
      `${environment}: locator converts to NaN`,
    );
  }

  assert(
    Object(locator) === locator && typeof locator === 'function',
    `${environment}: locator is function`,
  );

  assert(
    String(locator.bar.baz) === '' + locator.bar.baz,
    `${environment}: locator converts to string in one way`,
  );
  assert(String(locator.bar.baz) === path, `${environment}: locator correctly converts to string`);
  assert(
    String(locator.toString) === toStringPath,
    `${environment}: locator with toString in path correctly converts to string`,
  );

  assert(
    JSON.stringify(locator.bar.baz) === JSON.stringify(path),
    `${environment}: locator correctly converts to JSON`,
  );

  assert(
    JSON.stringify(locator.toString) === JSON.stringify(toStringPath),
    `${environment}: locator with toString in path correctly converts to JSON`,
  );

  try {
    createLocator(propertiesWihtoutLocator);
  } catch (error) {
    throwCounter += 1;
    assert(
      error instanceof TypeError && error.message.includes('Properties do not contain a locator'),
      `${environment}: createLocator throws an exception if properties do not contain a locator`,
    );
  }

  try {
    getLocatorParameters(propertiesWihtoutLocator);
  } catch (error) {
    throwCounter += 1;
    assert(
      error instanceof TypeError && error.message.includes('Properties do not contain a locator'),
      `${environment}: getLocatorParameters throws an exception if properties do not contain a locator`,
    );
  }

  try {
    delete anyLocator.corge;
  } catch (error) {
    throwCounter += 1;
    assert(
      error instanceof TypeError,
      `${environment}: deleting locator properties throws an exception`,
    );
  }

  try {
    Object.defineProperty(locator, 'foo', {configurable: true, writable: true});
  } catch (error) {
    throwCounter += 1;
    assert(
      error instanceof TypeError,
      `${environment}: defining a property on locator throws an exception`,
    );
  }

  try {
    Object.preventExtensions(locator);
  } catch (error) {
    throwCounter += 1;
    assert(
      error instanceof TypeError,
      `${environment}: preventing an extensions on locator throws an exception`,
    );
  }

  assert(
    throwCounter === expectedThrowCounter,
    `${environment}: all expected exceptions are thrown`,
  );
};
