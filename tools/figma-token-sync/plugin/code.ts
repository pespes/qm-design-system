const THEME_ID = 'VariableCollectionId:7903:131';
const PRIMITIVE_ID = 'VariableCollectionId:7902:2';
const COMPONENT_ID = 'VariableCollectionId:10612:8446';

// ------ TYPES ---------
interface AliasValue {
  type: 'VARIABLE_ALIAS';
  aliasName: string;
}

interface ExtractedVariable {
  id: string;
  name: string;
  $type: string;
  collectionName: string;
  $value: VariableValue | AliasValue;
  [key: `$${string}Value`]: VariableValue | AliasValue;
  $description?: string;
}

interface ExtractedTextVariable {
  id: string;
  name: string;
  fontFamily: AliasValue | string;
  fontWeight: AliasValue | number;
  fontSize: AliasValue | number;
  lineHeight: number | string;
  letterSpacing: number | string;
}

interface ExtractedShadowEffect {
  color: AliasValue | RGBA;
  offset: { x: AliasValue | number; y: AliasValue | number };
  radius: AliasValue | number;
  spread: AliasValue | number;
}

interface ExtractedEffectVariable {
  id: string;
  name: string;
  $description?: string;
  effects: ExtractedShadowEffect[];
}

type ExtractedCollection = Pick<VariableCollection, 'id' | 'name' | 'modes'>;

interface ExtractionResult {
  collections: ExtractedCollection[];
  variables: ExtractedVariable[];
  textVariables: ExtractedTextVariable[];
  effectVariables: ExtractedEffectVariable[];
}

interface ExtractionContext {
  variableMap: Map<string, Variable>;
  collectionMap: Map<string, VariableCollection>;
}

// ------- HELPERS --------

// Helper to confirm if value follows expected VariableAlias format: { type: VARIABLE_ALIAS, id:<varId> }
const isVariableAlias = (
  val: VariableValue | undefined,
): val is VariableAlias =>
  typeof val === 'object' &&
  val !== null &&
  (val as { type?: string }).type === 'VARIABLE_ALIAS';

// Helper to retreive primitive value from Variable map - return null (to throw error in ensureVariableValue for variables,
// or force fallback to hardcoded value in text styles) if variable id is not included in Variable map, or the variable
// does not belong to one of the expected collections
const getAliasedVariable = (
  aliasValue: VariableValue | undefined,
  ctx: ExtractionContext,
): Variable | null => {
  if (!isVariableAlias(aliasValue)) {
    return null;
  }

  const aliasedVar = ctx.variableMap.get(aliasValue.id);
  if (!aliasedVar) {
    // warn to allow visibility in logs - any variables will throw error when getAliasedVariable is called in ensureVariableValue().
    // text styles provide a fallback value instead of throwing an error.
    console.warn(
      `Aliased variable ID ${aliasValue.id} not found in variable list`,
    );
    return null;
  }
  if (!ctx.collectionMap.has(aliasedVar.variableCollectionId)) {
    console.warn(`Alias ${aliasedVar.name} belongs to an excluded collection.`);
    return null;
  }
  return aliasedVar;
};

// Variable specific helper (not text stye). Confirm a non-null value, and if a semantic variable, that it
// aliases a valid primitive variable and return original valuel with the primitive's name under aliasName
const ensureVariableValue = (
  val: VariableValue | undefined,
  name: string,
  ctx: ExtractionContext,
): VariableValue | AliasValue => {
  if (val === null || val === undefined) {
    throw new Error(`"${name}" has no value. Update variable before syncing.`);
  }
  if (isVariableAlias(val)) {
    const aliasedVar = getAliasedVariable(val, ctx);
    if (!aliasedVar) {
      throw new Error(
        `"${name}" references an unresolved alias. Update variable binding before syncing.`,
      );
    }
    return { ...val, aliasName: aliasedVar.name };
  }

  return val;
};

// Text / Shadow effect specific helper - called with any boundVariables attached to the textStyle, which are
// guaranteed to return type { field: { type: 'VARIABLE_ALIAS, id: <varId> }}, as referenced in docs
// https://developers.figma.com/docs/plugins/api/TextStyle/ & https://developers.figma.com/docs/plugins/api/Effect/
// If that variable NOT found, use the style's / effect's fallback hardcoded value.
const resolveStyleAlias = (
  val: VariableValue | undefined,
  name: string,
  fallback: string | number | RGBA | undefined,
  ctx: ExtractionContext,
): AliasValue | string | number | RGBA => {
  const resolved = getAliasedVariable(val, ctx);
  if (resolved) {
    return { type: 'VARIABLE_ALIAS', aliasName: resolved.name };
  }
  if (fallback !== undefined) {
    console.warn(
      `"${name} references an unresolved alias. Falling back to hardcoded value: ${JSON.stringify(fallback)} `,
    );
    return fallback;
  }
  throw new Error(
    `"${name}" references an unresolved alias or style is undefined. Update variable binding before syncing.`,
  );
};

const processPercentValue = (
  val: LineHeight | LetterSpacing,
): number | string => {
  // LineHeight / LetterSpacing from Figma API (https://developers.figma.com/docs/plugins/api/TextStyle/)
  // always resolve to { unit: PERCENT | PIXELS | AUTO, value?: number }
  if (val.unit === 'PERCENT' && typeof val.value === 'number') {
    return val.value / 100;
  }
  if (val.unit === 'PIXELS' && typeof val.value === 'number') {
    return val.value;
  }
  if (val.unit === 'AUTO') {
    return 'auto';
  }
  // should never throw - but guard against an unexpected null / undefined
  throw new Error('LineHeight/LetterSpacing must be PERCENT, PX, or AUTO');
};

// Figma API defines weight by fontStyle ('Bold'/'SemiBold'/...), does NOT include a
// fontWeight variable to fallback on and does not allow the inclusion of fontWeight as a
// bound variable. A hack to retrieve the proper value - fontStyle variables are currently
// named by their numbered weight, so pull that from the aliasName (aka fontStyle/600 = weight of 600)
const processFontWeight = (
  val: VariableValue | undefined,
  styleName: string,
  ctx: ExtractionContext,
): number => {
  // No variable bound to fontStyle at all, so no way to determine weight
  if (!isVariableAlias(val)) {
    throw new Error(
      `Text style "${styleName}" has no variable bound to fontStyle - bind a fontStyle variable named fontStyle/<weightNumber>.`,
    );
  }

  // Bound, but the alias does not resolve
  const style = getAliasedVariable(val, ctx);
  if (!style) {
    throw new Error(
      `Text style "${styleName}" binds fontStyle to an unresolved variable (id ${val.id}).`,
    );
  }

  // Resolved, so the name must carry the numeric weight. Weight words
  // ('Regular', 'SemiBold') are not accepted - the name must end in the number.
  const styleSegment = style.name.split('/');
  const weight = Number(styleSegment[styleSegment.length - 1]);
  if (!Number.isInteger(weight)) {
    throw new Error(
      `Text style "${styleName}" binds fontStyle to "${style.name}", which must follow naming convetion "fontStyle/<weight>".`,
    );
  }

  return weight;
};

// ----- BUILD FUNCTIONS -----

const buildCollections = (
  collections: VariableCollection[],
): ExtractedCollection[] =>
  collections.map((coll) => ({
    id: coll.id,
    name: coll.name,
    modes: coll.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
  }));

const buildVariables = (
  varList: Variable[],
  ctx: ExtractionContext,
  modes: { modeId: string; name: string }[],
): ExtractedVariable[] =>
  varList.reduce<ExtractedVariable[]>((acc, v) => {
    const collection = ctx.collectionMap.get(v.variableCollectionId);
    if (!collection) return acc;

    const baseVar = {
      id: v.id,
      name: v.name,
      $type: v.resolvedType,
      collectionName: collection.name,
      ...(v.description && { $description: v.description }),
    };

    if (collection.name === 'Theme') {
      const firstMode = modes[0];
      if (!firstMode) {
        throw new Error('Theme collection must have at least one mode');
      }
      // first mode is default, aka Homeowner
      const defaultValue = ensureVariableValue(
        v.valuesByMode[firstMode.modeId],
        v.name,
        ctx,
      );

      const modeVariables: Record<string, VariableValue | AliasValue> = {};

      // iterate through all possible subsequent modes, added to final output if value does not
      // match that of the default value
      // expected output: mode: { name: 'Pro' } => $proValue: <value>
      modes.slice(1).forEach((mode) => {
        const value = ensureVariableValue(
          v.valuesByMode[mode.modeId],
          v.name,
          ctx,
        );

        const isDifferent =
          typeof defaultValue === 'object' &&
          typeof value === 'object' &&
          (defaultValue as { id?: string }).id !==
            (value as { id?: string }).id;

        if (isDifferent) {
          const modePropName = `$${mode.name.toLowerCase()}Value`;
          modeVariables[modePropName] = value;
        }
      });

      acc.push({
        ...baseVar,
        $value: defaultValue,
        ...modeVariables,
      });
    } else {
      const value = Object.values(v.valuesByMode)[0];
      acc.push({
        ...baseVar,
        $value: ensureVariableValue(value, v.name, ctx),
      });
    }
    return acc;
  }, []);

const buildTextVariables = (textStyles: TextStyle[], ctx: ExtractionContext) =>
  textStyles.reduce<ExtractedTextVariable[]>((acc, t) => {
    if (/^text\//.test(t.name)) {
      const { fontFamily, fontSize, fontStyle } = t.boundVariables ?? {};
      const fontSizeVar = resolveStyleAlias(
        fontSize,
        t.name,
        t.fontSize,
        ctx,
      ) as AliasValue | number;
      const fontFamilyVar = resolveStyleAlias(
        fontFamily,
        t.name,
        t.fontName.family,
        ctx,
      ) as AliasValue | string;

      if (!fontFamilyVar || !fontSizeVar) {
        throw new Error(`Text style "${t.name}" is missing font metadata`);
      }

      // Throws with the specific cause - no fallback weight exists
      const fontWeightVar = processFontWeight(fontStyle, t.name, ctx);

      acc.push({
        id: t.id,
        name: t.name,
        fontFamily: fontFamilyVar,
        fontWeight: fontWeightVar,
        fontSize: fontSizeVar,
        lineHeight: processPercentValue(t.lineHeight),
        letterSpacing: processPercentValue(t.letterSpacing),
      });
    }
    return acc;
  }, []);

// Effect styles named `shadow/*` become the shadow token scale. Only DROP_SHADOW
// layers are taken — inner shadows (which need CSS `inset` and have no React
// Native equivalent) and blurs have no token equivalent — and the layer order is
// preserved, since CSS renders the first layer topmost.

const buildEffectVariables = (
  effectStyles: EffectStyle[],
  ctx: ExtractionContext,
) =>
  effectStyles.reduce<ExtractedEffectVariable[]>((acc, style) => {
    // Only effect styles named `shadow/*` are taken to prevent any unintended additions
    if (!/^shadow\//.test(style.name)) return acc;

    // Nested reduce because a shadow style's "effects" return an array of layers.
    const shadowLayers = style.effects.reduce<ExtractedShadowEffect[]>(
      (effects, layer) => {
        if (layer.type !== 'DROP_SHADOW') return effects;

        const { color, offsetX, offsetY, radius, spread } =
          layer.boundVariables ?? {};

        const resolved = {
          color: resolveStyleAlias(color, style.name, layer.color, ctx),
          offset: {
            x: resolveStyleAlias(offsetX, style.name, layer.offset.x, ctx),
            y: resolveStyleAlias(offsetY, style.name, layer.offset.y, ctx),
          },
          radius: resolveStyleAlias(radius, style.name, layer.radius, ctx),
          spread: resolveStyleAlias(spread, style.name, layer.spread, ctx),
        };

        effects.push(resolved as ExtractedShadowEffect);
        return effects;
      },
      [],
    );

    // Confirm that shadow is indeed a drop shadow - if variable shadow/ effect had type: BLUR,
    // shadowLayers would return an empty array / create an empty token
    if (shadowLayers.length === 0) {
      throw new Error(
        `Effect style "${style.name}" has no shadow layers to extract.`,
      );
    }

    acc.push({
      id: style.id,
      name: style.name,
      ...(style.description ? { $description: style.description } : {}),
      effects: shadowLayers,
    });
    return acc;
  }, []);

// ------- CALLS TO FIGMA PLUGIN API -----
// figma is a global API object injected by the Figma plugin at runtime.
// It's full API can be found at: https://developers.figma.com/docs/plugins/api/figma/

async function extractAll(): Promise<ExtractionResult> {
  const [
    variables,
    semanticColourCollection,
    primitiveCollection,
    componentCollection,
    textStyles,
    effectStyles,
  ] = await Promise.all([
    figma.variables.getLocalVariablesAsync(),
    figma.variables.getVariableCollectionByIdAsync(THEME_ID),
    figma.variables.getVariableCollectionByIdAsync(PRIMITIVE_ID),
    figma.variables.getVariableCollectionByIdAsync(COMPONENT_ID),
    figma.getLocalTextStylesAsync(),
    figma.getLocalEffectStylesAsync(),
  ]);

  const returnedCollections = [
    primitiveCollection,
    semanticColourCollection,
    componentCollection,
  ];
  // API call returns null if VariableCollection not found (does not error out), throw Error to
  // inform that a collection was not found
  if (returnedCollections.some((c) => c === null)) {
    throw new Error(`Not all collections properly retrieved`);
  }

  // certify collections all exist to satisfy Typescript checks
  const filteredCollections = returnedCollections.filter((c) => c !== null);

  // Create maps for easier O(1) lookups
  const collectionMap = new Map<string, VariableCollection>(
    filteredCollections.map((c) => [c.id, c]),
  );
  const variableMap = new Map(variables.map((v) => [v.id, v]));

  // Context holding maps to pass to helper functions
  const ctx: ExtractionContext = { variableMap, collectionMap };

  // Retrieve modes from Theme collection
  const themeModes = collectionMap.get(THEME_ID)?.modes;

  if (!themeModes || themeModes.length === 0) {
    throw new Error('Theme collection has no modes');
  }

  return {
    collections: buildCollections(filteredCollections),
    variables: buildVariables(variables, ctx, themeModes),
    textVariables: buildTextVariables(textStyles, ctx),
    effectVariables: buildEffectVariables(effectStyles, ctx),
  };
}

// Logic connecting Figma's Plugin API with the Plugin's sandboxed environment
figma.showUI(__html__, { width: 400, height: 600 });
figma.ui.onmessage = async (msg: { type: string }): Promise<void> => {
  if (msg.type === 'REQUEST_EXTRACTION') {
    try {
      const extraction = await extractAll();
      figma.ui.postMessage({ type: 'EXTRACTION_READY', extraction });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      figma.ui.postMessage({ type: 'EXTRACTION_ERROR', message });
    }
  }
};
