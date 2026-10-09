// -------- Figma Export Types ---------
export interface FigmaRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaAlias {
  type: 'VARIABLE_ALIAS';
  id?: string;
  aliasName: string;
}

// A colour alias with its own opacity (0–100), e.g. state/disabled = color/black at 38%.
// The plugin exports the alias by id only (no aliasName).
export interface FigmaAliasWithOpacity {
  color: { type: 'VARIABLE_ALIAS'; id: string };
  opacity: number;
}

export type FigmaVariableValue =
  | FigmaAlias
  | FigmaAliasWithOpacity
  | FigmaRgba
  | string
  | number;

export interface FigmaVariable {
  id: string;
  name: string;
  $type: string;
  collectionName: string;
  $value: FigmaVariableValue;
  [key: string]: FigmaVariableValue;
  $description?: string;
}

export interface FigmaTextVariable {
  id: string;
  name: string;
  fontFamily: FigmaAlias | string;
  fontWeight: FigmaAlias | number;
  fontSize: FigmaAlias | number;
  lineHeight: FigmaAlias | number;
  letterSpacing: FigmaAlias | number;
}

export interface FigmaShadowEffect {
  color: FigmaRgba;
  offsetX: number;
  offsetY: number;
  radius: number;
  spread: number;
}

export interface FigmaEffectVariable {
  id: string;
  name: string;
  $description?: string;
  effects: FigmaShadowEffect[];
}

export interface FigmaCollection {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
}

export interface FigmaExport {
  exportedAt: string;
  collections: FigmaCollection[];
  variables: FigmaVariable[];
  textVariables: FigmaTextVariable[];
  effectVariables?: FigmaEffectVariable[];
}

// -------- Token Tree Types ---------

export const EXPOSURE_KEY = 'exposure';

export type Platform = 'css' | 'native';
export type Classification = 'primitive' | 'semantic';

// For Style Dictionary to determine if the value should be exposed or just used
// as a reference for semantic tokens
export interface TokenExposure {
  emit: boolean;
  platforms: Platform[];
  mode?: string;
}

export interface TokenTypography {
  fontFamily: string;
  fontSize: string | number;
  fontWeight: string | number;
  lineHeight: string | number;
  letterSpacing: string | number;
}

export interface TokenShadowLayer {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
}

export interface DtcgToken {
  $description?: string;
  $type?: string;
  $value: string | number | TokenTypography | TokenShadowLayer[];
  $extensions?: { [EXPOSURE_KEY]?: TokenExposure };
}

export type TokenTree = {
  [key: string]: TokenTree | DtcgToken;
};

// Base / "homeowner" tree plus one tree per theme mode
export interface DtcgTrees {
  base: TokenTree;
  modes: Record<string, TokenTree>;
}
