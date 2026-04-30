import type { Action } from 'style-dictionary/types';
import { hasInvalidLeaf, hasUnresolvedVal } from '../utilities/validation.js';
import { findTokenValue } from '../utilities/token-helpers.js';

// Scan for undefined, null or incorrectly typed values after transforms have been applied
export const validateTokens: Action = {
  name: 'validate-tokens',
  do: (dictionary, options) => {
    const platform = options.platforms;

    // If validating CSS tokens, values must not be type object, null or undefined
    // For Native, no null / undefined, but also check for nested undefined / null values
    // in objects (ie. fontSize)
    // Check both for any unresolved values that could break consuming apps (tokenName: '{color.blue.500}')
    const invalidTokens = dictionary.allTokens.filter((token) => {
      const val = findTokenValue(token);
      if (platform && platform.css) {
        if (typeof val === 'string') {
          return hasUnresolvedVal(val);
        }
        return val === undefined || val === null || typeof val === 'object';
      } else {
        return hasInvalidLeaf(val);
      }
    });

    if (invalidTokens.length > 0) {
      throw new Error('Build failed: invalid token values found.');
    }
  },
  undo: () => {}, //style dictionary complains on build if no undo function is present
};
