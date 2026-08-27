import { describe, it, beforeEach, expect } from 'vitest';
import type {
  FigmaExport,
  TokenTree,
  DtcgTrees,
  DtcgToken,
  FigmaVariable,
  FigmaTextVariable,
  FigmaEffectVariable,
  TokenTypography,
  TokenShadowLayer,
} from '../types.js';
import { buildDtcgTrees } from '../buildTokenTree.js';
import { basicFixture } from './fixture.js';

type allVariableTypes = FigmaVariable | FigmaTextVariable | FigmaEffectVariable;

describe('buildDtcgTrees', () => {
  const getToken = (tree: TokenTree, path: string): DtcgToken => {
    const [next, ...rest] = path.split('/');
    const nextPathNode = tree[next as string];
    if (rest.length === 0) {
      return nextPathNode as DtcgToken;
    }
    return getToken(nextPathNode as TokenTree, rest.join('/'));
  };

  // Helper to append variables onto Figma export
  const withVariable = (
    fixture: FigmaExport,
    variable: FigmaVariable | FigmaTextVariable | FigmaEffectVariable,
    type?: string,
  ): FigmaExport => {
    if (type === 'text') {
      return {
        ...fixture,
        textVariables: [
          ...fixture.textVariables,
          variable as FigmaTextVariable,
        ],
      };
    } else if (type === 'shadow') {
      return {
        ...fixture,
        effectVariables: [
          ...(fixture.effectVariables ?? []),
          variable as FigmaEffectVariable,
        ],
      };
    }
    return {
      ...fixture,
      variables: [...fixture.variables, variable as FigmaVariable],
    };
  };
  const build = (variable: allVariableTypes, type?: string) => () =>
    buildDtcgTrees(withVariable(basicFixture, variable, type));

  it('should preserve descriptions on tokens', () => {
    const trees = buildDtcgTrees(basicFixture);
    const colorTree = trees.base['color'] as TokenTree;

    const noDescription = getToken(colorTree, 'white');
    expect(noDescription.$description).toBeUndefined();

    const withDescription = getToken(colorTree, 'green/600');
    expect(withDescription.$description).toBe('Homeowner green');
  });

  describe('Nested object creation', () => {
    let colorTree: TokenTree;
    let trees: DtcgTrees;
    beforeEach(() => {
      trees = buildDtcgTrees(basicFixture);
      colorTree = trees.base['color'] as TokenTree;
    });

    it('should only write DTCG at tree leaf', () => {
      const green = colorTree['green'] as TokenTree;
      expect(green['600']).toEqual({
        $type: 'color',
        $description: 'Homeowner green',
        $value: 'rgba(0, 120, 13, 0.5)',
        $extensions: { exposure: expect.any(Object) },
      });
      // Segments of path are plain trees, not tokens
      expect(green['$value']).toBeUndefined();
    });

    it('should organize all variables correctly in tree', () => {
      const trees = buildDtcgTrees(basicFixture);
      const baseTree = trees.base;

      // Primitives go to their group
      expect(getToken(baseTree, 'color/white').$value).toBe(
        'rgba(255, 255, 255, 1)',
      );
      expect(getToken(baseTree, 'spacing/100').$value).toBe(4);
      expect(getToken(baseTree, 'opacity/100').$value).toBe(0.2);

      // Typography
      expect(getToken(baseTree, 'fontSize/400').$value).toBe(24);

      // Semantic: all colors (including collection) land in color tree
      expect(getToken(baseTree, 'color/surface/page').$value).toBe(
        '{color.white}',
      );
      expect(getToken(baseTree, 'color/rating/filled').$value).toBe(
        '{color.green.600}',
      );

      // eslint-disable-next-line prettier/prettier
    // Non-color component variables land uncategorized in tree:
      // (cannot determine the exact purpose of variable if not 'color'):
      expect(getToken(baseTree, 'avatar/small').$value).toBe(10);

      // Mode values go to modes tree
      const proTree = trees.modes['pro'] as TokenTree | undefined;
      expect(proTree).toBeDefined();
      if (proTree) {
        expect(
          getToken(proTree, 'color/brand/background').$value,
        ).toBeDefined();
      }

      // Typography styles go to text
      expect(getToken(baseTree, 'text/header/h1').$value).toEqual({
        fontFamily: '{fontFamily.sans}',
        fontWeight: 700,
        fontSize: '{fontSize.400}',
        lineHeight: 1.25,
        letterSpacing: 0,
      });

      // No cross-contamination
      const spacingSubTree = baseTree['spacing'] as TokenTree | undefined;
      expect(spacingSubTree?.['radius']).toBeUndefined();
    });

    it('should not overwrite existing objects when adding variables to tree', () => {
      expect(Object.keys(colorTree).sort()).toEqual([
        'blue',
        'brand',
        'green',
        'rating',
        'success',
        'surface',
        'white',
      ]);
      expect(getToken(colorTree, 'blue/600').$value).toBe(
        'rgba(33, 84, 204, 1)',
      );
      expect(getToken(colorTree, 'white').$value).toBe(
        'rgba(255, 255, 255, 1)',
      );
    });

    it('should throw when a token would be nested under an existing token', () => {
      const invalidName = {
        id: `var:spacing:lg`,
        name: 'spacing/100/tight', //fixture already has 'spacing/100' - tokens can only be leaf nodes
        $type: 'FLOAT',
        collectionName: 'Primitives',
        $value: 4,
      };
      expect(build(invalidName)).toThrow(
        'Path collision: "spacing/100/tight" nests under existing token "spacing/100"',
      );
    });

    it('should throw on empty intermediate path segment', () => {
      const invalidName = {
        id: `var:spacing:lg`,
        name: 'spacing//200',
        $type: 'FLOAT',
        collectionName: 'Primitives',
        $value: 4,
      };
      expect(build(invalidName)).toThrow('Empty segment in path: spacing,,200');
    });

    it('should throw when a token would replace an existing token group', () => {
      expect(
        build({
          id: 'var:green-collision',
          name: 'color/green',
          $type: 'COLOR',
          collectionName: 'Primitives',
          $value: { r: 0, g: 1, b: 0, a: 1 },
        }),
      ).toThrow(
        'Path collision: token "color/green" would replace an existing token group',
      );
    });
  });

  describe('Variables', () => {
    it('should mark primitive colors as non-emitting & semantic as emitting with all platforms', () => {
      const trees = buildDtcgTrees(basicFixture);
      const primToken = getToken(trees.base, 'color/white');
      expect(primToken.$extensions).toEqual({
        exposure: { emit: false, platforms: ['css', 'native'] },
      });
      const semToken = getToken(trees.base, 'color/surface/page');
      expect(semToken.$extensions).toEqual({
        exposure: { emit: true, platforms: ['css', 'native'] },
      });
    });

    it('should use fallback exposure for component collection variables', () => {
      const trees = buildDtcgTrees(basicFixture);
      const componentToken = getToken(trees.base, 'color/rating/filled');
      expect(componentToken.$extensions).toEqual({
        exposure: { emit: true, platforms: ['css', 'native'] },
      });
    });

    it('should resolve typography-style groups via type fallback exposure', () => {
      const trees = buildDtcgTrees(basicFixture);
      const fontSizeToken = getToken(trees.base, 'fontSize/400');
      expect(fontSizeToken.$extensions).toEqual({
        exposure: { emit: false, platforms: ['css', 'native'] },
      });
    });

    describe('Classification', () => {
      const noCollectionVar = {
        id: `var:spacing:lg`,
        name: 'spacing/200',
        $type: 'FLOAT',
        collectionName: 'unknown',
        $value: 4,
      };

      it('should throw on missing collection classification', () => {
        expect(build(noCollectionVar)).toThrow(
          `Not able to classify "spacing/200" under "unknown" collection`,
        );
      });

      it('should classify collection names case-insensitively', () => {
        const uppercaseCollectionVar = {
          ...noCollectionVar,
          collectionName: 'PRIMITIVES',
        };
        expect(build(uppercaseCollectionVar)).not.toThrow();
      });

      it('should throw on unmapped group + classification', () => {
        const noGroupVar = {
          ...noCollectionVar,
          name: 'nonsense/100',
          collectionName: 'Primitives',
        };
        expect(build(noGroupVar)).toThrow(
          `No found group for "nonsense" (classification "primitive")`,
        );
      });

      it('should infer token type from alias group when direct group has no type mapping', () => {
        const aliasVar: FigmaVariable = {
          id: 'var:alias-infer',
          name: 'avatar/large',
          $type: 'COLOR',
          collectionName: 'Component',
          $value: { type: 'VARIABLE_ALIAS', aliasName: 'color/blue/600' },
        };
        const trees = build(aliasVar)();
        // 'avatar' is not in TYPE_MAP, but alias points to 'color/blue/600'
        // → aliasGroup = 'color' → TYPE_MAP['color'] = 'color'
        const token = getToken(trees.base, 'color/avatar/large');
        expect(token.$type).toBe('color');
      });

      it('should fall back to Figma $type when group and alias have no type mapping', () => {
        const trees = buildDtcgTrees(basicFixture);
        // avatar/small is in Component collection, $type: 'FLOAT', raw value (not alias)
        // 'avatar' not in TYPE_MAP, not alias → falls to Figma $type: FLOAT → 'dimension'
        const token = getToken(trees.base, 'avatar/small');
        expect(token.$type).toBe('dimension');
      });
    });

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
});
