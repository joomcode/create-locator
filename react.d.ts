// @ts-ignore
/// <reference types="react" />

declare const CREATE_LOCATOR_ERROR_ATTRIBUTE: unique symbol;

declare namespace React {
  interface AriaAttributes {
    [CREATE_LOCATOR_ERROR_ATTRIBUTE]?: undefined;
  }
}
