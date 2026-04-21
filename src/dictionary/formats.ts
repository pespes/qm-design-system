import type { Format, FormatFnArguments } from 'style-dictionary/types';
import { fileHeader } from 'style-dictionary/utils';

const tokenTypes = ['border-width', 'color', 'breakpoint', 'opacity', 'radius', 'spacing', 'text', 'z-index'];

// for base Tailwind @theme
export const tailwindTheme: Format = {
  name: 'css/tailwind-theme',
  format: async ({ dictionary, file }: FormatFnArguments) => {
    const defaults = tokenTypes.reduce((acc, type, idx) => {
      const renderLineBreak  = idx < tokenTypes.length - 1 ? '\n' : '';
      return acc + `  --${type}-*: initial;${renderLineBreak}`
    }, '');
    
    const vars = dictionary.allTokens.reduce((acc, token, idx) => {
      let val = token.$value ?? token.value;
      if (val === undefined || val === null || typeof val === 'object') {
        return acc;
      }
      if (typeof val === 'string' && val[val.length - 1] === ';') {
        val = val.slice(0, -1);
      }
      const renderLineBreak = idx < dictionary.allTokens.length - 1 ? '\n' : '';
      return acc + `  --${token.name}: ${val};${renderLineBreak}`;
    }, '');

    if (!vars.trim()) {
      return `/* No tokens found for ${file.destination} */`
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

const formats = [tailwindTheme];
export default formats;
