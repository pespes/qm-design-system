import type { TransformedToken } from 'style-dictionary/types';

export const findTokenValue = (token: TransformedToken) => {
  return token.$value ?? token.value;
};
