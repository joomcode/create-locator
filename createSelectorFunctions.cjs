'use strict';

import('./createSelectorFunctions.js').then((mod) => {
  Object.assign(exports, mod);
});
