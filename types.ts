/**
 * Symbol key for saving hidden normalized tree.
 */
declare const HIDDEN: unique symbol;

/**
 * Symbol key for saving locator tree of component locator.
 */
declare const LOCATOR: unique symbol;

/**
 * Attribute key to generate an error if the user forgot to call the locator.
 */
declare const NO_CALL_ERROR: 'aria-invalid';

/**
 * Symbol key for saving locator tree of node locator.
 */
declare const NODE: unique symbol;

/**
 * Symbol key for saving locator parameters.
 */
declare const PARAMETERS: unique symbol;

/**
 * Any hidden normalized tree of locators.
 */
type AnyHidden = {readonly [HIDDEN]: object};

/**
 * Any locator type, maybe with locator tree constraint (result of Locator<...>).
 */
type AnyLocator<Tree = object> = {readonly [LOCATOR]: Tree};

/**
 * Any node locator type (result of Node<...>).
 */
type AnyNode = {readonly [NODE]: object};

/**
 * Any node of locator tree with parameters.
 */
type AnyNodeWithParameters = {readonly [PARAMETERS]: object};

/**
 * Any locator parameters (general type for constraints).
 */
type AnyParameters = Attributes;

/**
 * Base node of locator tree (by parameters and optional subtree).
 */
type BaseNode<Parameters, Subtree> = IsParametersEmpty<Parameters> extends true
  ? ((this: void) => LocatorCallResult<Subtree>) & {
      readonly [NO_CALL_ERROR]: 'The locator should be called';
    }
  : WithParameters<Parameters, LocatorCallResult<Subtree>> & {
      readonly [NO_CALL_ERROR]: 'The locator should be called (with parameters)';
    };

/**
 * createLocator overload for component locator.
 */
type CreateComponentLocator = <Properties extends AnyLocator>(
  this: void,
  properties: Properties,
) => RuntimeLocator<Properties[typeof LOCATOR]>;

/**
 * createLocator overload for root locator.
 */
type CreateRootLocator = <RootLocator extends AnyLocator>(
  this: void,
  rootPrefix: string,
  rootOptions?: Partial<RootOptions>,
) => RuntimeLocator<RootLocator[typeof LOCATOR]>;

/**
 * createLocator overload for root locator with attributes mapping.
 */
type CreateRootLocatorWithMapping = <RootLocator extends AnyLocator, MapResult>(
  this: void,
  rootPrefix: string,
  rootOptions: Partial<RootOptions> & MapAttributes<MapResult>,
) => NormalizeTree<RootLocator[typeof LOCATOR], MapResult>;

/**
 * Extracts parameters from some base or normalized node.
 */
type ExtractNodeParameters<SomeNode> = SomeNode extends AnyNodeWithParameters
  ? SomeNode[typeof PARAMETERS]
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
type LocatorCallResult<Tree> = Tree extends object ? {readonly [LOCATOR]: Tree} : object;

/**
 * Description of locator tree (argument of Locator<...> and Node<...>).
 */
type LocatorDescription = Readonly<
  Record<string, AnyLocator | AnyNode | AnyParameters> & {
    [HIDDEN]?: NotLocatorDescription;
    [LOCATOR]?: NotLocatorDescription;
    [NODE]?: NotLocatorDescription;
    [PARAMETERS]?: NotLocatorDescription;
  }
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
  ? BaseNode<
      ExtractNodeParameters<DescriptionNode[typeof LOCATOR]>,
      DescriptionNode[typeof LOCATOR]
    > & {readonly [HIDDEN]: NormalizeTree<DescriptionNode[typeof LOCATOR]>}
  : [DescriptionNode] extends [AnyNode]
  ? DescriptionNode[typeof NODE]
  : BaseNode<DescriptionNode, void>;

/**
 * Type of NO_CALL_ERROR key.
 */
type NoCallError = typeof NO_CALL_ERROR;

/**
 * Normalize base node of locator tree by base node and map result.
 */
type NormalizeBaseNode<BaseNode, MapResult> = BaseNode extends AnyNodeWithParameters
  ? WithParameters<BaseNode[typeof PARAMETERS], MapResult>
  : (this: void) => MapResult;

/**
 * Normalize subnodes of locator tree.
 */
type NormalizeSubnodes<Subnodes, MapResult> = {
  readonly [Key in string & Exclude<keyof Subnodes, NoCallError>]: Subnodes[Key] extends AnyHidden
    ? MapResult extends void
      ? Subnodes[Key][typeof HIDDEN]
      : NormalizeTree<Subnodes[Key][typeof HIDDEN], MapResult>
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
  : {[Key in string & keyof Tree]: Tree[Key]} & ((this: void) => {readonly [LOCATOR]: Tree});

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
  readonly [PARAMETERS]: Parameters;
};

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
) => ExtractNodeParameters<Properties[typeof LOCATOR]>;

/**
 * Creates component locator type by locator description and locator parameters.
 */
export type Locator<
  Description extends LocatorDescription,
  Parameters extends AnyParameters = {},
> = {
  readonly [LOCATOR]: LocatorTree<Description, Parameters>;
};

/**
 * Additional option of root locator for mapping attributes.
 */
export type MapAttributes<MapResult> = {
  readonly mapAttributes: (this: void, attributes: Attributes) => MapResult;
};

/**
 * Creates node locator type by locator description and locator parameters.
 */
export type Node<Description extends LocatorDescription, Parameters extends AnyParameters = {}> = {
  readonly [NODE]: LocatorTree<Description, Parameters>;
};

/**
 * Options of root locator (as createLocator second argument).
 */
export type RootOptions = Readonly<{
  isProduction: boolean;
  parameterAttributePrefix: string;
  pathAttribute: string;
  pathSeparator: string;
}>;
