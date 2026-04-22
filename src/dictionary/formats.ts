import type { TransformedToken } from 'style-dictionary';
import type { Format, FormatFnArguments } from 'style-dictionary/types';
import { fileHeader, getReferences } from 'style-dictionary/utils';
import { setNestedValue } from '../utilities/recursion.js';

const tokenTypes = ['border-width', 'color', 'breakpoint', 'opacity', 'radius', 'spacing', 'text', 'z-index'];

const categoryMap: Record<string, string> = {
  'color': 'colors',
  'fontSize': 'text',
  'spacing': 'spacing',
  'radius': 'borderRadius',
  'borderWidth': 'borderWidth',
  'opacity': 'opacity',
  'zIndex': 'zIndex',
  'text': 'fontSize',
  'shadow': 'boxShadow',
};


// for base Tailwind @theme
export const tailwindTheme: Format = {
  name: 'css/tailwind-theme',
  format: async ({ dictionary, file }: FormatFnArguments) => {

    const defaults = tokenTypes.reduce((acc, type, idx) => {
      const renderLineBreak  = idx < tokenTypes.length - 1 ? '\n' : ''; //prevent extra line before closing bracket
      return acc + `  --${type}-*: initial;${renderLineBreak}`
    }, '');
    
    const vars = dictionary.allTokens.reduce((acc, token, idx) => {
      let val = token.$value ?? token.value;
      if (val === undefined || val === null || typeof val === 'object') {
        return acc;
      }

      const renderLineBreak = idx < dictionary.allTokens.length - 1 ? '\n' : '';
      let name = token.name;

      // Style Dictionary interally calculates names from their path. Since the split letter spacing
      // token's path mirrors that of the original typography token, rename it to start with 'tracking'
      // instead of 'text
      if (token.$type === 'spacing' || token.type === 'spacing') {
        name = `${name.replace('text', 'tracking').replace('-tracking', '')}`
      }

      return acc + `  --${name}: ${val};${renderLineBreak}`;
    }, '');

    if (!vars.trim()) {
      return `/* No tokens found for ${file.destination} */`;
    }

    return [
      await fileHeader({file}),
      '@theme {',
      defaults,
      '}',
      '',
      '@theme {',
      vars,
      '}',
    ].join('\n');
  },
};

export const tailwindReactNative: Format = {
  name: 'js/tw-react-native',
  format: async ({ dictionary, options, file }: FormatFnArguments) => {
    const theme = dictionary.allTokens.reduce((acc: Record<string, any>, token: TransformedToken) => {
      const category = token.path[0]!;
      const value = token.$value ?? token.value;
      const themeKey = categoryMap[category] || category;

      if (themeKey === 'boxShadow') {
        acc.extend[themeKey] = acc.extend[themeKey] || {};
      } else {
        acc[themeKey] = acc[themeKey] || {};
      }
     
      if (token.$type === 'typography' || token.type === 'typography') {
        const subPath = token.path.slice(1).join('-');
        acc.fontSize = acc.fontSize || {};
        acc.fontSize[subPath] = value;

        // pull original fontFamily string from transformed token, eg. "{fontFamily.sans}"
        const originalFontFamily = token.original.$value?.fontFamily ?? token.original.value?.fontFamily;
        const fontTokenRefs = getReferences(originalFontFamily, dictionary.tokens, {
          unfilteredTokens: dictionary.unfilteredTokens!
        });
        
        const tokenRef = fontTokenRefs[0];
        if (tokenRef) {
          const fontName = tokenRef.path.slice(-1).join('-');
          acc.fontFamily = acc.fontFamily || {};
          acc.fontFamily[fontName] = tokenRef.$value ?? tokenRef.value;
        }
        return acc;
      }

      const remainingPath = token.path.slice(1);
      let root = themeKey === 'boxShadow' ? acc.extend[themeKey] : acc[themeKey];
      if (themeKey === 'colors') {
        // tailwind-react-native-classnames takes a nested object for colors, otherwise flat map
        // https://github.com/jaredh159/tailwind-react-native-classnames/blob/master/src/tw-config.ts
        setNestedValue(root, remainingPath, value);
      } else {
        const flatKey = remainingPath.join('-');
        root[flatKey] = value;
      }
      return acc;
    }, {extend: {}});

    const exportName = options.exportName || 'theme'

    return [
      await fileHeader({file}),
      `export const ${exportName} = ${JSON.stringify(theme, null, 2).replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)":/g, '$1:')};`
    ].join('');
  }
}

const formats = [tailwindTheme, tailwindReactNative];
export default formats;
