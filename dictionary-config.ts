import StyleDictionary from 'style-dictionary';
// import { type Action } from 'style-dictionary/types';
import transforms from './src/dictionary/transforms';
import { cssTransformGroup } from './src/dictionary/transformGroups';
import formats from './src/dictionary/formats';
import { validateTokens } from './src/dictionary/actions'

const HIDDEN_PRIMITIVES = ['tokens/primitives/color.tokens.json', 'tokens/primitives/type.tokens.json'];
const PRIMITIVES = [
  'tokens/primitives/borderWidth.tokens.json',
  'tokens/primitives/breakpoints.tokens.json',
  'tokens/primitives/opacity.tokens.json',
  'tokens/primitives/radius.tokens.json',
  'tokens/primitives/shadow.tokens.json',
  'tokens/primitives/spacing.tokens.json',
  'tokens/primitives/zIndex.tokens.json'
];
const SEMANTICS = ['tokens/semantic/**/*.tokens.json'];

const buildDictionary = async () => {

  // Register custom transforms
  transforms.forEach((t) => {
    StyleDictionary.registerTransform(t);
  })

  // Register transform groups (including built-in & custom transforms)
  StyleDictionary.registerTransformGroup({
    name: 'css/tokens',
    transforms: cssTransformGroup
  });

  // Register formats for each output file
  formats.forEach((f) => {
    StyleDictionary.registerFormat(f);
  })

  StyleDictionary.registerAction(validateTokens);

  // Pass 1: Base tokens → CSS + ReactNative base theme
  const sdDefault = new StyleDictionary({
    usesDtcg: true,
    // Primitive type and colour tokens are in 'include' for reference, not emitted
    include: HIDDEN_PRIMITIVES,
    source: [...PRIMITIVES, ...SEMANTICS],
    platforms: {
      // CSS: Tailwind @theme block
      css: {
        transformGroup: 'css/tokens',
        buildPath: 'dist/css/',
        actions: ['validate_tokens'],
        files: [
          {
            destination: 'tokens.css',
            filter: token => token.isSource,
            format: 'css/tailwind-theme',
          },
        ],
      },
    },
  });

  await sdDefault.buildAllPlatforms();

  const modes = [
    {
      name: 'pro',
      cssSelector: '[data-theme="pro"]',
      rnExportName: 'proThemeOverride',
    },
  ]

  const buildMode = modes.map(async (mode) => {
    const sdMode = new StyleDictionary({
      log: {
        verbosity: 'verbose',
      },
      usesDtcg: true,
      include: [...PRIMITIVES, ...HIDDEN_PRIMITIVES, ...SEMANTICS],
      // Only the mode file is "source" — only these tokens are emitted
      source: [`tokens/modes/${mode.name}.tokens.json`],
      platforms: {
        css: {
          transformGroup: 'css/tokens',
          buildPath: 'dist/css/',
          actions: ['validate_tokens'],
          files: [
            {
              destination: `tokens.${mode.name}.css`,
              format: 'css/override',
              filter: (token) => token.isSource,
              options: { selector: mode.cssSelector },
            },
          ],
        },
      },
    });
    return sdMode.buildAllPlatforms();
  })

  await Promise.all(buildMode);
}
buildDictionary();

