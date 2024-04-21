import type {Options} from 'create-locator';

export const assert = (value: boolean, message: string): void => {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }
};

export const defaultOptions = {
  childSeparator: '-',
  idAttribute: 'data-testid',
  parameterPrefix: 'data-test-',
} as const satisfies Options;

export const locatorId = '136';
