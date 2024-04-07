import type {Options} from 'create-locator';

export const assert = (value: boolean, message: string): void => {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }
};

export const defaultOptions: Options = {
  childSeparator: '-',
  idAttribute: 'data-testid',
  parameterPrefix: 'data-test-',
};

export const locatorId = '136';
