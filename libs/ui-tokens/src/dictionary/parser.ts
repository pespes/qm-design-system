import type { Parser, DesignTokens, DesignToken } from 'style-dictionary/types';

// Create a separate letter-spacing token alongside the initial typography token
// Dictionary transforms handing the transformation from object to css font property do not include letterSpacing, so a separate token
// needs to be created for access to the spacing value. Dictionary transforms only do 1:1 mapping, so a parser needs to be employed
// to split the token.
export const typographySplitParser: Parser = {
  name: 'typography-split',
  pattern: /semantic\/type\.tokens\.json$/, //just the semantic type token values to be parsed
  parser: ({ contents }: { contents: string | DesignTokens }) => {
    const data: DesignTokens =
      typeof contents === 'string' ? JSON.parse(contents) : contents;

    const splitTypography = (obj: DesignTokens): DesignTokens => {
      return Object.entries(obj).reduce<DesignTokens>((acc, [key, val]) => {
        const isToken =
          typeof val === 'object' &&
          val !== null &&
          !Array.isArray(val) &&
          (val.$value || val.value);
        // const isToken = typeof val === 'object' && (val.$value || val.value);
        if (isToken) {
          acc[key] = val; // Keep the original token

          // Extract letterSpacing into separate token
          const letterSpacing =
            val.$value?.letterSpacing ?? val.value?.letterSpacing;
          if (letterSpacing !== undefined) {
            acc[`${key}-tracking`] = {
              $type: 'spacing',
              $value: letterSpacing,
              comment: `letter spacing for ${key}`,
            };
          }
        } else if (typeof val === 'object' && val !== null) {
          acc[key] = splitTypography(val as DesignToken);
        }

        return acc;
      }, {});
    };

    return splitTypography(data);
  },
};
