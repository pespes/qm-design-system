import type { Action } from 'style-dictionary/types';
import { hasInvalidLeaf } from '../utilities/recursion.js';

// Scan for undefined, null or incorrectly typed values after transforms have been applied
export const validateTokens: Action = {
  name: 'validate-tokens',
  do: (dictionary, test, options) => {
    const platform = options.platforms;

    // If validating CSS tokens, values must not be type object, null or undefined
    // For Native, no null / undefined, but also check for nested undefined / null values
    // in objects (ie. fontSize)
    const invalidTokens = dictionary.allTokens.filter((token) => {
      const val = token.$value ?? token.value;
      if (platform && platform.css) {
        return val === undefined || val === null || typeof val === 'object';
      }
      else {
        return hasInvalidLeaf(val);
      }
    });

    if (invalidTokens.length > 0) {
      throw new Error('Build failed: invalid token values found.');
    }
  },
  undo: () => {} //style dictionary complains on build if no undo function is present
};
