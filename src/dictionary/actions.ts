import type { Action } from 'style-dictionary/types';

// Scan for undefined, null or incorrectly typed values after transforms have been applied
export const validateTokens: Action = {
  name: 'validate-tokens',
  do: (dictionary, _, options) => {
    const platform = options.platforms;

    // If validating CSS tokens, values must not be type object, but for Native, token values
    // such as fontSize are expected to be arrays
    const invalidTokens = dictionary.allTokens.filter((token) => {
      const val = token.$value ?? token.value;
      if (platform && platform.css) {
        return val === undefined || val === null || typeof val === 'object';
      }
      else {
        return val === undefined || val === null;
      }
    });

    if (invalidTokens.length > 0) {
      throw new Error('Build failed: invalid token values found.');
    }
  },
  undo: () => {} //style dictionary complains on build if no undo function is present
};
