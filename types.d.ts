/// <reference path="./react.d.ts" />

/**
 * A mark that matches any locator (for use in unit tests).
 */
type AnyMark = WithMark<any> & ElementAttributeError<CannotMarkElementMessage>;

/**
 * Base node of locator tree (by parameters, optional subtree and "is child locator" flag).
 */
type BaseNode<
  Parameters,
  Subtree = undefined,
  IsChildLocator extends boolean = false,
> = IsParametersEmpty<Parameters> extends true
  ? ((this: void) => LocatorCallResult<Subtree, IsChildLocator>) &
      ElementAttributeError<'The locator should be called'>
  : NodeWithParameters<Parameters, LocatorCallResult<Subtree, IsChildLocator>> &
      ElementAttributeError<'The locator should be called (with parameters)'>;

/**
 * Error message for situations where a HTML element is marked with a component locator.
 */
type CannotMarkElementMessage = 'Cannot mark HTML element with component locator';

/**
 * createLocator overload for component locator.
 */
type CreateComponentLocator = <Properties extends Partial<WithMark>>(
  this: void,
  properties: Properties extends Partial<WithMark<never>> ? never : Properties,
) => CreateLocator<Properties>;

/**
 * createLocator overload for root locator.
 */
type CreateRootLocator = <RootLocator extends WithLocator>(
  this: void,
  pathPrefix: IsEqual<RootLocator, WithLocator> extends true ? never : string,
  rootOptions?: Partial<RootOptions>,
) => CreateLocator<RootLocator>;

/**
 * createLocator overload for root locator with attributes mapping.
 */
type CreateRootLocatorWithMapping = <RootLocator extends WithLocator, MapResult>(
  this: void,
  pathPrefix: IsEqual<RootLocator, WithLocator> extends true ? never : string,
  rootOptions: Partial<RootOptions> & MapAttributes<MapResult>,
) => CreateLocator<RootLocator, MapResult>;

/**
 * Generates a type error with some message on HTML element.
 */
type ElementAttributeError<Message extends string | undefined = undefined> = {
  readonly [ERROR_ATTRIBUTE]?: Message | undefined;
};

/**
 * Type of symbol attribute key for generating type error on HTML elements.
 */
type ErrorAttribute = GetErrorAttribute<keyof React.AriaAttributes & symbol>;

/**
 * Extracts parameters from some base or normalized node.
 */
type ExtractNodeParameters<SomeNode> = SomeNode extends WithParameters
  ? SomeNode[ParametersKey]
  : {};

/**
 * Get error attribute key from React.AriaAttributes interface.
 */
type GetErrorAttribute<Attribute extends keyof React.AriaAttributes & symbol> =
  Attribute extends unknown
    ? IsEqual<React.AriaAttributes[Attribute], undefined> extends true
      ? Attribute
      : never
    : never;

/**
 * Type of symbol key for saving hidden normalized tree.
 */
type HiddenKey = typeof HIDDEN;

/**
 * Returns true if types are exactly equal and false otherwise.
 * IsEqual<{foo: string}, {foo: string}> = true.
 * IsEqual<{readonly foo: string}, {foo: string}> = false.
 */
type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

/**
 * Returns true if parameters is empty, false otherwise.
 */
type IsParametersEmpty<Parameters> = Keys<Parameters> extends never ? true : false;

/**
 * Keys of type.
 */
type Keys<T> = T extends unknown ? keyof T : never;

/**
 *  Locator call result by locator tree and "is child locator" flag.
 */
type LocatorCallResult<Tree, IsChildLocator extends boolean = false> = Tree extends object
  ? WithMark<Tree> &
      ElementAttributeError<IsChildLocator extends true ? CannotMarkElementMessage : undefined>
  : object;

/**
 * Type of runtime locator object by locator tree.
 */
type LocatorFromLocatorTree<Tree> = BaseNode<ExtractNodeParameters<Tree>, Tree> &
  WithLocator & {readonly [Key in string & keyof Tree]: TreeNode<Key, UnwrapTree<Tree[Key]>>};

/**
 * Type of symbol key to define locator.
 */
type LocatorKey = typeof LOCATOR;

/**
 * Creates locator tree by locator description and locator parameters.
 */
type LocatorTree<
  Description,
  Parameters,
  MergedDescriptions = UnionToIntersection<Description>,
> = BaseNode<Parameters> & {
  readonly [Key in string & keyof MergedDescriptions]-?: TreeNode<
    Key,
    LocatorTreeNode<Key, Exclude<MergedDescriptions[Key], undefined>>
  >;
};

/**
 * Get locator tree from locator object.
 */
type LocatorTreeFromLocator<SomeLocator> = SomeLocator extends WithLocator
  ? BaseNode<ExtractNodeParameters<SomeLocator>> & {
      readonly [Key in string & Exclude<keyof SomeLocator, keyof ElementAttributeError>]: TreeNode<
        Key,
        UnwrapTree<SomeLocator[Key]>
      >;
    }
  : unknown;

/**
 * Get locator tree from properties with mark.
 */
type LocatorTreeFromMark<Properties extends Partial<WithMark>> = Exclude<
  Properties[MarkKey],
  undefined
>;

/**
 * Creates locator tree node by locator description node.
 */
type LocatorTreeNode<Key, DescriptionNode> = [DescriptionNode] extends [WithLocator]
  ? BaseNode<
      ExtractNodeParameters<DescriptionNode>,
      LocatorTreeFromLocator<DescriptionNode>,
      true
    > &
      WithHidden<TreeNode<Key, NormalizeTree<LocatorTreeFromLocator<DescriptionNode>>>>
  : [DescriptionNode] extends [WithNode]
  ? DescriptionNode[NodeKey]
  : BaseNode<DescriptionNode>;

/**
 * Type of symbol key for saving locator tree in mark (in properties object).
 */
type MarkKey = typeof MARK;

/**
 * Type of symbol key for saving locator tree of node locator.
 */
type NodeKey = typeof NODE;

/**
 * The parameter-dependent part of the base node.
 */
type NodeWithParameters<Parameters, Return> = {
  (this: void, parameters: Parameters): Return;
} & WithParameters<Parameters>;

/**
 * Normalize base node of locator tree by base node and map result.
 */
type NormalizeBaseNode<BaseNode, MapResult> = BaseNode extends WithParameters
  ? NodeWithParameters<BaseNode[ParametersKey], MapResult>
  : (this: void) => MapResult;

/**
 * Normalize subnode of locator tree.
 */
type NormalizeSubnode<Subnode, MapResult> = Subnode extends WithHidden
  ? IsEqual<MapResult, void> extends true
    ? Subnode[HiddenKey]
    : NormalizeTree<Subnode[HiddenKey], MapResult>
  : NormalizeTree<Subnode, MapResult>;

/**
 * Normalize subnodes of locator tree.
 */
type NormalizeSubnodes<Subnodes, MapResult> = {
  readonly [Key in string & Exclude<keyof Subnodes, keyof ElementAttributeError>]: TreeNode<
    Key,
    NormalizeSubnode<UnwrapTree<Subnodes[Key]>, MapResult>
  >;
};

/**
 * Normalize locator tree to hidden internal brief presentation (so-called normalized tree).
 */
type NormalizeTree<Tree, MapResult = void> = NormalizeBaseNode<Tree, MapResult> &
  NormalizeSubnodes<UnwrapTree<Tree>, MapResult>;

/**
 * Message for type error in Locator<...> and Node<...> argument.
 */
type NotLocatorDescription = 'Not a locator tree description';

/**
 * Type of symbol key for saving locator parameters.
 */
type ParametersKey = typeof PARAMETERS;

/**
 * Keys of prototypes of Object and Function.
 */
type PrototypeKeys = string & (keyof typeof Object.prototype | keyof typeof Function.prototype);

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
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/**
 * Unwrap tree node from tree key, if any.
 */
type UnwrapTree<Tree> = Tree extends WithTree ? Tree[TreeKey] : Tree;

/**
 * Object with hidden normalized tree of locators.
 */
type WithHidden<NormalizedTree = object> = Readonly<Record<HiddenKey, NormalizedTree>>;

/**
 * Object with locator key (it's locator itself).
 */
type WithLocator<Message = ''> = Readonly<Record<LocatorKey, Message>>;

/**
 * Object with mark with locator tree (unnormalized tree of locators, produced by Locator<...>).
 */
type WithMark<Tree = object> = Readonly<Record<MarkKey, Tree>>;

/**
 * Object with node locator (produced by Node<...>).
 */
type WithNode<Tree = object> = Readonly<Record<NodeKey, Tree>>;

/**
 * Any node of locator tree with some parameters.
 */
type WithParameters<Parameters = object> = Readonly<Record<ParametersKey, Parameters>>;

/**
 * Object with tree of locators under some prototype key.
 */
type WithTree<Tree = object> = Readonly<Record<TreeKey, Tree>>;

/**
 * Any locator, that is locator that matches any other locators (for use in unit tests).
 */
export type AnyLocator = ((parameters?: any) => AnyMark) & WithLocator;

/**
 * Any description of locator tree, that is argument of Locator<...> and Node<...>
 * (general type for constraints).
 */
export type AnyLocatorDescription = Readonly<
  Record<string, AnyParameters | WithLocator | WithNode> &
    Partial<
      WithHidden<NotLocatorDescription> &
        WithLocator<NotLocatorDescription> &
        WithMark<NotLocatorDescription> &
        WithNode<NotLocatorDescription> &
        WithParameters<NotLocatorDescription>
    >
> | void;

/**
 * Any locator parameters (general type for constraints).
 */
export type AnyParameters = (Attributes & ElementAttributeError) | void;

/**
 * Properties object with mark with any locator (general type for constraints).
 */
export type AnyPropertiesWithMark = WithMark;

/**
 * Properties object with mark with any locator with parameters (general type for constraints).
 */
export type AnyPropertiesWithMarkWithParameters = WithMark<WithParameters>;

/**
 * Attributes object.
 */
export type Attributes = Readonly<Record<string, string>>;

/**
 * Presentation of createLocator function in types.
 * Creates locator type by properties and optional MapResult type.
 */
export type CreateLocator<
  PropertiesOrRootLocator extends Partial<WithMark> | WithLocator,
  MapResult = HiddenKey,
> = IsEqual<MapResult, HiddenKey> extends true
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
  ? NormalizeTree<LocatorTreeFromLocator<PropertiesOrRootLocator>, MapResult>
  : unknown;

/**
 * Type of createLocator function (with overloads).
 */
export type CreateLocatorFunction = CreateComponentLocator &
  CreateRootLocator &
  CreateRootLocatorWithMapping;

/**
 * Symbol attribute key for generating type error on HTML elements.
 */
export declare const ERROR_ATTRIBUTE: ErrorAttribute;

/**
 * Presentation of getLocatorParameters function in types.
 * Get type of parameters of component locator by component properties.
 */
export type GetLocatorParameters<Properties extends Partial<WithMark<WithParameters>>> = IsEqual<
  ExtractNodeParameters<LocatorTreeFromMark<Properties>>,
  object
> extends true
  ? unknown
  : IsEqual<ExtractNodeParameters<LocatorTreeFromMark<Properties>>, {}> extends true
  ? unknown
  : ExtractNodeParameters<LocatorTreeFromMark<Properties>>;

/**
 * Type of getLocatorParameters function.
 */
export type GetLocatorParametersFunction = <Properties extends Partial<WithMark<WithParameters>>>(
  this: void,
  properties: Properties extends Partial<WithMark<never>> ? never : Properties,
) => GetLocatorParameters<Properties>;

/**
 * Symbol key for saving hidden normalized tree.
 */
export declare const HIDDEN: unique symbol;

/**
 * Creates component locator type by locator description and locator parameters.
 */
export type Locator<
  Description extends AnyLocatorDescription,
  Parameters extends AnyParameters = void,
> = LocatorFromLocatorTree<LocatorTree<Description, Parameters>>;

/**
 * Symbol key to define locator.
 */
export declare const LOCATOR: unique symbol;

/**
 * Additional option of root locator for mapping attributes.
 */
export type MapAttributes<MapResult> = {
  readonly mapAttributes: (this: void, attributes: Attributes) => MapResult;
};

/**
 * Creates mark with component locator type for component properties.
 */
export type Mark<SomeLocator extends WithLocator> = IsEqual<
  LocatorTreeFromLocator<SomeLocator>,
  unknown
> extends true
  ? unknown
  : WithMark<LocatorTreeFromLocator<SomeLocator>> &
      ElementAttributeError<
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
  Description extends AnyLocatorDescription,
  Parameters extends AnyParameters = void,
> = WithNode<LocatorTree<Description, Parameters>> &
  ElementAttributeError<'Node cannot be used here'>;

/**
 * Symbol key for saving locator tree of node locator.
 */
export declare const NODE: unique symbol;

/**
 * Symbol key for saving locator parameters.
 */
export declare const PARAMETERS: unique symbol;

/**
 * Presentation of removeMarkFromProperties function in types.
 * Returns type of properties without locator mark.
 */
export type RemoveMarkFromProperties<Properties extends Partial<WithMark>> = Omit<
  Properties,
  MarkKey | keyof ElementAttributeError
>;

/**
 * Type of removeMarkFromProperties function.
 */
export type RemoveMarkFromPropertiesFunction = <Properties extends Partial<WithMark>>(
  this: void,
  properties: Properties extends Partial<WithMark<never>> ? never : Properties,
) => RemoveMarkFromProperties<Properties>;

/**
 * Options of root locator (as createLocator second argument).
 */
export type RootOptions = Readonly<{
  isProduction: boolean;
  parameterAttributePrefix: string;
  pathAttribute: string;
  pathSeparator: string;
}>;

/**
 * Symbol key for saving locator tree for prototype keys.
 */
export declare const TREE: unique symbol;
