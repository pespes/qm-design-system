import type { Transform, TransformedToken } from 'style-dictionary/types';

// Check if a token is a number or unitless string that can be treated as a number.
const isNumericToken = (token: TransformedToken) => {
  const val = token.$value ?? token.value;
  const num = Number(val);
  // null & empty string return 0 for Number(), and '2px' & undefined for Number() return undefined'
  // confirm val is none of these
  return val !== null && val !== '' && !isNaN(num);
}

function isTypographyToken(token: TransformedToken) {
  const val = token.$value ?? token.value;
  return typeof val === 'object' && val !== null && val !== undefined && !Array.isArray(val);
}

// unitless integer em → em string (CSS / Tailwind output)
export const spacingToEm: Transform = {
  name: 'spacing/em',
  type: 'value',
  filter: (token) => token.path[0] === 'letterSpacing',
  transform: (token) => {
    if (!isNumericToken(token)) {
      console.warn(`spacing/em: Token ${token.name} is not a unitless number: ${token.$value ?? token.value}`);
      return token.$value ?? token.value;
    }
    const val = token.$value ?? token.value;
    const num = typeof val === 'string' ? parseFloat(val) : (val as number);
    return `${num / 1000}em`;
  },
};

// clean typography tokens to remove letterSpacing, which is not compatible with css 'font' property
// transforming the remaining properties is handled in StyleDictionary's built-in transform 'typography/css/shorthand'
export const typeConversion: Transform = {
  name: 'typography/clean',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'typography' || token.type === 'typography',
  transform: (token) => {
    if (!isTypographyToken(token)) {
      console.warn(`typography/clean: Token ${token.name} is not a valid typography object: ${token.$value ?? token.value}`);
      return token.$value ?? token.value;
    }
    const val = token.$value ?? token.value;
    const { letterSpacing, ...fontConfig } = val;
    return fontConfig;
  }
};

const transforms = [spacingToEm, typeConversion];

export default transforms;
