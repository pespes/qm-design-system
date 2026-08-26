import type { Classification, TokenExposure } from './types.js';

// Define how variables in Figma collection are classified
export const COLLECTION_CLASSIFICATION: Record<string, Classification> = {
  primitives: 'primitive',
  theme: 'semantic',
  component: 'semantic',
};

// Figma variables that are inluded in a Figma Text Style / outputted DTCG Typography Token
// All these should live in the 'type' classification
export const TYPOGRAPHY_STYLES = [
  'fontfamily',
  'fontweight',
  'fontsize',
  'lineheight',
  'letterspacing',
  'fontstyle',
];

const ALL_PLATFORMS: TokenExposure['platforms'] = ['css', 'native'];

// Map to define if variables should be included in the finalized output by Style Dictionary, and
// in which platforms they should be included.
// **NOTE** Figma does not provide a Native-friendly shadow style, with properties such as elevation.
// Given that there is no consistency between the Figma shadow styles and shadowNative.tokens.json file,
// only output shadow styles to 'css', and have the native config pull in shadowNative.tokens.json
export const GROUP_MANIFEST: Record<
  string,
  Partial<Record<Classification, TokenExposure>>
> = {
  color: {
    primitive: { emit: false, platforms: ALL_PLATFORMS },
    semantic: { emit: true, platforms: ALL_PLATFORMS },
  },
  type: {
    primitive: { emit: false, platforms: ALL_PLATFORMS },
    semantic: { emit: true, platforms: ALL_PLATFORMS },
  },
  spacing: { primitive: { emit: true, platforms: ALL_PLATFORMS } },
  radius: { primitive: { emit: true, platforms: ALL_PLATFORMS } },
  borderwidth: { primitive: { emit: true, platforms: ALL_PLATFORMS } },
  opacity: { primitive: { emit: true, platforms: ALL_PLATFORMS } },
  zindex: { primitive: { emit: true, platforms: ALL_PLATFORMS } },
  breakpoints: { primitive: { emit: true, platforms: ALL_PLATFORMS } },
  shadow: { primitive: { emit: true, platforms: ['css'] } },
};

export const FALLBACK_EXPOSURE: TokenExposure = {
  emit: true,
  platforms: ALL_PLATFORMS,
};
