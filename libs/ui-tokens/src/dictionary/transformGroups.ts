import StyleDictionary from 'style-dictionary';

// This comes from StyleDictionary's recommended transformGroup for css:
// https://styledictionary.com/reference/hooks/transform-groups/predefined/#css
const cssBuiltins = StyleDictionary.hooks.transformGroups.css ?? [];

// Exclude built-in size/rem in favour of 'size/pxToRem'
// Exclude 'color/css' in favour of leaving values as rgba
// Remove letterSpacing from typography object first, then apply typography/css/shorthand to
// build css 'font' property
export const cssTransformGroup = {
  name: 'css/tokens',
  transforms: [
    ...cssBuiltins.filter(
      (t) =>
        t !== 'size/rem' &&
        t !== 'typography/css/shorthand' &&
        t !== 'color/css',
    ),
    'size/pxToRem',
    'spacing/em',
    'typography/clean',
  ],
};

export const nativeTransformGroup = {
  name: 'json/tokens',
  transforms: ['attribute/cti', 'name/kebab', 'size/px', 'typography/convert'],
};

const groups = [cssTransformGroup, nativeTransformGroup];
export default groups;
