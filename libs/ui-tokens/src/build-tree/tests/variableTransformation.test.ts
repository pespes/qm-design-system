import { describe, it, beforeEach, expect } from 'vitest';
import type {
  FigmaExport,
  TokenTree,
  FigmaTextVariable,
  FigmaEffectVariable,
  TokenTypography,
  TokenShadowLayer,
} from '../types.js';
import { buildDtcgTrees } from '../buildTokenTree.js';
import { build, getToken } from './tokenTestHelpers.js';
import { basicFixture } from './fixture.js';

describe('Token value transformation', () => {
  describe('Primitives', () => {
    describe('Color primitives', () => {
      let colorTree: TokenTree;

      beforeEach(() => {
        const trees = buildDtcgTrees(basicFixture);
        colorTree = trees.base['color'] as TokenTree;
      });

      it('should convert RGBA object to rgba() string with hex fallback', () => {
        const whiteToken = getToken(colorTree, 'white');
        expect(whiteToken.$value).toBe('rgba(255, 255, 255, 1)');
      });

      it('should handle semi-transparent colors', () => {
        const greenToken = getToken(colorTree, 'green/600');
        expect(greenToken.$value).toBe('rgba(0, 120, 13, 0.5)');
      });

      it('should render $type: "color"', () => {
        const whiteToken = getToken(colorTree, 'white');
        expect(whiteToken.$type).toBe('color');
      });
    });

    describe('Numeric primitives (spacing, etc)', () => {
      let baseTree: TokenTree;
      beforeEach(() => {
        const trees = buildDtcgTrees(basicFixture);
        baseTree = trees.base;
      });

      it('should pass numeric values through', () => {
        const spacingToken = getToken(baseTree, 'spacing/100');
        expect(spacingToken.$value).toBe(4);
      });

      it('should correctly assign "dimension" or "number" $type', () => {
        const spacingToken = getToken(baseTree, 'spacing/100');
        expect(spacingToken.$type).toBe('dimension');

        const fontSizeToken = getToken(baseTree, 'fontSize/400');
        expect(fontSizeToken.$type).toBe('dimension');

        const opacityToken = getToken(baseTree, 'opacity/100');
        expect(opacityToken.$type).toBe('number');
      });
    });
  });
});

describe('Semantic Color variables', () => {
  let baseTree: TokenTree;

  beforeEach(() => {
    const trees = buildDtcgTrees(basicFixture);
    baseTree = trees.base;
  });

  it('should convert alias names to reference syntax', () => {
    const surfaceToken = getToken(baseTree, 'color/surface/page');
    expect(surfaceToken.$value).toBe('{color.white}');
    expect(surfaceToken.$type).toBe('color');
  });

  it('should prefix semantic color aliases with color', () => {
    const successToken = getToken(baseTree, 'color/success/background');
    expect(successToken.$value).toBe('{color.brand.background}');
  });

  describe('Aliases with opacity', () => {
    const stateDisabled = {
      id: 'var:state:disabled',
      name: 'state/disabled',
      $type: 'COLOR',
      collectionName: 'Theme',
      $value: {
        color: { type: 'VARIABLE_ALIAS', id: 'var:white' },
        opacity: 38,
      },
    } as const;

    it('should resolve the alias and apply the opacity as an rgba() string', () => {
      const trees = build(stateDisabled)();
      expect(getToken(trees.base, 'color/state/disabled').$value).toBe(
        'rgba(255, 255, 255, 0.38)',
      );
    });

    it('should multiply the opacity with an already transparent primitive', () => {
      const trees = build({
        ...stateDisabled,
        $value: {
          color: { type: 'VARIABLE_ALIAS', id: 'var:green-transparent' },
          opacity: 50,
        },
      })();
      expect(getToken(trees.base, 'color/state/disabled').$value).toBe(
        'rgba(0, 120, 13, 0.25)',
      );
    });

    it('should resolve theme mode values', () => {
      const trees = build({
        ...stateDisabled,
        $proValue: {
          color: { type: 'VARIABLE_ALIAS', id: 'var:blue' },
          opacity: 38,
        },
      })();
      const proTree = trees.modes['pro'] as TokenTree;
      expect(getToken(proTree, 'color/state/disabled').$value).toBe(
        'rgba(33, 84, 204, 0.38)',
      );
    });

    it('should throw when the aliased variable is missing', () => {
      expect(
        build({
          ...stateDisabled,
          $value: {
            color: { type: 'VARIABLE_ALIAS', id: 'var:missing' },
            opacity: 38,
          },
        }),
      ).toThrow('"state/disabled" has a colour alias that cannot be resolved');
    });
  });

  describe('Theme Modes', () => {
    it('should render any $proValue into modes.pro tree', () => {
      const trees = buildDtcgTrees(basicFixture);
      const proTree = trees.modes['pro'] as TokenTree;

      expect(getToken(proTree, 'color/brand/background').$value).toBe(
        '{color.blue.600}',
      );
      const proColorSubTree = proTree['color'] as TokenTree | undefined;
      expect(proColorSubTree?.['surface']).toBeUndefined();
    });

    it('should create tree for each theme mode except Homeowner', () => {
      const withDarkMode: FigmaExport = {
        ...basicFixture,
        collections: basicFixture.collections.map((coll) =>
          coll.name === 'Theme'
            ? {
                ...coll,
                modes: [...coll.modes, { modeId: '7903:3', name: 'Dark' }],
              }
            : coll,
        ),
        variables: basicFixture.variables.map((variable) =>
          variable.name === 'surface/page'
            ? {
                ...variable,
                $darkValue: {
                  type: 'VARIABLE_ALIAS',
                  aliasName: 'color/green/600',
                },
              }
            : variable,
        ),
      };

      const darkTreeMap = buildDtcgTrees(withDarkMode);
      const darkTree = darkTreeMap.modes['dark'] as TokenTree;

      expect(darkTree).toBeDefined();
      expect(getToken(darkTree, 'color/surface/page').$value).toBe(
        '{color.green.600}',
      );
    });

    it('should filter out Homeowner mode', () => {
      const trees = buildDtcgTrees(basicFixture);
      expect(trees.modes['homeowner']).toBeUndefined();
    });
  });
});

describe('Text variables', () => {
  let baseTree: TokenTree;

  beforeEach(() => {
    const trees = buildDtcgTrees(basicFixture);
    baseTree = trees.base;
  });

  it('should create typography token with all required properties', () => {
    const typeToken = getToken(baseTree, 'text/header/h1');
    expect(typeToken.$type).toBe('typography');
    expect(typeToken.$value).toEqual({
      fontFamily: '{fontFamily.sans}',
      fontWeight: 700,
      fontSize: '{fontSize.400}',
      lineHeight: 1.25,
      letterSpacing: 0,
    });
    expect(typeToken.$extensions).toEqual({
      exposure: { emit: true, platforms: ['css', 'native'] },
    });
  });

  it('should convert aliased font properties to references', () => {
    const typeToken = getToken(baseTree, 'text/header/h1');
    const value = typeToken.$value as TokenTypography;
    expect(value.fontFamily).toBe('{fontFamily.sans}');
    expect(value.fontSize).toBe('{fontSize.400}');
  });

  it('should pass through raw font properties', () => {
    const typeToken = getToken(baseTree, 'text/header/h1');
    const value = typeToken.$value as TokenTypography;
    expect(value.fontWeight).toBe(700);
    expect(value.lineHeight).toBe(1.25);
    expect(value.letterSpacing).toBe(0);
  });

  it('should handle text variables with all raw values (no aliases)', () => {
    const typeToken = getToken(baseTree, 'body/regular');
    expect(typeToken.$value).toEqual({
      fontFamily: 'DM Sans',
      fontWeight: 400,
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0,
    });
  });

  it('should throw when a text variable has an invalid value', () => {
    const invalidName = {
      id: 'text:missing-name',
      name: undefined,
      fontFamily: 'DM Sans',
      fontWeight: 400,
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0,
    } as unknown as FigmaTextVariable;
    expect(build(invalidName, 'text')).toThrow();
  });

  it('should use the "type" group fallback for typography groups', () => {
    const fallbackGroupVar = {
      id: `var:spacing:lg`,
      name: 'lineHeight/200',
      $type: 'FLOAT',
      collectionName: 'Primitives',
      $value: 4,
    };
    const treeMap = build(fallbackGroupVar)();
    expect(getToken(treeMap.base, 'lineHeight/200').$value).toBe(4);
  });
});

describe('Shadow variables', () => {
  let baseTree: TokenTree;

  beforeEach(() => {
    const trees = buildDtcgTrees(basicFixture);
    baseTree = trees.base;
  });

  it('should append px to numeric shadow properties', () => {
    const token = getToken(baseTree, 'shadow/sm');
    const layers = token.$value as TokenShadowLayer[];
    expect(layers[0]).toMatchObject({
      offsetX: '0px',
      offsetY: '2px',
      blur: '4px',
      spread: '0px',
    });
  });

  it('should convert rgba object to string', () => {
    const token = getToken(baseTree, 'shadow/sm');
    const layers = token.$value as TokenShadowLayer[];
    expect(layers[0]?.color).toBe('rgba(0, 0, 0, 0.25)');
  });

  it('should create shadow token with correct $type and $description', () => {
    const sm = getToken(baseTree, 'shadow/sm');
    expect(sm.$type).toBe('shadow');
    expect(sm.$description).toBeUndefined();

    const lg = getToken(baseTree, 'shadow/lg');
    expect(lg.$type).toBe('shadow');
    expect(lg.$description).toBe('Large elevation shadow');
  });

  it('should use shadow exposure with css-only platform', () => {
    const token = getToken(baseTree, 'shadow/sm');
    expect(token.$extensions).toEqual({
      exposure: { emit: true, platforms: ['css'] },
    });
  });

  it('should support multiple shadow layers', () => {
    const token = getToken(baseTree, 'shadow/lg');
    const layers = token.$value as TokenShadowLayer[];
    expect(layers).toHaveLength(2);
    expect(layers[0]).toMatchObject({
      offsetY: '4px',
      blur: '8px',
      spread: '2px',
    });
    expect(layers[1]).toMatchObject({
      offsetY: '1px',
      blur: '2px',
      spread: '0px',
    });
  });

  it('should throw when a shadow variable has an invalid value', () => {
    const invalidName = {
      id: 'effect:missing-name',
      name: 'shadow/invalid',
      effects: [
        {
          offsetX: 0,
          offsetY: 2,
          radius: undefined,
          spread: 0,
          color: { r: 0, g: 0, b: 0, a: 0.25 },
        },
      ],
    } as unknown as FigmaEffectVariable;
    expect(build(invalidName, 'shadow')).toThrow();
  });
});
