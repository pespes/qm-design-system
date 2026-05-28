import type { TransformedToken } from 'style-dictionary/types';
import { findTokenValue } from '../utilities/token-helpers.js';

export interface ThemeVar {
  category: string;
  key: string;
  cssVarName: string;
  value: string | number;
}

export interface UtilityBlock {
  name: string;
  properties: Record<string, string | number>;
}

export interface CategorizedTokens {
  themeVars: ThemeVar[];
  utilities: UtilityBlock[];
}

const UTILITY_PREFIX = 'type';

export const categorizeTokens = (
  tokens: TransformedToken[],
): CategorizedTokens => {
  const themeVars: ThemeVar[] = [];
  const utilities: UtilityBlock[] = [];

  for (const token of tokens) {
    const value = findTokenValue(token);
    if (value === undefined || value === null) continue;

    // pull the first value of token.path, which is the css property such as 'color', 'radius', etc
    const [category, ...rest] = token.path;
    if (!category || rest.length === 0) continue;
    const cleanedName = rest.join('-');

    const isTypography =
      token.$type === 'typography' || token.type === 'typography';

    // typography tokens defined under @utility to group font-related css properties
    if (isTypography && typeof value === 'object') {
      utilities.push({
        name: `${UTILITY_PREFIX}-${cleanedName}`,
        properties: value,
      });

      // other tokens defined under @theme, which should not be of type object
    } else if (!isTypography && typeof value !== 'object') {
      //cateogry + key for the json output, cssVarName holds full token name for css stylesheet
      themeVars.push({
        category,
        key: cleanedName,
        cssVarName: token.name,
        value,
      });
    }
  }

  return { themeVars, utilities };
};
