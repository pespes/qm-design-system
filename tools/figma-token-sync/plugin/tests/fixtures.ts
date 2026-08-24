// ─── Collection IDs (must match the hardcoded IDs in code.ts) ───
export const THEME_ID = 'VariableCollectionId:7903:131';
export const PRIMITIVE_ID = 'VariableCollectionId:7902:2';
export const COMPONENT_ID = 'VariableCollectionId:10612:8446';

// ─── Mode IDs ───
export const HOMEOWNER_MODE_ID = 'mode:homeowner';
export const PRO_MODE_ID = 'mode:pro';

// ─── Minimal type for collections used in tests ───
export interface TestCollection
  extends Pick<VariableCollection, 'id' | 'name' | 'modes'> {
  otherData?: string;
}
export type TestVariable = Pick<
  Variable,
  'id' | 'name' | 'variableCollectionId' | 'description' | 'valuesByMode'
>;

// ─── Collections ───
export const primitiveCollection: TestCollection = {
  id: PRIMITIVE_ID,
  name: 'Primitives',
  modes: [{ modeId: 'mode:default', name: 'Default' }],
  otherData: 'not to be used',
};

export const themeCollection: TestCollection = {
  id: THEME_ID,
  name: 'Theme',
  modes: [
    { modeId: HOMEOWNER_MODE_ID, name: 'Homeowner' },
    { modeId: PRO_MODE_ID, name: 'Pro' },
  ],
  otherData: 'ignore me',
};

export const componentCollection: TestCollection = {
  id: COMPONENT_ID,
  name: 'Components',
  modes: [{ modeId: 'mode:comp-default', name: 'Default' }],
};

// ─── Variables ───
export const primitiveColourVar: TestVariable = {
  id: 'var:prim-colour',
  name: 'color/blue/500',
  variableCollectionId: PRIMITIVE_ID,
  description: 'primary text colour',
  valuesByMode: {
    'mode:default': { r: 0, g: 0.4, b: 1, a: 1 },
  },
};

export const primitiveColourAltVar: TestVariable = {
  id: 'var:prim-colour-alt',
  name: 'color/green/500',
  variableCollectionId: PRIMITIVE_ID,
  description: '',
  valuesByMode: {
    'mode:default': { r: 0, g: 0.8, b: 0.2, a: 1 },
  },
};

export const spacingVar: TestVariable = {
  id: 'var:prim-spacing',
  name: 'spacing/100',
  variableCollectionId: PRIMITIVE_ID,
  description: '',
  valuesByMode: {
    'mode:default': 16,
  },
};

export const fontFamilyVar: TestVariable = {
  id: 'var:font-family-sans',
  name: 'fontFamily/sans',
  variableCollectionId: PRIMITIVE_ID,
  description: '',
  valuesByMode: { 'mode:default': 'Inter' },
};

export const fontSizeVar: TestVariable = {
  id: 'var:font-size-md',
  name: 'fontSize/md',
  variableCollectionId: PRIMITIVE_ID,
  description: '',
  valuesByMode: { 'mode:default': 16 },
};

export const fontWeightVar: TestVariable = {
  id: 'var:font-weight-regular',
  name: 'fontStyle/700',
  variableCollectionId: PRIMITIVE_ID,
  description: '',
  valuesByMode: { 'mode:default': 'Regular' },
};

export const semanticColourVar: TestVariable = {
  id: 'var:sem-colour',
  name: 'semantic/primary',
  variableCollectionId: THEME_ID,
  description: 'Primary brand colour',
  valuesByMode: {
    [HOMEOWNER_MODE_ID]: { type: 'VARIABLE_ALIAS', id: 'var:prim-colour' },
    [PRO_MODE_ID]: { type: 'VARIABLE_ALIAS', id: 'var:prim-colour-alt' },
  },
};

// variable to be filtered out - doesn't belong to a collection
export const orphanVar: TestVariable = {
  id: 'var:orphan',
  name: 'orphan/value',
  variableCollectionId: 'VariableCollectionId:unknown',
  description: '',
  valuesByMode: {
    'mode:x': 42,
  },
};

export const allVariables = [
  primitiveColourVar,
  primitiveColourAltVar,
  spacingVar,
  fontFamilyVar,
  fontSizeVar,
  fontWeightVar,
  semanticColourVar,
  orphanVar,
];

// ─── Text Styles ───
export const textStyleWithBoundVars = {
  id: 'style:text-body-md',
  name: 'text/body/md',
  fontName: { family: 'Inter', style: 'Regular' },
  fontSize: 16,
  lineHeight: { unit: 'PERCENT', value: 150 },
  letterSpacing: { unit: 'PIXELS', value: 0 },
  boundVariables: {
    fontFamily: { type: 'VARIABLE_ALIAS', id: 'var:font-family-sans' },
    fontSize: { type: 'VARIABLE_ALIAS', id: 'var:font-size-md' },
    fontStyle: { type: 'VARIABLE_ALIAS', id: 'var:font-weight-regular' },
  },
};

export const textStyleWithoutBoundVars = {
  id: 'style:text-heading-lg',
  name: 'text/heading/lg',
  fontName: { family: 'Georgia', style: 'Bold' },
  fontSize: 32,
  lineHeight: { unit: 'PERCENT', value: 120 },
  letterSpacing: { unit: 'PIXELS', value: 0.5 },
  boundVariables: {
    fontStyle: { type: 'VARIABLE_ALIAS', id: 'var:font-weight-regular' },
  },
};

// style to be filtered out - does not belong with standard "text/"
export const nonTextStyle = {
  id: 'style:heading-display',
  name: 'heading/display',
  fontName: { family: 'Arial', style: 'Bold' },
  fontSize: 48,
  lineHeight: { unit: 'PERCENT', value: 110 },
  letterSpacing: { unit: 'PIXELS', value: 0 },
  boundVariables: {},
};

export const allTextStyles = [
  textStyleWithBoundVars,
  textStyleWithoutBoundVars,
  nonTextStyle,
];

export const shadowStyle = {
  id: 'style:shadow-base',
  name: 'shadow/100',
  effects: [
    {
      boundVariables: {
        color: { type: 'VARIABLE_ALIAS', id: 'var:prim-colour' },
      },
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 2, y: 4 },
      spread: 0,
      radius: 5,
      type: 'DROP_SHADOW',
    },
    {
      boundVariables: {
        radius: { type: 'VARIABLE_ALIAS', id: 'var:prim-spacing' },
      },
      color: { r: 0, g: 0, b: 0, a: 0.5 },
      offset: { x: 2, y: 8 },
      spread: 0,
      radius: 10,
      type: 'DROP_SHADOW',
    },
  ],
};

// style to be filtered out - does not belong with standard "shadow/"
export const nonShadowStyle = {
  id: 'style:blur',
  name: 'blur/100',
  effects: [
    {
      boundVariables: {},
      color: { r: 0, g: 0, b: 0, a: 0.5 },
      offset: { x: 2, y: 4 },
      spread: 0,
      radius: 10,
      type: 'DROP_SHADOW',
    },
  ],
};

export const allShadowStyles = [shadowStyle, nonShadowStyle];
