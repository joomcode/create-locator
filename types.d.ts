/**
 * Locator kit for application (`locator` function, that produce attributes object,
 * and additional `getTestId` function).
 */
export type AppLocatorKit = Omit<LocatorKit<Attributes>, 'getSelector'>;

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
 * Options of `createTestLocator` function.
 */
export type CreateTestLocatorOptions<Locator> = Readonly<{
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
export type LocatorFunction<Locator = Attributes> = ByParts<Locator, []> &
  ByParts<Locator, [Part]> &
  ByParts<Locator, [Part, Part]> &
  ByParts<Locator, [Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part, Part, Part]> &
  ByParts<Locator, [Part, Part, Part, Part, Part, Part, Part]>;

/**
 * Locator kit for tests (`locator` function, that produce locators,
 * and additional `getSelector` and `getTestId` functions).
 */
export type LocatorKit<Locator> = Readonly<{
  locator: LocatorFunction<Locator>;
  getSelector: LocatorFunction<string>;
  getTestId: LocatorFunction<string>;
}>;

/**
 * Locator parameters object.
 */
export type LocatorParameters = Readonly<Record<string, Stringifiable>>;

/**
 * Stringifiable or empty (`null`/`undefined`) value.
 */
export type Stringifiable = boolean | null | number | string | undefined;

type ByParts<Locator, Parts extends readonly Part[]> = (
  this: void,
  ...testIdParts: readonly [Part, ...Parts, parameters?: LocatorParameters]
) => Locator;

type Part = Stringifiable;
