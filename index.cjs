'use strict';

import('./index.js').then((mod) => {
  Object.assign(exports, mod);
});
