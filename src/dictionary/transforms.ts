import type { Transform, TransformedToken } from 'style-dictionary/types';
import BigNumber from 'bignumber.js';
import { findTokenValue } from '../utilities/token-helpers.js'

// Check if a token is a number or unitless string that can be treated as a number.
const isNumericToken = (val: any) => {
  const num = Number(val);
  // null & empty string return 0 for Number(), and '2px' & undefined for Number() return undefined'
  // confirm val is none of these
  return val !== null && val !== '' && !isNaN(num);
}

function isTypographyToken(val: any, requiredFields: string[]) {
  if (typeof val !== 'object' || val === null || val === undefined || Array.isArray(val)) {
    return false;
  }
  //Also check for required fields that web / native need to build typography token
  return requiredFields.every((f) => {
    return val[f] !== undefined && val[f] !== null && val[f] !== '';
  })
}

// unitless integer em → em string (CSS / Tailwind output)
export const spacingToEm: Transform = {
  name: 'spacing/em',
  type: 'value',
  filter: (token) => token.path[0] === 'letterSpacing',
  transform: (token) => {
    const val = findTokenValue(token)
    if (!isNumericToken(val)) {
      console.warn(`spacing/em: Token ${token.name} is not a unitless number: ${val}`);
      return val;
    }
    const num = new BigNumber(val);
    return `${num.dividedBy(1000).dp(3).toString()}em`;
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
    const val = findTokenValue(token);
    if (!isTypographyToken(val, ['fontFamily', 'fontSize'])) {
      console.error(`typography/clean: Token ${token.name} is not a valid typography object: ${val}`);
      return undefined;
    }
    const { letterSpacing, ...fontConfig } = val;
    return fontConfig;
  }
};

// switch to hex / rgba fallbacks for RN
export const nativeColorFallback: Transform = {
  name: 'native-color-fallback',
  type: 'value',
  filter: (token) => token.$type === 'color' || token.type === 'color',
  transform: (token) => {
    const fallback = token.$extensions?.['hex-fallback'] ?? token.$extensions?.['rgba-fallback'];
    return fallback;
  }
}

// clean typography token to remove fontFamily, which TWRNC does not use in fontSize config:
// https://github.com/jaredh159/tailwind-react-native-classnames/blob/6b7a0903b8ced433760e61dc118c4989a1802db4/src/tw-config.ts
export const typeConversionRN: Transform = {
  name: 'typography/convert',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'typography' || token.type === 'typography',
  transform: (token) => {
    const value = findTokenValue(token);
    // fontSize is a mandatory value, so return undefined if the value is invalid,
    // OR if value.fontSize is invalid - to be caught in formatter & action
    if (!isTypographyToken(value, ['fontSize'])) {
      console.error(`Token "${token.name}" is not a valid "fontSize" object.`);
      return undefined;
    }

    const { fontSize, fontWeight, lineHeight, letterSpacing } = value;
    const config: Record<string, string> = {};
    const size = new BigNumber(fontSize);

    if (fontWeight !== undefined || fontWeight !== null) {
      config.fontWeight = fontWeight.toString();
    }

    if (isNumericToken(lineHeight)) {
      config.lineHeight = size.multipliedBy(lineHeight).dp(2).toString();
    }

    if (isNumericToken(letterSpacing)) {
      const spacing = new BigNumber(letterSpacing);
      config.letterSpacing = spacing
        .dividedBy(1000)
        .multipliedBy(size)
        .dp(3)
        .toString();
    }

    return [`${fontSize}`, config];
  }
}

const transforms = [spacingToEm, typeConversion, nativeColorFallback, typeConversionRN];

export default transforms;
