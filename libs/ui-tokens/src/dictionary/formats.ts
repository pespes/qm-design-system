import type { TransformedToken } from 'style-dictionary';
import type { Format, FormatFnArguments } from 'style-dictionary/types';
import { fileHeader, getReferences } from 'style-dictionary/utils';
import { set } from 'lodash-es';
import { hasInvalidLeaf } from '../utilities/validation.js';
import { findTokenValue } from '../utilities/token-helpers.js';

const tokenTypes = ['border-width', 'color', 'radius', 'spacing', 'text'];

const categoryMap: Record<string, string> = {
  color: 'colors',
  fontSize: 'text',
  spacing: 'spacing',
  radius: 'borderRadius',
  borderWidth: 'borderWidth',
  opacity: 'opacity',
  zIndex: 'zIndex',
  text: 'fontSize',
  shadow: 'boxShadow',
};

interface ThemeValue {
  [key: string]: string | number | ThemeValue;
}

interface ThemeAcc {
  extend: Record<string, ThemeValue>;
  [key: string]: ThemeValue;
}

// for base Tailwind @theme
export const tailwindTheme: Format = {
  name: 'css/tailwind-theme',
  format: async ({ dictionary, file }: FormatFnArguments) => {
    const defaults = tokenTypes.reduce((acc, type, idx) => {
      const renderLineBreak = idx < tokenTypes.length - 1 ? '\n' : ''; //prevent extra line before closing bracket
      return acc + `  --${type}-*: initial;${renderLineBreak}`;
    }, '');

    const { themeVars, utilityVars } = dictionary.allTokens.reduce(
      (acc, token) => {
        const val = findTokenValue(token);
        if (val === undefined || val === null) return acc;

        const isTypography =
          token.$type === 'typography' || token.type === 'typography';

        if (isTypography && typeof val === 'object') {
          // typography tokens defined under @utility to group font-related css properties
          const properties = Object.entries(val)
            .map(([prop, value]) => `  ${prop}: ${value};`)
            .join('\n');

          acc.utilityVars += `@utility ${token.name} {\n${properties}\n}\n`;
        } else if (!isTypography && typeof val !== 'object') {
          // other tokens defined under @theme, which should not be of type object
          acc.themeVars += `  --${token.name}: ${val};\n`;
        }

        return acc;
      },
      { themeVars: '', utilityVars: '' },
    );

    if (!themeVars.trim() && !utilityVars.trim()) {
      return `/* No tokens found for ${file.destination} */`;
    }

    return [
      await fileHeader({ file }),
      '@theme {',
      defaults,
      '}\n',
      '@theme {',
      themeVars,
      '}\n',
      utilityVars,
    ].join('\n');
  },
};

export const nativeTheme: Format = {
  name: 'js/tw-react-native',
  format: async ({ dictionary, file }: FormatFnArguments) => {
    const theme = dictionary.allTokens.reduce<ThemeAcc>(
      (acc, token: TransformedToken) => {
        const value = findTokenValue(token);

        // filter out any undefined / null values, or empty objects
        if (
          hasInvalidLeaf(value) ||
          (typeof value === 'object' && Object.keys(value).length === 0)
        ) {
          return acc;
        }

        // set root name to match TWRNC theme prop names, setting boxShadow under 'extend'
        const category = token.path[0] || '';
        const categoryKey = categoryMap[category] || category;
        const root = categoryKey === 'boxShadow' ? acc.extend : acc;
        root[categoryKey] = root[categoryKey] || {};

        if (token.$type === 'typography' || token.type === 'typography') {
          // TWNRC does not include fontFamily in its value, so need to find the referenced fontFamily string
          // from transformed token, eg. ["DM sans", "sans-serif"] from "{fontFamily.sans}"
          const originalFontFamily =
            token.original.$value?.fontFamily ??
            token.original.value?.fontFamily;
          const fontTokenRefs = getReferences(
            originalFontFamily,
            dictionary.tokens,
            {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              unfilteredTokens: dictionary.unfilteredTokens!,
            },
          );
          const tokenRef = fontTokenRefs[0];

          // surface the fontFamily in final output
          if (tokenRef) {
            const fontName = tokenRef.path.slice(1).join('-');
            acc.fontFamily = acc.fontFamily || {};
            acc.fontFamily[fontName] = tokenRef.$value ?? tokenRef.value;
          }
        }

        const remainingPath = token.path.slice(1);
        if (categoryKey === 'colors') {
          // tailwind-react-native-classnames takes a nested object for colors, otherwise flat map
          // https://github.com/jaredh159/tailwind-react-native-classnames/blob/master/src/tw-config.ts
          // Use reduce utility function to set nested values
          set(root[categoryKey], remainingPath, value);
        } else {
          const flattenedKey = remainingPath.join('-');
          root[categoryKey][flattenedKey] = value;
        }
        return acc;
      },
      { extend: {} },
    );

    // To check if empty, confirm output is same as initial acc in reduce
    if (
      Object.values(theme).length === 1 &&
      Object.values(theme.extend).length === 0
    ) {
      return `/* No tokens found for ${file.destination} */`;
    }

    return [
      await fileHeader({ file }),
      `export const theme = ${JSON.stringify(theme, null, 2).replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)":/g, '$1:')};`,
    ].join('');
  },
};

const formats = [tailwindTheme, nativeTheme];
export default formats;
