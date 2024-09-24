/**
 * Attributes object.
 */
export type Attributes = Readonly<Record<string, string>>;

/**
 * Attributes options used to get attributes from the locator.
 */
export type AttributesOptions = Readonly<{
  /**
   * Prefix of attribute's names for parameters.
   */
  parameterAttributePrefix: 'data-test-' | string;

  /**
   * Attribute's name for `testId`.
   */
  testIdAttribute: 'data-testid' | string;

  /**
   * Separator between parts of `testId`.
   */
  testIdSeparator: '-' | string;
}>;

/**
 * Options of `createLocator` function.
 */
export type CreateLocatorOptions = Readonly<{
  /**
   * Attributes options used to get attributes from the locator.
   */
  attributesOptions: AttributesOptions;

  /**
   * If `true`, locator doesn't render (`locator(...)` returns empty object).
   */
  isProduction: boolean;
}>;

/**
 * Type of `createSelector` function.
 */
export type CreateSelectorFunction = (this: void, ...selectors: [string, ...string[]]) => string;

/**
 * Options of `createTestUtils` function.
 */
export type CreateTestUtilsOptions<Locator extends object> = Readonly<{
  /**
   * Attributes options used to get attributes from the locator.
   */
  attributesOptions: AttributesOptions;

  /**
   * Creates `Locator` object by CSS selector.
   */
  createLocatorByCssSelector: (this: void, selector: string) => Locator;

  /**
   * If `true`, asterisks in `testId` and locator parameters are considered
   * to represent any string (as wildcards).
   */
  supportWildcardsInCssSelectors: boolean;
}>;

/**
 * Locator function.
 */
export type LocatorFunction<Locator extends object = Attributes> = ByParts<Locator, []> &
  ByParts<Locator, [Part]> &
  ByParts<Locator, [Part, Part]> &
  ByParts<Locator, [Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part, Part, Part, Part]>;

/**
 * Operator over locators.
 */
export type LocatorOperator<Locator extends object> = (
  this: void,
  ...locators: readonly [Locator, ...Locator[]]
) => Locator;

/**
 * Locator parameters object.
 */
export type LocatorParameters = Readonly<Record<string, Stringifiable>>;

/**
 * Stringifiable or empty (`null`/`undefined`) value.
 */
export type Stringifiable = boolean | null | number | string | undefined;

/**
 * Locator utils for tests (locator operators and `locator` function).
 */
export type TestUtils<Locator extends object> = Readonly<{
  and: LocatorOperator<Locator>;
  chain: LocatorOperator<Locator>;
  createLocatorOperator: (
    this: void,
    createSelector: CreateSelectorFunction,
  ) => LocatorOperator<Locator>;
  has: LocatorOperator<Locator>;
  locator: LocatorFunction<Locator>;
  not: LocatorOperator<Locator>;
  or: LocatorOperator<Locator>;
  selectorByLocator: WeakMap<Locator, string>;
}>;

type ByParts<Locator, Parts extends readonly Part[]> = (
  this: void,
  ...testIdParts: readonly [Part, ...Parts, parameters?: LocatorParameters]
) => Locator;

type Part = Stringifiable;
