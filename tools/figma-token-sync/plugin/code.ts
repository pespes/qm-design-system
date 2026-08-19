interface AliasValue {
  type: 'VARIABLE_ALIAS';
  aliasName: string;
}

interface ExtractedVariable {
  id: string;
  name: string;
  collectionName: string;
  $value: VariableValue | AliasValue;
  $proValue?: VariableValue | AliasValue;
  $description?: string;
}

interface ExtractedTextVariable {
  id: string;
  name: string;
  fontFamily: AliasValue | string;
  fontWeight: AliasValue | string;
  fontSize: AliasValue | number;
  lineHeight: number | string;
  letterSpacing: number | string;
}

type ExtractedCollection = Pick<VariableCollection, 'id' | 'name' | 'modes'>;

interface ExtractionResult {
  collections: ExtractedCollection[];
  variables: ExtractedVariable[];
  textVariables: ExtractedTextVariable[];
}

interface ExtractionContext {
  variableMap: Map<string, Variable>;
  collectionMap: Map<string, VariableCollection>;
}

// Helper to confirm if value follows expected VariableAlias format: { type: VARIABLE_ALIAS, id:<varId> }
const isVariableAlias = (
  val: VariableValue | undefined,
): val is VariableAlias =>
  typeof val === 'object' &&
  val !== null &&
  (val as { type?: string }).type === 'VARIABLE_ALIAS';

// Helper to retreive primitive value from Variable map - return null (to throw error in ensureValue for variables,
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
const ensureValue = (
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

// Text specific helper - called with any boundVariables attached to the textStyle, which are guaranteed
// to return type { field: { type: 'VARIABLE_ALIAS, id: <varId> }}, as referenced in docs
// https://developers.figma.com/docs/plugins/api/TextStyle/
// If that variable NOT found, use the TextStyle's fallback hardcoded value for fontFamily/fontSize/fontWeight
const resolveAlias = (
  val: VariableValue | undefined,
  name: string,
  fallback: string | number | undefined,
  ctx: ExtractionContext,
): AliasValue | string | number => {
  const resolved = getAliasedVariable(val, ctx);
  if (resolved) {
    return { type: 'VARIABLE_ALIAS', aliasName: resolved.name };
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(
    `"${name}" references an unresolved alias. Update variable binding before syncing.`,
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

async function extractAll(): Promise<ExtractionResult> {
  const THEME_ID = 'VariableCollectionId:7903:131';
  const PRIMITIVE_ID = 'VariableCollectionId:7902:2';
  const COMPONENT_ID = 'VariableCollectionId:10612:8446';
  const [
    variables,
    semanticColourCollection,
    primitiveCollection,
    componentCollection,
    textStyles,
  ] = await Promise.all([
    figma.variables.getLocalVariablesAsync(),
    figma.variables.getVariableCollectionByIdAsync(THEME_ID),
    figma.variables.getVariableCollectionByIdAsync(PRIMITIVE_ID),
    figma.variables.getVariableCollectionByIdAsync(COMPONENT_ID),
    figma.getLocalTextStylesAsync(),
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

  // Retrieve homeowner / pro mode id, which are keys in a returned Variable 'valuesByMode' value
  const themeModes = collectionMap.get(THEME_ID)?.modes;
  const modeMap = new Map(themeModes?.map((m) => [m.name, m.modeId]));
  const homeownerModeId = modeMap.get('Homeowner');
  const proModeId = modeMap.get('Pro');

  // For Theme collection, both modes are required
  if (!homeownerModeId || !proModeId) {
    throw new Error('Could not find both Homeowner/Pro modes in collection');
  }

  return {
    collections: filteredCollections.map((coll) => ({
      id: coll.id,
      name: coll.name,
      modes: coll.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
    })),
    variables: variables.reduce<ExtractedVariable[]>((acc, v) => {
      const collection = collectionMap.get(v.variableCollectionId);
      if (!collection) return acc;

      const baseVar = {
        id: v.id,
        name: v.name,
        collectionName: collection.name,
        ...(v.description && { $description: v.description }),
      };

      if (collection.name === 'Theme') {
        const homeownerValue = ensureValue(
          v.valuesByMode[homeownerModeId],
          v.name,
          ctx,
        );
        const proValue = ensureValue(v.valuesByMode[proModeId], v.name, ctx);

        const includeProValue =
          typeof homeownerValue === 'object' &&
          typeof proValue === 'object' &&
          (homeownerValue as { id?: string }).id !==
            (proValue as { id?: string }).id;

        acc.push({
          ...baseVar,
          $value: homeownerValue,
          ...(includeProValue && { $proValue: proValue }),
        });
      } else {
        const value = Object.values(v.valuesByMode)[0];
        acc.push({
          ...baseVar,
          $value: ensureValue(value, v.name, ctx),
        });
      }
      return acc;
    }, []),
    textVariables: textStyles.reduce<ExtractedTextVariable[]>((acc, t) => {
      if (/^text\//.test(t.name)) {
        const { fontFamily, fontSize, fontStyle } = t.boundVariables ?? {};
        const fontSizeVar = resolveAlias(fontSize, t.name, t.fontSize, ctx) as
          | AliasValue
          | number;
        const fontFamilyVar = resolveAlias(
          fontFamily,
          t.name,
          t.fontName.family,
          ctx,
        ) as AliasValue | string;
        const fontWeightVar = resolveAlias(
          fontStyle,
          t.name,
          t.fontName.style,
          ctx,
        ) as AliasValue | string;

        if (!fontFamilyVar || !fontSizeVar || !fontWeightVar) {
          throw new Error(`Text style "${t.name}" is missing font metadata`);
        }

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
    }, []),
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
