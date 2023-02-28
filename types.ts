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
 * Attributes object.
 */
type Attributes = Readonly<Record<string, string>>;

/**
 * Base visible node of locators tree (by parameters and, maybe, locators tree).
 */
type BaseVisibleNode<Parameters, Tree> = IsParametersEmpty<Parameters> extends true
  ? (Tree extends object ? () => {readonly [LOCATOR]: Tree} : () => object) & {
      readonly [NO_CALL_ERROR]: 'The locator should be called';
    }
  : WithParameters<Parameters, object> & {
      readonly [NO_CALL_ERROR]: 'The locator should be called (with parameters)';
    };

/**
 * createLocator overload for component locator.
 */
type CreateComponentLocator = <Props extends AnyLocator>(
  props: Props,
) => CreateLocatorResult<Props[typeof LOCATOR]>;

type CreateLocatorResult<Tree> = Tree extends AnyNodeWithParameters
  ? Tree
  : {[Key in string & keyof Tree]: Tree[Key]} & (() => {readonly [LOCATOR]: Tree});

/**
 * createLocator overload for root locator.
 */
type CreateRootLocator = <RootLocator extends AnyLocator>(
  rootPrefix: string,
  rootOptions?: RootOptions,
) => CreateLocatorResult<RootLocator[typeof LOCATOR]>;

/**
 * createLocator overload for root locator with attributes mapping.
 */
type CreateRootLocatorWithMapping = <RootLocator extends AnyLocator, MapResult>(
  rootPrefix: string,
  rootOptions: RootOptions & {
    readonly mapAttributes: (attributes: Attributes) => MapResult;
  },
) => NormalizeTree<RootLocator[typeof LOCATOR], MapResult>;

/**
 * Return true if parameters is empty, false otherwise.
 */
type IsParametersEmpty<Parameters> = [keyof Parameters] extends [never] ? true : false;

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
 * Create locators tree by locators description and root parameters.
 */
type LocatorsTree<Description, RootParameters> = BaseVisibleNode<RootParameters, void> & {
  readonly [Key in string & keyof Description]: Description[Key] extends AnyLocator
    ? BaseVisibleNode<{}, Description[Key][typeof LOCATOR]> & {
        readonly [HIDDEN]: NormalizeTree<Description[Key][typeof LOCATOR]>;
      }
    : Description[Key] extends AnyNode
    ? Description[Key][typeof NODE]
    : BaseVisibleNode<Description[Key], void>;
};

/**
 * Type of NO_CALL_ERROR key.
 */
type NoCallError = typeof NO_CALL_ERROR;

/**
 * Normalize base visible node of locators tree.
 */
type NormalizeBaseNode<BaseNode, MapResult> = BaseNode extends AnyNodeWithParameters
  ? WithParameters<BaseNode[typeof PARAMETERS], MapResult>
  : () => MapResult;

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
 * Options of root locator (as createLocator second argument).
 */
type RootOptions = Readonly<{
  isProduction?: boolean;
  locatorAttribute?: string;
  pathDelimiter?: string;
  parameterAttributePrefix?: string;
}>;

/**
 * Part of node type with parameters.
 */
type WithParameters<Parameters, Return> = {
  (parameters: Parameters): Return;
  readonly [PARAMETERS]: Parameters;
};

/**
 * Type of createLocator function (with overloads).
 */
export type CreateLocator = CreateComponentLocator &
  CreateRootLocator &
  CreateRootLocatorWithMapping;

/**
 * Create component locators tree by locators description.
 */
export type Locator<
  Description extends LocatorsDescription,
  Parameters extends AnyParameters = {},
> = {
  readonly [LOCATOR]: LocatorsTree<Description, Parameters>;
};

/**
 * Create node of component locators tree by locators description.
 */
export type Node<Description extends LocatorsDescription, Parameters extends AnyParameters = {}> = {
  readonly [NODE]: LocatorsTree<Description, Parameters>;
};
