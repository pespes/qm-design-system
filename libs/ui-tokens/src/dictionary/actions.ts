import type { Action } from 'style-dictionary/types';
import { hasInvalidLeaf, hasUnresolvedVal } from '../utilities/validation.js';
import { findTokenValue } from '../utilities/token-helpers.js';

// Scan for undefined, null or incorrectly typed values after transforms have been applied
export const validateTokens: Action = {
  name: 'validate-tokens',
  do: (dictionary, _, options) => {
    const platform = options.platforms;

    // Check for no null / undefined values or any nested null / undefined values. For CSS, only
    // typography tokens can be type object, otherwise values must be of type string.
    // Check both for any unresolved values that could break consuming apps (tokenName: '{color.blue.500}')
    const invalidTokens = dictionary.allTokens.filter((token) => {
      const val = findTokenValue(token);
      if (platform && platform.css) {
        if (typeof val === 'string') {
          return hasUnresolvedVal(val);
        } else if (token.$type === 'typography') {
          return hasInvalidLeaf(val);
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
