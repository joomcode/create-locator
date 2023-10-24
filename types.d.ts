/// <reference path="./react.d.ts" />

/**
 * Adds `IS_EMPTY_LOCATOR` key if locator tree is empty (i.e. for `Locator<void>`).
 */
type AddIsEmptyLocatorKeyIfNeeded<Tree> = IsEqual<string & keyof Tree, never> extends true
  ? WithIsEmptyLocator
  : {};

/**
 * Adds undefined to parameters if there are no required parameters.
 */
type AddUndefinedIfRequiredParametersEmpty<Parameters> =
  IsRequiredParametersEmpty<Parameters> extends true ? Parameters | undefined : Parameters;

/**
 * The function part of the base node.
 */
type BaseLocatorFunction<Parameters, Return> = (
  this: void,
  ...arguments: LocatorArguments<Parameters>
) => Return;

/**
 * Base node of locator tree (by locator parameters, locator component parameters,
 * optional subtree and `IsChildLocator` flag).
 */
type BaseNode<
  Parameters,
  ComponentParameters,
  Subtree = undefined,
  IsChildLocator extends boolean = false,
  ParametersInArguments = IsChildLocator extends true ? ComponentParameters : Parameters,
> = (IsParametersEmpty<ParametersInArguments> extends true
  ? ((this: void) => LocatorCallResult<Subtree, IsChildLocator>) &
      WithErrorAttribute<'The locator should be called'>
  : BaseLocatorFunction<ParametersInArguments, LocatorCallResult<Subtree, IsChildLocator>> &
      WithErrorAttribute<'The locator should be called (maybe with parameters)'>) &
  (IsParametersEmpty<ComponentParameters> extends true
    ? {}
    : WithComponentParameters<ComponentParameters>) &
  (IsParametersEmpty<Parameters> extends true ? {} : WithParameters<Parameters>);

/**
 * Error message for situations where a HTML element is marked with a component locator.
 */
type CannotMarkElementMessage = 'Cannot mark HTML element with component locator';

/**
 * Type of symbol key for saving component parameters of locator.
 */
type ComponentParametersKey = typeof COMPONENT_PARAMETERS;

/**
 * `createLocator` overload for component locator.
 */
type CreateComponentLocator = <Properties extends Partial<PropertiesWithMarkConstraint>>(
  this: void,
  properties: PropertiesError<Properties> extends string ? PropertiesError<Properties> : Properties,
) => CreateLocator<PropertiesError<Properties> extends string ? never : Properties>;

/**
 * `createLocator` overload for root locator.
 */
type CreateRootLocator = <RootLocator extends WithLocator>(
  this: void,
  pathPrefix: IsEqual<RootLocator, WithLocator> extends true ? never : string,
  rootOptions?: Partial<RootOptionsWithDefaults>,
) => CreateLocator<RootLocator>;

/**
 * `createLocator` overload for root locator with attributes mapping.
 */
type CreateRootLocatorWithMapping = <RootLocator extends WithLocator, MappingResult>(
  this: void,
  pathPrefix: IsEqual<RootLocator, WithLocator> extends true ? never : string,
  rootOptions: Partial<RootOptionsWithDefaults> & MapAttributes<MappingResult>,
) => CreateLocator<RootLocator, MappingResult>;

/**
 * Base type of error attribute value for all HTML elements.
 */
type ErrorAttributeBaseType =
  | 'https://www.npmjs.com/package/create-locator#error-attribute'
  | undefined;

/**
 * Type of symbol key for generating type error on HTML elements.
 */
type ErrorAttributeKey = typeof ERROR_ATTRIBUTE;

/**
 * Extracts component parameters from some base node.
 */
type ExtractNodeComponentParameters<SomeNode> = SomeNode extends WithComponentParameters
  ? SomeNode[ComponentParametersKey]
  : {};

/**
 * Extracts parameters from some base or normalized node.
 */
type ExtractNodeParameters<SomeNode> = SomeNode extends WithParameters
  ? SomeNode[ParametersKey]
  : {};

/**
 * Get error attribute key from `React.AriaAttributes` interface.
 */
type GetErrorAttribute<Attribute extends keyof React.AriaAttributes & symbol> =
  Attribute extends unknown
    ? IsEqual<React.AriaAttributes[Attribute], ErrorAttributeBaseType> extends true
      ? Attribute
      : never
    : never;

/**
 * Type of symbol key for saving hidden normalized tree.
 */
type HiddenKey = typeof HIDDEN;

/**
 * Returns `true` if types are exactly equal, `false` otherwise.
 * `IsEqual<{foo: string}, {foo: string}>` = `true`.
 * `IsEqual<{readonly foo: string}, {foo: string}>` = `false`.
 */
type IsEqual<X, Y> = (<Type>() => Type extends X ? 1 : 2) extends <Type>() => Type extends Y ? 1 : 2
  ? true
  : false;

/**
 * Returns `true` if type includes `undefined`, `false` otherwise.
 * `IsIncludeUndefined<string>` = `false`.
 * `IsIncludeUndefined<number | undefined>` = `true`.
 */
type IsIncludeUndefined<Type> = true extends (Type extends undefined ? true : never) ? true : false;

/**
 * Type of symbol key for tree of empty locator (i.e. `Locator<void>`).
 */
type IsEmptyLocatorKey = typeof IS_EMPTY_LOCATOR;

/**
 * Returns `true` if properties object valid for `CreateComponentLocator`, `false` otherwise.
 */
type PropertiesError<Properties> = Properties extends Partial<WithMark<never>>
  ? 'Properties are unmarked by any locator; use & Mark<SomeLocator>'
  : Properties extends Partial<WithMark<WithLocator<'LocatorOfElement'>>>
  ? Properties extends WithErrorAttribute
    ? undefined
    : 'This component does not behave like an element; use Locator instead of LocatorOfElement for it'
  : Properties extends WithErrorAttribute
  ? 'This component behaves like an element; use LocatorOfElement for it'
  : undefined;

/**
 * Returns `true` if parameters is empty, `false` otherwise.
 * `IsParametersEmpty<{foo: string}>` = `false`.
 * `IsParametersEmpty<{}>` = `true`.
 */
type IsParametersEmpty<Parameters> = Keys<Parameters> extends never ? true : false;

/**
 * Returns `true` if there are no required parameters, `false` otherwise.
 */
type IsRequiredParametersEmpty<Parameters> = RequiredKeys<Parameters> extends never ? true : false;

/**
 * Returns all keys of type.
 * `Keys<{foo: string}>` = `"foo"`.
 * `Keys<{foo: string} | {bar?: number}>` = `"foo" | "bar"`.
 */
type Keys<Type> = Type extends unknown ? keyof Type : never;

/**
 * Arguments of locator as function by locator parameters.
 */
type LocatorArguments<Parameters> = IsIncludeUndefined<Parameters> extends true
  ? [parameters?: Parameters]
  : [parameters: Parameters];

/**
 *  Locator call result by locator tree and `IsChildLocator` flag.
 */
type LocatorCallResult<Tree, IsChildLocator extends boolean = false> = Tree extends object
  ? WithMark<Tree> &
      WithErrorAttribute<
        IsChildLocator extends true
          ? Tree extends WithLocator<'LocatorOfElement'>
            ? undefined
            : CannotMarkElementMessage
          : undefined
      >
  : object;

/**
 * Type of runtime locator object by locator tree.
 */
type LocatorFromLocatorTree<Tree> = BaseNode<
  ExtractNodeParameters<Tree>,
  ExtractNodeComponentParameters<Tree>,
  Tree
> & {
  readonly [Key in string & keyof Tree]: TreeNode<Key, UnwrapTree<Tree[Key]>>;
} & WithLocator<Tree extends WithLocator ? Tree[LocatorKey] : 'Locator'>;

/**
 * Type of symbol key to define locator.
 */
type LocatorKey = typeof LOCATOR;

/**
 * Creates locator tree by locator description, locator parameters,
 * locator component parameters and locator kind.
 */
type LocatorTree<
  Description,
  Parameters,
  ComponentParameters,
  Kind = 'Locator',
  MergedDescriptions = UnionToIntersection<Description>,
> = BaseNode<Parameters, ComponentParameters> & {
  readonly [Key in string & keyof MergedDescriptions]-?: TreeNode<
    Key,
    LocatorTreeNode<Key, Exclude<MergedDescriptions[Key], undefined>>
  >;
} & WithLocator<Kind> &
  AddIsEmptyLocatorKeyIfNeeded<MergedDescriptions>;

/**
 * Get locator tree from locator object.
 */
type LocatorTreeFromLocator<SomeLocator> = SomeLocator extends WithLocator
  ? BaseNode<ExtractNodeParameters<SomeLocator>, ExtractNodeComponentParameters<SomeLocator>> & {
      readonly [Key in string & keyof SomeLocator]: TreeNode<Key, UnwrapTree<SomeLocator[Key]>>;
    } & WithLocator<SomeLocator[LocatorKey]> &
      AddIsEmptyLocatorKeyIfNeeded<SomeLocator>
  : unknown;

/**
 * Get locator tree from properties with mark.
 */
type LocatorTreeFromMark<Properties extends Partial<PropertiesWithMarkConstraint>> = Exclude<
  Properties[MarkKey],
  undefined
>;

/**
 * Creates locator tree node by locator description node.
 */
type LocatorTreeNode<Key, DescriptionNode> = [DescriptionNode] extends [WithLocator]
  ? BaseNode<
      ExtractNodeParameters<DescriptionNode>,
      ExtractNodeComponentParameters<DescriptionNode>,
      LocatorTreeFromLocator<DescriptionNode>,
      true
    > &
      WithHidden<TreeNode<Key, NormalizeTree<LocatorTreeFromLocator<DescriptionNode>>>>
  : [DescriptionNode] extends [WithNode]
  ? DescriptionNode[NodeKey]
  : BaseNode<AddUndefinedIfRequiredParametersEmpty<DescriptionNode>, {}>;

/**
 * Additional option of root locator for mapping attributes.
 */
type MapAttributes<MappingResult> = {
  readonly mapAttributesChain: (this: void, attributes: readonly Attributes[]) => MappingResult;
};

/**
 * Type of symbol key for saving locator tree in mark (in properties object).
 */
type MarkKey = typeof MARK;

/**
 * Type of symbol key for saving locator tree of node locator.
 */
type NodeKey = typeof NODE;

/**
 * Normalize base node of locator tree by base node and mapping result.
 */
type NormalizeBaseNode<BaseNode, MappingResult> = BaseNode extends WithParameters
  ? NormalizedLocatorFunction<BaseNode, MappingResult> & WithParameters<BaseNode[ParametersKey]>
  : (this: void) => MappingResult;

/**
 * The function part of the  or normalized base node.
 */
type NormalizedLocatorFunction<UnwrappedTree extends WithParameters, MappingResult> = ((
  this: void,
  parameters: UnwrappedTree[ParametersKey],
) => NormalizeTreeWithParameters<UnwrappedTree, MappingResult>) &
  ((this: void) => MappingResult);

/**
 * Normalize list of subnodes of locator tree.
 */
type NormalizeListOfSubnodes<Subnodes, MappingResult> = {
  readonly [Key in string & keyof Subnodes]: TreeNode<
    Key,
    NormalizeSubnode<UnwrapTree<Subnodes[Key]>, MappingResult>
  >;
};

/**
 * Normalize subnode of locator tree.
 */
type NormalizeSubnode<Subnode, MappingResult> = Subnode extends WithHidden
  ? IsEqual<MappingResult, void> extends true
    ? Subnode[HiddenKey]
    : NormalizeTree<Subnode[HiddenKey], MappingResult>
  : NormalizeTree<Subnode, MappingResult>;

/**
 * Normalize locator tree to hidden internal brief presentation (so-called normalized tree).
 */
type NormalizeTree<Tree, MappingResult = void> = NormalizeBaseNode<
  UnwrapTree<Tree>,
  MappingResult
> &
  NormalizeListOfSubnodes<UnwrapTree<Tree>, MappingResult>;

/**
 * Normalize unwrapped locator tree, which will be used as the return value
 * when calling normalized tree nodes with parameters.
 */
type NormalizeTreeWithParameters<UnwrappedTree extends WithParameters, MappingResult> = ((
  this: void,
) => MappingResult) &
  WithParameters<UnwrappedTree[ParametersKey]> &
  NormalizeListOfSubnodes<UnwrappedTree, MappingResult>;

/**
 * Message for type error in `Locator<...>` and `Node<...>` first argument.
 */
type NotLocatorDescription = 'Not a locator tree description';

/**
 * Type of symbol key for saving locator parameters.
 */
type ParametersKey = typeof PARAMETERS;

/**
 * Keys of prototypes of `Object` and `Function`.
 */
type PrototypeKeys = string & (keyof typeof Object.prototype | keyof typeof Function.prototype);

/**
 * Returns required keys of type.
 * `RequiredKeys<{foo: string}>` = `"foo"`.
 * `RequiredKeys<{foo: string, bar?: number}>` = `"foo"`.
 */
type RequiredKeys<Type, TypeKeys = Keys<Type>> = TypeKeys extends Keys<Type>
  ? Type extends Required<Pick<Type, TypeKeys>>
    ? TypeKeys
    : never
  : never;

/**
 * Options of root locator with defaults values.
 */
type RootOptionsWithDefaults = Readonly<{
  isProduction: boolean;
  parameterAttributePrefix: string;
  pathAttribute: string;
  pathSeparator: string;
}>;

/**
 * Type of symbol key for saving locator tree for prototype keys.
 */
type TreeKey = typeof TREE;

/**
 * Wrap tree node with tree key for prototype keys.
 */
type TreeNode<Key, Tree> = Key extends PrototypeKeys ? Tree & WithTree<Tree> : Tree;

/**
 * Converts union of types to intersection of this types.
 */
type UnionToIntersection<Union> = (Union extends any ? (arg: Union) => void : never) extends (
  arg: infer Intersection,
) => void
  ? Intersection
  : never;

/**
 * Unwrap tree node from tree key, if any.
 */
type UnwrapTree<Tree> = Tree extends WithTree ? Tree[TreeKey] : Tree;

/**
 * Any node of locator tree with some component parameters.
 */
type WithComponentParameters<Parameters = unknown> = Readonly<
  Record<ComponentParametersKey, Parameters>
>;

/**
 * Object (usually properties object) with error message in error attribute key.
 */
type WithErrorAttribute<Message extends string | undefined = undefined> = Partial<
  Readonly<Record<ErrorAttributeKey, Message | ErrorAttributeBaseType>>
>;

/**
 * Object with hidden normalized tree of locators.
 */
type WithHidden<NormalizedTree = object> = Readonly<Record<HiddenKey, NormalizedTree>>;

/**
 * Object with symbol key for tree of empty locator (i.e. `Locator<void>`).
 */
type WithIsEmptyLocator = Readonly<Record<IsEmptyLocatorKey, undefined>>;

/**
 * Object with locator key with locator kind (it's locator itself).
 */
type WithLocator<Kind = string> = Readonly<Record<LocatorKey, Kind>>;

/**
 * Object with mark with locator tree (unnormalized tree of locators, produced by `Locator<...>`).
 */
type WithMark<Tree = object> = Readonly<Record<MarkKey, Tree>>;

/**
 * Object with node locator (produced by `Node<...>`).
 */
type WithNode<Tree = object> = Readonly<Record<NodeKey, Tree>>;

/**
 * Any node of locator tree with some parameters.
 */
type WithParameters<Parameters = unknown> = Readonly<Record<ParametersKey, Parameters>>;

/**
 * Object with tree of locators under some prototype key.
 */
type WithTree<Tree = object> = Readonly<Record<TreeKey, Tree>>;

/**
 * Any locator, that is locator that matches any other locators (for use in unit tests).
 */
export type AnyLocator = ((parameters?: any) => AnyMark) & WithLocator;

/**
 * A mark that matches any locator (for use in unit tests).
 */
export type AnyMark = WithMark<any> & WithErrorAttribute;

/**
 * Attributes object.
 */
export type Attributes = Readonly<Record<string, string>>;

/**
 * Symbol key for saving component parameters of locator.
 */
export declare const COMPONENT_PARAMETERS: unique symbol;

/**
 * Presentation of `createLocator` function in types.
 * Creates locator type by properties and optional `MappingResult` type.
 */
export type CreateLocator<
  PropertiesOrRootLocator extends Partial<PropertiesWithMarkConstraint> | WithLocator,
  MappingResult = HiddenKey,
> = true extends
  | (PropertiesOrRootLocator extends Partial<PropertiesWithMarkConstraint> | WithLocator
      ? false
      : true)
  | IsEqual<PropertiesOrRootLocator, never>
  | IsEqual<PropertiesOrRootLocator, WithLocator>
  ? unknown
  : IsEqual<MappingResult, HiddenKey> extends true
  ? PropertiesOrRootLocator extends WithLocator
    ? PropertiesOrRootLocator
    : PropertiesOrRootLocator extends Partial<WithMark>
    ? IsEqual<LocatorTreeFromMark<PropertiesOrRootLocator>, unknown> extends true
      ? unknown
      : IsEqual<LocatorTreeFromMark<PropertiesOrRootLocator>, object> extends true
      ? unknown
      : LocatorFromLocatorTree<LocatorTreeFromMark<PropertiesOrRootLocator>>
    : unknown
  : PropertiesOrRootLocator extends WithLocator
  ? NormalizeTree<LocatorTreeFromLocator<PropertiesOrRootLocator>, MappingResult>
  : unknown;

/**
 * Type of `createLocator` function (with overloads).
 */
export type CreateLocatorFunction = CreateComponentLocator &
  CreateRootLocator &
  CreateRootLocatorWithMapping;

/**
 * Symbol key for generating type error on HTML elements.
 */
export declare const ERROR_ATTRIBUTE: GetErrorAttribute<keyof React.AriaAttributes & symbol>;

/**
 * Filled options of root locator, maybe with mapping attributes function.
 */
export type FilledRootOptions = Partial<MapAttributes<Attributes>> & RootOptionsWithDefaults;

/**
 * Presentation of `getLocatorParameters` function in types.
 * Get type of parameters of component locator by component properties.
 */
export type GetLocatorParameters<
  Properties extends Partial<PropertiesWithMarkWithParametersConstraint>,
> = true extends
  | (Properties extends Partial<PropertiesWithMarkWithParametersConstraint> ? false : true)
  | IsEqual<Properties, never>
  | IsEqual<ExtractNodeComponentParameters<LocatorTreeFromMark<Properties>>, {}>
  ? unknown
  : ExtractNodeComponentParameters<LocatorTreeFromMark<Properties>>;

/**
 * Type of `getLocatorParameters` function.
 */
export type GetLocatorParametersFunction = <
  Properties extends Partial<PropertiesWithMarkWithParametersConstraint>,
>(
  this: void,
  properties: PropertiesError<Properties> extends string ? PropertiesError<Properties> : Properties,
) => GetLocatorParameters<PropertiesError<Properties> extends string ? never : Properties>;

/**
 * Symbol key for saving hidden normalized tree.
 */
export declare const HIDDEN: unique symbol;

/**
 * Symbol key for tree of empty locator (i.e. `Locator<void>`).
 */
export declare const IS_EMPTY_LOCATOR: unique symbol;

/**
 * Creates component locator type by locator description and locator parameters.
 */
export type Locator<
  Description extends LocatorDescriptionConstraint,
  Parameters extends ParametersConstraint = void,
  ComponentParameters extends ParametersConstraint | 'sameParameters' = void,
> = true extends
  | (Description extends LocatorDescriptionConstraint ? false : true)
  | (Parameters extends ParametersConstraint ? false : true)
  | (ComponentParameters extends ParametersConstraint | 'sameParameters' ? false : true)
  | IsEqual<Description, never>
  | IsEqual<Parameters, never>
  | IsEqual<ComponentParameters, never>
  ? unknown
  : LocatorFromLocatorTree<
      LocatorTree<
        Description,
        AddUndefinedIfRequiredParametersEmpty<Parameters>,
        AddUndefinedIfRequiredParametersEmpty<
          IsEqual<ComponentParameters, 'sameParameters'> extends true
            ? Parameters
            : ComponentParameters
        >
      >
    >;

/**
 * Symbol key to define locator.
 */
export declare const LOCATOR: unique symbol;

/**
 * Constraint of locator, that is the argument of `Mark`.
 */
export type LocatorConstraint = WithLocator;

/**
 * Constraint of description of locator tree, that is the first argument of `Locator` and `Node`.
 */
export type LocatorDescriptionConstraint = Readonly<
  Record<string, (ParametersConstraint & WithErrorAttribute) | void | WithLocator | WithNode> &
    Partial<
      WithComponentParameters<NotLocatorDescription> &
        WithHidden<NotLocatorDescription> &
        WithLocator<NotLocatorDescription> &
        WithMark<NotLocatorDescription> &
        WithNode<NotLocatorDescription> &
        WithParameters<NotLocatorDescription>
    >
> | void;

/**
 * Creates locator type by locator description and locator parameters
 * for component, behaves like an element.
 */
export type LocatorOfElement<
  Description extends LocatorDescriptionConstraint,
  Parameters extends ParametersConstraint = void,
  ComponentParameters extends ParametersConstraint | 'sameParameters' = void,
> = true extends
  | (Description extends LocatorDescriptionConstraint ? false : true)
  | (Parameters extends ParametersConstraint ? false : true)
  | (ComponentParameters extends ParametersConstraint | 'sameParameters' ? false : true)
  | IsEqual<Description, never>
  | IsEqual<Parameters, never>
  | IsEqual<ComponentParameters, never>
  ? unknown
  : LocatorFromLocatorTree<
      LocatorTree<
        Description,
        AddUndefinedIfRequiredParametersEmpty<Parameters>,
        AddUndefinedIfRequiredParametersEmpty<
          IsEqual<ComponentParameters, 'sameParameters'> extends true
            ? Parameters
            : ComponentParameters
        >,
        'LocatorOfElement'
      >
    >;

/**
 * Creates mark with component locator type for component properties.
 */
export type Mark<SomeLocator extends LocatorConstraint> = true extends
  | (SomeLocator extends LocatorConstraint ? false : true)
  | IsEqual<SomeLocator, never>
  | IsEqual<LocatorTreeFromLocator<SomeLocator>, unknown>
  ? unknown
  : WithMark<LocatorTreeFromLocator<SomeLocator>> &
      WithErrorAttribute<
        | 'The mark of locator should be removed from spreaded properties using the removeMarkFromProperties'
        | CannotMarkElementMessage
      >;

/**
 * Symbol key for saving locator tree in mark (in properties object).
 */
export declare const MARK: unique symbol;

/**
 * Creates node locator type by locator description and locator parameters.
 */
export type Node<
  Description extends LocatorDescriptionConstraint,
  Parameters extends ParametersConstraint = void,
> = true extends
  | (Description extends LocatorDescriptionConstraint ? false : true)
  | (Parameters extends ParametersConstraint ? false : true)
  | IsEqual<Description, never>
  | IsEqual<Parameters, never>
  ? unknown
  : WithNode<
      LocatorTree<Description, AddUndefinedIfRequiredParametersEmpty<Parameters>, void, 'Node'>
    > &
      WithErrorAttribute<'Node cannot be used here'>;

/**
 * Symbol key for saving locator tree of node locator.
 */
export declare const NODE: unique symbol;

/**
 * Symbol key for saving locator parameters.
 */
export declare const PARAMETERS: unique symbol;

/**
 * Constraint of locator parameters, that is the second argument of `Locator` and `Node`.
 */
export type ParametersConstraint = Attributes | void;

/**
 * Constraint of properties with mark, that is the argument of `createLocator` and `removeMarkFromProperties`.
 */
export type PropertiesWithMarkConstraint = WithMark;

/**
 * Constraint of properties with mark with parameters, that is the argument of `getLocatorParameters`.
 */
export type PropertiesWithMarkWithParametersConstraint = WithMark<WithComponentParameters>;

/**
 * Presentation of `removeMarkFromProperties` function in types.
 * Returns type of properties without locator mark.
 */
export type RemoveMarkFromProperties<Properties extends Partial<PropertiesWithMarkConstraint>> =
  true extends IsEqual<Properties, never> ? unknown : Omit<Properties, ErrorAttributeKey | MarkKey>;

/**
 * Type of `removeMarkFromProperties` function.
 */
export type RemoveMarkFromPropertiesFunction = <
  Properties extends Partial<PropertiesWithMarkConstraint>,
>(
  this: void,
  properties: PropertiesError<Properties> extends string ? PropertiesError<Properties> : Properties,
) => RemoveMarkFromProperties<PropertiesError<Properties> extends string ? never : Properties>;

/**
 * Options of root locator (as `createLocator` second argument).
 */
export type RootOptions = Partial<FilledRootOptions>;

/**
 * Symbol key for saving locator tree for prototype keys.
 */
export declare const TREE: unique symbol;
