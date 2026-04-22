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

export const rgbaFallback: Transform = {
  name: 'hex-fallback',
  type: 'value',
  filter: (token) => token.$type === 'color' || token.type === 'color',
  transform: (token) => {
    const fallback = token.original.$extensions?.['hex-fallback'];
    return fallback ?? token.$value ?? token.value;
  }
}

// Tailwind RN does not keep fontFamily with the obj, remove
export const typeConversionRN: Transform = {
  name: 'typography/convert',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'typography' || token.type === 'typography',
  transform: (token) => {
    const value = token.$value ?? token.value;
    const { fontSize, fontWeight, lineHeight, letterSpacing } = value;
    
    if (!fontSize) {
      console.warn(`Token "${token.name}" is missing mandatory "fontSize". Skipping transform.`);
      return undefined;
    }

    const config = {} as any;
    if (fontWeight !== undefined || fontWeight !== null) {
      config.fontWeight = `${fontWeight}`;
    }
    if (letterSpacing !== undefined || letterSpacing !== null) {
      const numSpacing = typeof letterSpacing === 'string' ? parseFloat(letterSpacing) : letterSpacing;
      if (!isNaN(numSpacing)) {
        config.letterSpacing = `${(numSpacing / 1000) * parseInt(fontSize)}`;
      }
    }
    if (lineHeight !== undefined || lineHeight !== null) {
      config.lineHeight = `${lineHeight}`;
    }

    return [`${fontSize}`, config];
  }
}

export const shadowConversionRN: Transform = {
  name: 'shadow/clean',
  type: 'value',
  filter: (token) => token.$type === 'shadow' || token.type === 'shadow',
  transform: (token) => {
    const value = token.$value ?? token.value;
    const { offsetX, offsetY, blur, color } = value[0];
    console.log(parseInt(offsetY), offsetY)
     const config = {} as any;
    if (offsetX !== undefined || offsetX !== null || offsetY !== undefined || offsetY !== null) {
      config.shadowOffset = { width: parseInt(offsetX), height: parseInt(offsetY)};
      config.elevation = parseInt(offsetY);
    }
    if (blur !== undefined || blur !== null) {
      config.shadowRadius = parseInt(blur);
    }
    if (color !== undefined || color !== null) {
      config.shadowColor = color;
    }

    return config;
  }
}

const transforms = [spacingToEm, typeConversion, rgbaFallback, typeConversionRN, shadowConversionRN];

export default transforms;
