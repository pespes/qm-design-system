import {
  EXPOSURE_KEY,
  type Classification,
  type DtcgToken,
  type DtcgTrees,
  type FigmaAlias,
  type FigmaEffectVariable,
  type FigmaExport,
  type FigmaRgba,
  type FigmaVariable,
  type FigmaVariableValue,
  type TokenExposure,
  type TokenShadowLayer,
  type TokenTree,
  type TokenTypography,
} from './types.js';
import {
  GROUP_MANIFEST,
  FALLBACK_EXPOSURE,
  TYPOGRAPHY_STYLES,
} from './token-manifest.js';

// ---------- Typecheck Helpers ----------

// convert value is of type { type: 'VARIABLE_ALIAS, aliasName: string }
const isAlias = (v: FigmaVariableValue): v is FigmaAlias =>
  typeof v === 'object' &&
  'type' in v &&
  v.type === 'VARIABLE_ALIAS' &&
  'aliasName' in v;

const isTokenTree = (v: unknown): v is TokenTree =>
  typeof v === 'object' && v !== null && !('$value' in v);

// ---------- Conversion Helpers ----------

const toPx = (n: number) => `${n}px`;

// convert object { r, g, b, a} --> 'rgba(r,g,b,a)'
const normalizeToRgbaStr = ({ r, g, b, a }: FigmaRgba) => {
  const r255 = Math.round(r * 255);
  const g255 = Math.round(g * 255);
  const b255 = Math.round(b * 255);
  const alpha = Number.parseFloat(a.toFixed(2));

  return `rgba(${r255}, ${g255}, ${b255}, ${alpha})`;
};

// convert aliasName 'x/y/z' --> '{x.y.z}'
export const aliasToRef = (aliasName: string, isColor = false): string => {
  const segments = aliasName.split('/');
  const refName = segments.join('.');
  const finalRef =
    isColor && !refName.startsWith('color.') ? `color.${refName}` : refName;
  return `{${finalRef}}`;
};

// For typography: if Alias value, convert name - otherwise return raw value
const convertTypographyProp = (
  prop: FigmaAlias | string | number,
): string | number => {
  return isAlias(prop) ? aliasToRef(prop.aliasName) : prop;
};

// For shadows, append 'px' to values and update rgba object to string for
// "shadow/css/shorthand" transform in Style Dictionary to process correctly
// https://styledictionary.com/reference/hooks/transforms/predefined/#shadowcssshorthand
export const convertShadowEffects = (
  effects: FigmaEffectVariable['effects'],
): TokenShadowLayer[] =>
  effects.map((effect) => ({
    offsetX: toPx(effect.offsetX),
    offsetY: toPx(effect.offsetY),
    blur: toPx(effect.radius),
    spread: toPx(effect.spread),
    color: normalizeToRgbaStr(effect.color),
  }));

// ---------- Token Creation Helpers ----------

const TYPE_MAP: Record<string, string> = {
  color: 'color',
  spacing: 'dimension',
  radius: 'dimension',
  borderwidth: 'dimension',
  fontsize: 'dimension',
  lineheight: 'number',
  letterspacing: 'number',
  fontfamily: 'fontFamily',
  fontweight: 'fontWeight',
  fontstyle: 'string',
  opacity: 'number',
  zindex: 'number',
  breakpoints: 'dimension',
  shadow: 'shadow',
};

// Helper to determine DTCG type for Style Dictionary to consume
export const inferType = (group: string, variable: FigmaVariable): string => {
  if (TYPE_MAP[group]) return TYPE_MAP[group];

  // Otherwise, check if an alias' group name maps to the type map
  if (isAlias(variable.$value)) {
    const aliasGroup = variable.$value.aliasName.split('/')[0]?.toLowerCase();
    if (aliasGroup && TYPE_MAP[aliasGroup]) return TYPE_MAP[aliasGroup];
  }

  // Fallback to Figma's inferred type (COLOR, FLOAT, STRING)
  const figmaType = variable.$type.toLowerCase();
  if (figmaType === 'float') return 'dimension';

  return figmaType;
};

//  ---------- Tree Building Helpers ----------

// Helper to resolve variable's "group" to define exposure in Style Dictionary output
export const resolveGroupExposure = (
  group: string,
  classification: Classification,
  isComponentCollection = false,
): TokenExposure => {
  // The "Component" collection contains a variety of values, so cannot type them to specific
  // group in manifest - return fallback exposure of { emit: true, platforms: ['native', 'css']}
  if (isComponentCollection) {
    return FALLBACK_EXPOSURE;
  }

  // Map token's group name + classification (ie. color.semantic, spacing.primitive)
  const groupExposure = GROUP_MANIFEST[group]?.[classification];
  if (groupExposure) return groupExposure;

  // Otherwise, check if group is part of typography-related tokens (fontSize, lineHeight, …), which all live under `type`
  if (TYPOGRAPHY_STYLES.includes(group)) {
    const typeExposure = GROUP_MANIFEST['type']?.[classification];
    if (typeExposure) return typeExposure;
  }

  // Otherwise, orphaned variable that would not write to any file - throw Error
  throw new Error(
    `No found group for "${group}" (classification "${classification}")`,
  );
};

// Set a value in an object, creating intermediate objects if needed
export const setNested = (
  obj: TokenTree,
  path: string[],
  value: DtcgToken,
): void => {
  const lastIdx = path.length - 1;
  if (lastIdx < 0) throw new Error('Empty path: variable has no name segments');

  // Every segment - including the last - must be a usable object key
  if (path.some((segment) => !segment)) {
    throw new Error(`Empty segment in path: ${path}`);
  }

  let current = obj;
  for (let i = 0; i < lastIdx; i++) {
    const key = path[i] as string;

    // Create or navigate through intermediate objects
    if (current[key] === undefined) {
      current[key] = {};
    } else if (!isTokenTree(current[key])) {
      // A token already sits here - nesting under it would silently drop it
      throw new Error(
        `Path collision: "${path.join('/')}" nests under existing token "${path.slice(0, i + 1).join('/')}"`,
      );
    }
    current = current[key] as TokenTree;
  }

  // Set final value
  const lastKey = path.at(-1) as string;
  if (isTokenTree(current[lastKey])) {
    throw new Error(
      `Path collision: token "${path.join('/')}" would replace an existing token group`,
    );
  }
  current[lastKey] = value;
};

// ---------- Finalized Build Function ----------

// Transform raw Figma plugin export into DTCG token trees.
export const buildDtcgTrees = (parsedFile: FigmaExport): DtcgTrees => {
  const base: TokenTree = {};
  const modes: Record<string, TokenTree> = {};

  // ---------- Process Text Styles ----------
  const typographyExposure = resolveGroupExposure('type', 'semantic');
  for (const tv of parsedFile.textVariables) {
    const typographyValue: TokenTypography = {
      fontFamily: convertTypographyProp(tv.fontFamily) as string,
      fontWeight: convertTypographyProp(tv.fontWeight),
      fontSize: convertTypographyProp(tv.fontSize),
      lineHeight: convertTypographyProp(tv.lineHeight),
      letterSpacing: convertTypographyProp(tv.letterSpacing),
    };

    setNested(base, tv.name.split('/'), {
      $type: 'typography',
      $value: typographyValue,
      $extensions: { [EXPOSURE_KEY]: typographyExposure },
    });
  }

  // ---------- Process Effect Styles ----------
  const shadowExposure = resolveGroupExposure('shadow', 'primitive');
  for (const ev of parsedFile.effectVariables ?? []) {
    const token: DtcgToken = {
      $type: 'shadow',
      $value: convertShadowEffects(ev.effects),
      $extensions: { [EXPOSURE_KEY]: shadowExposure },
    };
    if (ev.$description) token.$description = ev.$description;

    setNested(base, ev.name.split('/'), token);
  }

  return { base, modes };
};
