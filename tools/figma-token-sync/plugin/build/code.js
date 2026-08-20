"use strict";
const THEME_ID = 'VariableCollectionId:7903:131';
const PRIMITIVE_ID = 'VariableCollectionId:7902:2';
const COMPONENT_ID = 'VariableCollectionId:10612:8446';
// ------- HELPERS --------
// Helper to confirm if value follows expected VariableAlias format: { type: VARIABLE_ALIAS, id:<varId> }
const isVariableAlias = (val) => typeof val === 'object' &&
    val !== null &&
    val.type === 'VARIABLE_ALIAS';
// Helper to retreive primitive value from Variable map - return null (to throw error in ensureVariableValue for variables,
// or force fallback to hardcoded value in text styles) if variable id is not included in Variable map, or the variable
// does not belong to one of the expected collections
const getAliasedVariable = (aliasValue, ctx) => {
    if (!isVariableAlias(aliasValue)) {
        return null;
    }
    const aliasedVar = ctx.variableMap.get(aliasValue.id);
    if (!aliasedVar) {
        // warn to allow visibility in logs - any variables will throw error when getAliasedVariable is called in ensureVariableValue().
        // text styles provide a fallback value instead of throwing an error.
        console.warn(`Aliased variable ID ${aliasValue.id} not found in variable list`);
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
const ensureVariableValue = (val, name, ctx) => {
    if (val === null || val === undefined) {
        throw new Error(`"${name}" has no value. Update variable before syncing.`);
    }
    if (isVariableAlias(val)) {
        const aliasedVar = getAliasedVariable(val, ctx);
        if (!aliasedVar) {
            throw new Error(`"${name}" references an unresolved alias. Update variable binding before syncing.`);
        }
        return { ...val, aliasName: aliasedVar.name };
    }
    return val;
};
// Text specific helper - called with any boundVariables attached to the textStyle, which are guaranteed
// to return type { field: { type: 'VARIABLE_ALIAS, id: <varId> }}, as referenced in docs
// https://developers.figma.com/docs/plugins/api/TextStyle/
// If that variable NOT found, use the TextStyle's fallback hardcoded value for fontFamily/fontSize/fontWeight
const resolveStyleAlias = (val, name, fallback, ctx) => {
    const resolved = getAliasedVariable(val, ctx);
    if (resolved) {
        return { type: 'VARIABLE_ALIAS', aliasName: resolved.name };
    }
    if (fallback !== undefined) {
        console.warn(`"${name} references an unresolved alias. Falling back to hardcoded value: ${fallback} `);
        return fallback;
    }
    throw new Error(`"${name}" references an unresolved alias. Update variable binding before syncing.`);
};
const processPercentValue = (val) => {
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
// ----- BUILD FUNCTIONS -----
const buildCollections = (collections) => collections.map((coll) => ({
    id: coll.id,
    name: coll.name,
    modes: coll.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
}));
const buildVariables = (varList, ctx, modes) => varList.reduce((acc, v) => {
    const collection = ctx.collectionMap.get(v.variableCollectionId);
    if (!collection)
        return acc;
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
        const defaultValue = ensureVariableValue(v.valuesByMode[firstMode.modeId], v.name, ctx);
        const modeVariables = {};
        // iterate through all possible subsequent modes, added to final output if value does not
        // match that of the default value
        // expected output: mode: { name: 'Pro' } => $proValue: <value>
        modes.slice(1).forEach((mode) => {
            const value = ensureVariableValue(v.valuesByMode[mode.modeId], v.name, ctx);
            const isDifferent = typeof defaultValue === 'object' &&
                typeof value === 'object' &&
                defaultValue.id !==
                    value.id;
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
    }
    else {
        const value = Object.values(v.valuesByMode)[0];
        acc.push({
            ...baseVar,
            $value: ensureVariableValue(value, v.name, ctx),
        });
    }
    return acc;
}, []);
const buildTextVariables = (textStyles, ctx) => textStyles.reduce((acc, t) => {
    if (/^text\//.test(t.name)) {
        const { fontFamily, fontSize, fontStyle } = t.boundVariables ?? {};
        const fontSizeVar = resolveStyleAlias(fontSize, t.name, t.fontSize, ctx);
        const fontFamilyVar = resolveStyleAlias(fontFamily, t.name, t.fontName.family, ctx);
        const fontWeightVar = resolveStyleAlias(fontStyle, t.name, t.fontName.style, ctx);
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
}, []);
// ------- CALLS TO FIGMA PLUGIN API -----
// figma is a global API object injected by the Figma plugin at runtime.
// It's full API can be found at: https://developers.figma.com/docs/plugins/api/figma/
async function extractAll() {
    const [variables, semanticColourCollection, primitiveCollection, componentCollection, textStyles,] = await Promise.all([
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
    const collectionMap = new Map(filteredCollections.map((c) => [c.id, c]));
    const variableMap = new Map(variables.map((v) => [v.id, v]));
    // Context holding maps to pass to helper functions
    const ctx = { variableMap, collectionMap };
    // Retrieve modes from Theme collection
    const themeModes = collectionMap.get(THEME_ID)?.modes;
    if (!themeModes || themeModes.length === 0) {
        throw new Error('Theme collection has no modes');
    }
    return {
        collections: buildCollections(filteredCollections),
        variables: buildVariables(variables, ctx, themeModes),
        textVariables: buildTextVariables(textStyles, ctx),
    };
}
// Logic connecting Figma's Plugin API with the Plugin's sandboxed environment
figma.showUI(__html__, { width: 400, height: 600 });
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'REQUEST_EXTRACTION') {
        try {
            const extraction = await extractAll();
            figma.ui.postMessage({ type: 'EXTRACTION_READY', extraction });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            figma.ui.postMessage({ type: 'EXTRACTION_ERROR', message });
        }
    }
};
