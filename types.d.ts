import type {CreateComponentLocator} from './oldTypes';

/**
 * Attributes object.
 */
export type Attributes = Readonly<Record<string, string>> | undefined;

/**
 * Constraint of description of child locators, that is the second argument of `createLocator`.
 */
export type ChildLocatorsConstraint = Readonly<Record<string, Parameters | null>>;

/**
 * Type of `createLocatorCreatorInTests` function.
 */
export type CreateLocatorCreatorInTestsFunction = <
  Selector,
  const SomeOptions extends OptionsInTests,
>(
  this: void,
  createSelectorFromCss: CreateSelectorFromCss<Selector>,
  options: SomeOptions,
) => true extends
  | IsEqual<Selector, void>
  | IsEqual<SomeOptions, OptionsInTests>
  | IsEqual<SomeOptions['childSeparator'], string>
  ? unknown
  : <SomeLocator extends Record<LocatorIdKey, string>>(
      locatorId: SomeLocator[LocatorIdKey],
    ) => true extends
      | IsEqual<SomeLocator[LocatorIdKey], never>
      | IsEqual<SomeLocator[LocatorIdKey], unknown>
      ? unknown
      : LocatorInTests<SomeLocator[LocatorIdKey], SomeLocator, Selector> & {
          readonly [Key in string & keyof SomeLocator]: LocatorInTests<
            `${SomeLocator[LocatorIdKey]}${SomeOptions['childSeparator']}${Key}`,
            SomeLocator[Key],
            Selector
          >;
        };

/**
 * Type of `createLocator` function (with overloads).
 */
export type CreateLocatorFunction = (<
  const LocatorId extends string,
  const ChildLocators extends ChildLocatorsConstraint = {},
>(
  this: void,
  locatorId: string extends LocatorId ? never : LocatorId,
  childLocators?: ChildLocators,
) => true extends
  | IsEqual<LocatorId, never>
  | IsEqual<LocatorId, string>
  | IsEqual<ChildLocators, ChildLocatorsConstraint>
  | IsEqual<ChildLocators, never>
  | HasKey<ChildLocators, 'toCss' | 'toJSON' | 'toString' | typeof Symbol.toPrimitive>
  ? unknown
  : Locator<LocatorId, ChildLocators>) &
  CreateComponentLocator;

/**
 * Creates selector from CSS string.
 */
export type CreateSelectorFromCss<Selector> = (this: void, css: string) => Selector;

/**
 * Returns `true` if types are exactly equal, `false` otherwise.
 * `IsEqual<{foo: string}, {foo: string}>` = `true`.
 * `IsEqual<{readonly foo: string}, {foo: string}>` = `false`.
 */
export type IsEqual<X, Y> =
  (<Type>() => Type extends X ? 1 : 2) extends <Type>() => Type extends Y ? 1 : 2 ? true : false;

/**
 * Locator.
 */
export type Locator<LocatorId, ChildLocators extends ChildLocatorsConstraint> = Readonly<
  Record<LocatorIdKey, LocatorId>
> &
  LocatorFunction<AddUndefinedIfRequiredParametersEmpty<GetRootParameters<ChildLocators>>> &
  ChildLocatorsFunctions<Omit<ChildLocators, 'root'>>;

/**
 * Symbol key for locator id.
 */
export declare const LOCATOR_ID: unique symbol;

/**
 * Global locator options. Locators return attributes only after options are set.
 */
export type Options = Readonly<{
  /**
   * Separator between root locator id and child locator name in child locator id.
   */
  childSeparator: string;
  /**
   * Attribute name for locator id.
   */
  idAttribute: string;
  /**
   * Prefix of attribute names for parameters.
   */
  parameterPrefix: string;
}>;

/**
 * Global locator options in tests.
 */
export type OptionsInTests = Options & {readonly disableWildcards?: boolean};

/**
 * Locator parameters.
 */
export type Parameters = Readonly<Record<string, string>>;

/**
 * Target of locator proxy.
 */
export type Target = {toCss: (parameters?: Parameters) => string; toJSON: () => string} & Record<
  string | symbol,
  Function
> &
  ((parameters?: Parameters) => unknown);

/**
 * Adds `undefined` to parameters if there are no required parameters.
 */
type AddUndefinedIfRequiredParametersEmpty<SomeParameters> =
  IsRequiredParametersEmpty<SomeParameters> extends true
    ? SomeParameters | undefined
    : SomeParameters;

/**
 * Child locator functions of root locator.
 */
type ChildLocatorsFunctions<in out ChildLocators> = {
  readonly [Key in string & keyof ChildLocators]: LocatorFunction<
    AddUndefinedIfRequiredParametersEmpty<ChildLocators[Key]>
  >;
};

/**
 * Get type of root locator parameters from `ChildLocators` type.
 */
type GetRootParameters<
  ChildLocators extends ChildLocatorsConstraint,
  RootParameters = ChildLocators['root'],
> = RootParameters extends Parameters ? RootParameters : undefined;

/**
 * Returns `true`, if type has specified key, `false` otherwise.
 * `HasKey<{}, 'foo'>` = `false`.
 * `HasKey<{foo: 1}, 'foo'>` = `true`.
 * `HasKey<{foo: 2}, 'foo' | 'bar'>` = `boolean`.
 */
type HasKey<Type, Key> = Key extends keyof Type ? true : false;

/**
 * Returns `true` if type includes `undefined`, `false` otherwise.
 * `IsIncludeUndefined<string>` = `false`.
 * `IsIncludeUndefined<number | undefined>` = `true`.
 */
type IsIncludeUndefined<Type> = true extends (Type extends undefined ? true : never) ? true : false;

/**
 * Returns `true` if there are no required parameters, `false` otherwise.
 */
type IsRequiredParametersEmpty<SomeParameters> =
  RequiredKeys<SomeParameters> extends never ? true : false;

/**
 * Returns all keys of type.
 * `Keys<{foo: string}>` = `"foo"`.
 * `Keys<{foo: string} | {bar?: number}>` = `"foo" | "bar"`.
 */
type Keys<Type> = Type extends unknown ? keyof Type : never;

/**
 * Arguments of function part of locator by locator parameters.
 */
type LocatorArguments<SomeParameters> =
  IsEqual<SomeParameters, undefined> extends true
    ? []
    : IsIncludeUndefined<SomeParameters> extends true
      ? [parameters?: SomeParameters]
      : [parameters: SomeParameters];

/**
 * The function part of locator.
 */
type LocatorFunction<in out SomeParameters> = (
  this: void,
  ...arguments: LocatorArguments<
    null extends SomeParameters
      ? undefined
      : {} extends SomeParameters
        ? Parameters | undefined
        : SomeParameters
  >
) => Attributes;

/**
 * Type of symbol key for locator id.
 */
type LocatorIdKey = typeof LOCATOR_ID;

/**
 * Locator in tests.
 */
type LocatorInTests<LocatorId, Fn, Selector> = ReplaceReturn<Fn, Selector> &
  Readonly<{toCss: ReplaceReturn<Fn, string>; toString: () => LocatorId}>;

/**
 * Replaces function return type.
 */
type ReplaceReturn<Fn, Return> = Fn extends (...args: infer Args) => unknown
  ? (...args: Args) => Return
  : never;

/**
 * Returns required keys of type.
 * `RequiredKeys<{foo: string}>` = `"foo"`.
 * `RequiredKeys<{foo: string, bar?: number}>` = `"foo"`.
 */
type RequiredKeys<Type, TypeKeys = Keys<Type>> =
  TypeKeys extends Keys<Type>
    ? Type extends Required<Pick<Type, TypeKeys>>
      ? TypeKeys
      : never
    : never;
