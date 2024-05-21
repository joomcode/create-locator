import {getCssSelectorFromAttributesChain} from 'create-locator/getCssSelectorFromAttributesChain';

import type {Attributes} from 'create-locator';

import {assert} from './utils.js';

const attributesArray: readonly Attributes[] = [
  {},
  {name1: 'exact'},
  {name2: 'start*'},
  {name3: '*end'},
  {name4: '*'},
  {name5: 'start*end'},
  {name6: 'start*contain*end'},
  {name7: 'start*contain**'},
  {name8: '**contain**end'},
  {name9: '*contain1**contain2*contain3**'},
  {name10: 'start*contain1**contain2**'},
  {name11: '*contain1**contain2*end'},
];

const selectorsForAttributes = [
  '',
  '[name1="exact"]',
  '[name2^="start"]',
  '[name3$="end"]',
  '[name4]',
  '[name5^="start"][name5$="end"]',
  '[name6^="start"][name6*="contain"][name6$="end"]',
  '[name7^="start"][name7*="contain"]',
  '[name8*="contain"][name8$="end"]',
  '[name9*="contain1"][name9*="contain2"][name9*="contain3"]',
  '[name10^="start"][name10*="contain1"][name10*="contain2"]',
  '[name11*="contain1"][name11*="contain2"][name11$="end"]',
];

export const testGetCssSelectorFromAttributesChain = () => {
  for (let firstIndex = 0; firstIndex < attributesArray.length; firstIndex += 1) {
    const attributes = attributesArray[firstIndex]!;
    const expectedSelector = selectorsForAttributes[firstIndex] || '*';

    const attributeName = Object.keys(attributes)[0];
    const attributeValue = attributeName === undefined ? undefined : attributes[attributeName];

    const selector = getCssSelectorFromAttributesChain([attributes]);

    assert(
      selector === expectedSelector,
      `correctly build CSS selector for attribute value "${attributeValue}"`,
    );

    for (let secondIndex = 0; secondIndex < attributesArray.length; secondIndex += 1) {
      const chain = [attributesArray[firstIndex]!, attributesArray[secondIndex]!];
      const expectedSelector = `${selectorsForAttributes[firstIndex]} ${selectorsForAttributes[secondIndex]}`;

      const selector = getCssSelectorFromAttributesChain(chain);

      assert(selector === (expectedSelector.trim() || '*'));
    }
  }
};
