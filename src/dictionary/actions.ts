import type { Action } from 'style-dictionary/types';

// Scan for undefined, null or incorrectly typed values after transforms have been applied
export const validateTokens: Action = {
  name: 'validate_tokens',
  do: (dictionary) => {
    const invalidTokens = dictionary.allTokens.filter((token) => {
      const val = token.$value ?? token.value;
      return val === undefined || val === null || typeof val === 'object';
    });

    if (invalidTokens.length > 0) {
      throw new Error('Build failed: invalid token values found.');
    }
  },
  undo: () => {} //style dictionary complains on build if no undo function is present
};
