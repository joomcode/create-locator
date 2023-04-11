/**
 * Generates a type error with some message on HTML element.
 */
type ElementAttributeError<Message extends string | undefined = undefined> = {
  readonly 'aria-invalid': Message;
};

/**
 * Symbol key for saving hidden normalized tree.
 */
export declare const HIDDEN: unique symbol;

/**
 * Type of symbol key for saving hidden normalized tree.
 */
type HiddenKey = typeof HIDDEN;

/**
 * Symbol key for saving locator tree of component locator.
 */
export declare const LOCATOR: unique symbol;

/**
 * Type of symbol key for saving locator tree of component locator.
 */
type LocatorKey = typeof LOCATOR;

/**
 * Symbol key for saving locator tree of node locator.
 */
export declare const NODE: unique symbol;

/**
 * Type of symbol key for saving locator tree of node locator.
 */
type NodeKey = typeof NODE;

/**
 * Symbol key for saving locator parameters.
 */
export declare const PARAMETERS: unique symbol;

/**
 * Type of symbol key for saving locator parameters.
 */
type ParametersKey = typeof PARAMETERS;

/**
 * Any hidden normalized tree of locators.
 */
type AnyHidden<NormalizedTree = object> = Readonly<Record<HiddenKey, NormalizedTree>>;

/**
 * Any locator type, maybe with locator tree constraint (result of Locator<...>).
 */
type AnyLocator<Tree = object> = Readonly<Record<LocatorKey, Tree>>;

/**
 * Any node locator type (result of Node<...>).
 */
type AnyNode<Tree = object> = Readonly<Record<NodeKey, Tree>>;

/**
 * Any node of locator tree with some parameters.
 */
type AnyNodeWithParameters<Parameters = object> = Readonly<Record<ParametersKey, Parameters>>;

/**
 * Any locator parameters (general type for constraints).
 */
type AnyParameters = Attributes;

/**
 * Base node of locator tree (by parameters and optional subtree).
 */
type BaseNode<Parameters, Subtree> = IsParametersEmpty<Parameters> extends true
  ? ((this: void) => LocatorCallResult<Subtree>) &
      ElementAttributeError<'The locator should be called'>
  : WithParameters<Parameters, LocatorCallResult<Subtree>> &
      ElementAttributeError<'The locator should be called (with parameters)'>;

/**
 * createLocator overload for component locator.
 */
type CreateComponentLocator = <Properties extends AnyLocator>(
  this: void,
  properties: Properties,
) => RuntimeLocator<Properties[LocatorKey]>;

/**
 * createLocator overload for root locator.
 */
type CreateRootLocator = <RootLocator extends AnyLocator>(
  this: void,
  rootPrefix: string,
  rootOptions?: Partial<RootOptions>,
) => RuntimeLocator<RootLocator[LocatorKey]>;

/**
 * createLocator overload for root locator with attributes mapping.
 */
type CreateRootLocatorWithMapping = <RootLocator extends AnyLocator, MapResult>(
  this: void,
  rootPrefix: string,
  rootOptions: Partial<RootOptions> & MapAttributes<MapResult>,
) => NormalizeTree<RootLocator[LocatorKey], MapResult>;

/**
 * Extracts parameters from some base or normalized node.
 */
type ExtractNodeParameters<SomeNode> = SomeNode extends AnyNodeWithParameters
  ? SomeNode[ParametersKey]
  : {};

/**
 * Return true if parameters is empty, false otherwise.
 */
type IsParametersEmpty<Parameters> = Keys<Parameters> extends never ? true : false;

/**
 * Keys of type.
 */
type Keys<T> = T extends unknown ? keyof T : never;

/**
 *  Locator call result by locator tree.
 */
type LocatorCallResult<Tree> = Tree extends object
  ? AnyLocator<Tree> & Partial<ElementAttributeError>
  : object;

/**
 * Description of locator tree (argument of Locator<...> and Node<...>).
 */
type LocatorDescription = Readonly<
  Record<string, AnyLocator | AnyNode | AnyParameters> &
    Partial<
      AnyHidden<NotLocatorDescription> &
        AnyLocator<NotLocatorDescription> &
        AnyNode<NotLocatorDescription> &
        AnyNodeWithParameters<NotLocatorDescription>
    >
>;

/**
 * Creates locator tree by locator description and locator parameters.
 */
type LocatorTree<
  Description,
  Parameters,
  Intersection = UnionToIntersection<Description>,
> = BaseNode<Parameters, void> & {
  readonly [Key in string & keyof Intersection]-?: LocatorTreeNode<
    Exclude<Intersection[Key], undefined>
  >;
};

/**
 * Creates locator tree node by locator description node.
 */
type LocatorTreeNode<DescriptionNode> = [DescriptionNode] extends [AnyLocator]
  ? BaseNode<ExtractNodeParameters<DescriptionNode[LocatorKey]>, DescriptionNode[LocatorKey]> &
      AnyHidden<NormalizeTree<DescriptionNode[LocatorKey]>>
  : [DescriptionNode] extends [AnyNode]
  ? DescriptionNode[NodeKey]
  : BaseNode<DescriptionNode, void>;

/**
 * Normalize base node of locator tree by base node and map result.
 */
type NormalizeBaseNode<BaseNode, MapResult> = BaseNode extends AnyNodeWithParameters
  ? WithParameters<BaseNode[ParametersKey], MapResult>
  : (this: void) => MapResult;

/**
 * Normalize subnodes of locator tree.
 */
type NormalizeSubnodes<Subnodes, MapResult> = {
  readonly [Key in string &
    Exclude<keyof Subnodes, keyof ElementAttributeError>]: Subnodes[Key] extends AnyHidden
    ? MapResult extends void
      ? Subnodes[Key][HiddenKey]
      : NormalizeTree<Subnodes[Key][HiddenKey], MapResult>
    : NormalizeTree<Subnodes[Key], MapResult>;
};

/**
 * Normalize locator tree to hidden internal brief presentation (so-called normalized tree).
 */
type NormalizeTree<Tree, MapResult = void> = NormalizeBaseNode<Tree, MapResult> &
  NormalizeSubnodes<Tree, MapResult>;

/**
 * Message for type error in Locator<...> and Node<...> argument.
 */
type NotLocatorDescription = 'Not a locator tree description';

/**
 * Type of runtime locator object by locator tree.
 */
type RuntimeLocator<Tree> = Tree extends AnyNodeWithParameters
  ? Tree
  : {readonly [Key in string & keyof Tree]: Tree[Key]} & BaseNode<{}, Tree>;

/**
 * Converts union of types to intersection of this types.
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/**
 * The parameter-dependent part of the base node.
 */
type WithParameters<Parameters, Return> = {
  (this: void, parameters: Parameters): Return;
} & AnyNodeWithParameters<Parameters>;

/**
 * Attributes object.
 */
export type Attributes = Readonly<Record<string, string>>;

/**
 * Type of createLocator function (with overloads).
 */
export type CreateLocator = CreateComponentLocator &
  CreateRootLocator &
  CreateRootLocatorWithMapping;

/**
 * Type of getLocatorParameters function.
 */
export type GetLocatorParameters = <Properties extends AnyLocator<AnyNodeWithParameters>>(
  this: void,
  properties: Properties,
) => ExtractNodeParameters<Properties[LocatorKey]>;

/**
 * Creates component locator type by locator description and locator parameters.
 */
export type Locator<
  Description extends LocatorDescription,
  Parameters extends AnyParameters = {},
> = AnyLocator<LocatorTree<Description, Parameters>> &
  Partial<
    ElementAttributeError<
      | 'The locator should be removed from spread properties with "removeLocatorFromProperties"'
      | undefined
    >
  >;

/**
 * Additional option of root locator for mapping attributes.
 */
export type MapAttributes<MapResult> = {
  readonly mapAttributes: (this: void, attributes: Attributes) => MapResult;
};

/**
 * Creates node locator type by locator description and locator parameters.
 */
export type Node<
  Description extends LocatorDescription,
  Parameters extends AnyParameters = {},
> = AnyNode<LocatorTree<Description, Parameters>>;

/**
 * Type of removeLocatorFromProperties function.
 */
export type RemoveLocatorFromProperties = <Properties extends AnyLocator>(
  this: void,
  properties: Properties,
) => Omit<Properties, LocatorKey | keyof ElementAttributeError>;

/**
 * Options of root locator (as createLocator second argument).
 */
export type RootOptions = Readonly<{
  isProduction: boolean;
  parameterAttributePrefix: string;
  pathAttribute: string;
  pathSeparator: string;
}>;
