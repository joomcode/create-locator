/**
 * Inner key for saving hidden normalized tree type.
 */
declare const HIDDEN: unique symbol;

/**
 * Inner key for saving Locator result.
 */
declare const LOCATOR: unique symbol;

/**
 * Attribute outer key to generate an error if the user forgot to call the locator.
 */
declare const NO_CALL_ERROR: 'aria-invalid';

/**
 * Inner key for saving Node result.
 */
declare const NODE: unique symbol;

/**
 * Inner key for saving locator parameters.
 */
declare const PARAMETERS: unique symbol;

/**
 * Any hidden subtree of locators.
 */
type AnyHidden = {readonly [HIDDEN]: object};

/**
 * Any locator (result of Locator<...>).
 */
type AnyLocator = {readonly [LOCATOR]: object};

/**
 * Any node (result of Node<...>).
 */
type AnyNode = {readonly [NODE]: object};

/**
 * Any node of locators tree with parameters.
 */
type AnyNodeWithParameters = {readonly [PARAMETERS]: object};

/**
 * Any locator parameters (general type for extends of).
 */
type AnyParameters = Attributes;

/**
 * Base visible node of locators tree (by parameters and, maybe, locators tree).
 */
type BaseVisibleNode<Parameters, Tree> = IsParametersEmpty<Parameters> extends true
  ? ((this: void) => LocatorReturn<Tree>) & {
      readonly [NO_CALL_ERROR]: 'The locator should be called';
    }
  : WithParameters<Parameters, LocatorReturn<Tree>> & {
      readonly [NO_CALL_ERROR]: 'The locator should be called (with parameters)';
    };

/**
 * createLocator overload for component locator.
 */
type CreateComponentLocator = <Props extends AnyLocator>(
  this: void,
  props: Props,
) => CreateLocatorResult<Props[typeof LOCATOR]>;

/**
 * Type of component root locator object.
 */
type CreateLocatorResult<Tree> = Tree extends AnyNodeWithParameters
  ? Tree
  : {[Key in string & keyof Tree]: Tree[Key]} & ((this: void) => {readonly [LOCATOR]: Tree});

/**
 * createLocator overload for app root locator.
 */
type CreateRootLocator = <RootLocator extends AnyLocator>(
  this: void,
  rootPrefix: string,
  rootOptions?: Partial<RootOptions>,
) => CreateLocatorResult<RootLocator[typeof LOCATOR]>;

/**
 * createLocator overload for app root locator with attributes mapping.
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
 * Description of locators tree (argument of Locator<...> and Node<...>).
 */
type LocatorsDescription = Readonly<
  Record<string, AnyLocator | AnyNode | AnyParameters> & {
    [HIDDEN]?: NotLocatorDescription;
    [LOCATOR]?: NotLocatorDescription;
    [NODE]?: NotLocatorDescription;
    [PARAMETERS]?: NotLocatorDescription;
  }
>;

/**
 * Creates locators tree by locators description and component root locator parameters.
 */
type LocatorsTree<
  Description,
  RootParameters,
  Intersection = UnionToIntersection<Description>,
> = BaseVisibleNode<RootParameters, void> & {
  readonly [Key in string & keyof Intersection]-?: Exclude<
    Intersection[Key],
    undefined
  > extends AnyLocator
    ? BaseVisibleNode<
        ExtractNodeParameters<Exclude<Intersection[Key], undefined>[typeof LOCATOR]>,
        Exclude<Intersection[Key], undefined>[typeof LOCATOR]
      > & {
        readonly [HIDDEN]: NormalizeTree<Exclude<Intersection[Key], undefined>[typeof LOCATOR]>;
      }
    : Exclude<Intersection[Key], undefined> extends AnyNode
    ? Exclude<Intersection[Key], undefined>[typeof NODE]
    : BaseVisibleNode<Exclude<Intersection[Key], undefined>, void>;
};

/**
 * Return type of locator call signature.
 */
type LocatorReturn<Tree> = Tree extends object ? {readonly [LOCATOR]: Tree} : object;

/**
 * Type of NO_CALL_ERROR key.
 */
type NoCallError = typeof NO_CALL_ERROR;

/**
 * Normalize base visible node of locators tree.
 */
type NormalizeBaseNode<BaseNode, MapResult> = BaseNode extends AnyNodeWithParameters
  ? WithParameters<BaseNode[typeof PARAMETERS], MapResult>
  : (this: void) => MapResult;

/**
 * Normalize subnodes of locators tree.
 */
type NormalizeSubnodes<Subnodes, MapResult> = {
  readonly [Key in string & Exclude<keyof Subnodes, NoCallError>]: Subnodes[Key] extends AnyHidden
    ? [void] extends [MapResult]
      ? Subnodes[Key][typeof HIDDEN]
      : NormalizeTree<Subnodes[Key][typeof HIDDEN], MapResult>
    : NormalizeTree<Subnodes[Key], MapResult>;
};

/**
 * Normalize visible locators tree to hidden internal brief presentation.
 */
type NormalizeTree<Tree, MapResult = void> = NormalizeBaseNode<Tree, MapResult> &
  NormalizeSubnodes<Tree, MapResult>;

/**
 * Message for type error in Locator<...> and Node<...> argument.
 */
type NotLocatorDescription = 'Not a locator tree description';

/**
 * Converts union of types to intersection of this types.
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/**
 * Part of node type with parameters.
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
 * Creates component locators tree by locators description.
 */
export type Locator<
  Description extends LocatorsDescription,
  Parameters extends AnyParameters = {},
> = {
  readonly [LOCATOR]: LocatorsTree<Description, Parameters>;
};

/**
 * Additional option of app root locator for mapping attributes.
 */
export type MapAttributes<MapResult> = {
  readonly mapAttributes: (this: void, attributes: Attributes) => MapResult;
};

/**
 * Creates node of component locators tree by locators description.
 */
export type Node<Description extends LocatorsDescription, Parameters extends AnyParameters = {}> = {
  readonly [NODE]: LocatorsTree<Description, Parameters>;
};

/**
 * Options of app root locator (as createLocator second argument).
 */
export type RootOptions = Readonly<{
  isProduction: boolean;
  locatorAttribute: string;
  pathDelimiter: string;
  parameterAttributePrefix: string;
}>;
