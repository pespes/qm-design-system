import { type Transform } from 'style-dictionary/types';

const dimensions = [
  'spacing',
  'radius',
  'borderWidth',
  'fontSize',
  'breakpoint',
];

// unitless integer px → rem string (CSS / Tailwind output)
export const spacingToRem: Transform = {
  name: 'spacing/rem',
  type: 'value',
  filter: (token) => dimensions.includes(token.path[0] ?? ''),
  transform: (token) => {
    const val = token.$value ?? token.value;
    if (val === null || val === undefined || typeof val !== 'number') {
      return val;
    }
    return `${val / 16}rem`;
  },
};

// unitless integer em → em string (CSS / Tailwind output)
export const spacingToEm: Transform = {
  name: 'spacing/em',
  type: 'value',
  filter: (token) => token.path[0] === 'letterSpacing',
  transform: (token) => {
    const val = token.$value ?? token.value;
    if (val === null || val === undefined || typeof val !== 'number') {
      return val;
    }
    return `${val / 1000}em`;
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
    const val = token.$value ?? token.value;
    if (!val || typeof val !== 'object' || Array.isArray(val)) {
      return val;
    }
    const { letterSpacing, ...fontConfig } = val;
    return fontConfig;
  }
}

const transforms = [spacingToRem, spacingToEm, typeConversion];

export default transforms;