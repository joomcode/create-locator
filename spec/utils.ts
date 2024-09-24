import type {AttributesOptions} from 'create-locator';

export const assert = (value: boolean, message: string): void => {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }

  testsCount += 1;

  console.log('✅', message);
};

export const attributesOptions = {
  parameterAttributePrefix: 'data-test-',
  testIdAttribute: 'data-testid',
  testIdSeparator: '-',
} as const satisfies AttributesOptions;

export const createLocatorByCssSelector = (selector: string): Locator => ({
  isLocator: true,
  selector,
});

export type Locator = Readonly<{isLocator: true; selector: string}>;

export const ok = (message: string): void => console.log(`\x1B[32m[OK]\x1B[39m ${message}`);

export let testsCount = 0;

/**
 * Returns `true` if types are exactly equal, `false` otherwise.
 * `IsEqual<{foo: string}, {foo: string}>` = `true`.
 * `IsEqual<{readonly foo: string}, {foo: string}>` = `false`.
 */
export type IsEqual<X, Y> =
  (<Type>() => Type extends X ? 1 : 2) extends <Type>() => Type extends Y ? 1 : 2 ? true : false;
