import { get, mergeWith } from 'lodash-es';
import type { TransformedToken } from 'style-dictionary/types';
import { FALLBACK_EXPOSURE } from '../build-tree/token-manifest.js';
import { EXPOSURE_KEY } from '../build-tree/types.js';
import type {
  TokenTree,
  TokenExposure,
  DtcgToken,
} from '../build-tree/types.js';

type modeType = {
  name: string;
  cssSelector: string;
  rnExportName: string;
};

// Exposure should live under $extensions, but can be moved under $original during token processing -
// add backup just in case
export const getExposure = (token: TransformedToken): TokenExposure =>
  get(token, ['$extensions', EXPOSURE_KEY]) ??
  get(token, ['original', '$extensions', EXPOSURE_KEY]) ??
  FALLBACK_EXPOSURE;

// Whether a token should be written in output for given platform
export const shouldEmit = (
  token: TransformedToken,
  platform: TokenExposure['platforms'][number],
): boolean => {
  const exposure = getExposure(token);
  if (exposure.platforms === null || exposure.platforms === undefined) {
    throw new Error(`Token "${token.name}" is missing platforms array`);
  }
  return exposure.emit && exposure.platforms.includes(platform);
};

const isToken = (v: TokenTree | DtcgToken): v is DtcgToken => '$value' in v;

// Merge a mode's (aka "pro") token tree onto base tree to produce new tree of merged
// values. This merged tree is passed each time the Style Dictionary pipeline runs for
// a given mode to discern which tokens are included
const mergeTokenTrees = (base: TokenTree, override: TokenTree): TokenTree => {
  return mergeWith({}, base, override, (baseVal, overrideVal) => {
    if (isToken(overrideVal)) {
      return overrideVal; // replace entire token instead of merging to remove stale properties
    }
  });
};

// Mode builds need the full set of tokens (excluding overridden default values)
// in order for semantic tokens to resolve references to primitive tokens.
// If not a mode, return the base / default token values
export const tokensFor = (
  base: TokenTree,
  modeTrees: Record<string, TokenTree>,
  mode?: modeType,
): TokenTree => {
  if (!mode) return base;
  const overrides = modeTrees[mode.name];
  if (!overrides) {
    throw new Error(
      `No mode overrides found for "${mode.name}" in the Figma export`,
    );
  }
  return mergeTokenTrees(base, overrides);
};
