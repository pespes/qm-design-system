import { describe, it, beforeEach, expect } from 'vitest';
import type {
  TokenTree,
  DtcgTrees,
  DtcgToken,
  FigmaVariable,
  FigmaTextVariable,
  FigmaEffectVariable,
} from '../types.js';
import { buildDtcgTrees } from '../buildTokenTree.js';
import { basicFixture, withVariable } from './fixture.js';

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
      expect(getToken(baseTree, 'color/white')).toBeDefined();
      expect(getToken(baseTree, 'spacing/100')).toBeDefined();
      expect(getToken(baseTree, 'opacity/100')).toBeDefined();

      // Typography
      expect(getToken(baseTree, 'fontSize/400')).toBeDefined();

      // Semantic: all colors (including collection) land in color tree
      expect(getToken(baseTree, 'color/surface/page')).toBeDefined();
      expect(getToken(baseTree, 'color/rating/filled')).toBeDefined();

      // eslint-disable-next-line prettier/prettier
    // Non-color component variables land uncategorized in tree:
      // (cannot determine the exact purpose of variable if not 'color'):
      expect(getToken(baseTree, 'avatar/small')).toBeDefined();

      // Mode values go to modes tree
      const proTree = trees.modes['pro'] as TokenTree | undefined;
      expect(proTree).toBeDefined();
      if (proTree) {
        expect(
          getToken(proTree, 'color/brand/background').$value,
        ).toBeDefined();
      }

      // Typography styles go to text
      expect(getToken(baseTree, 'text/header/h1')).toBeDefined();

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

    it('includes semantic colors in color tree at root', () => {
      const semColor = colorTree;
      expect(Object.keys(semColor).sort()).toContain('brand');
      expect(Object.keys(semColor).sort()).toContain('rating');
      expect(Object.keys(semColor).sort()).toContain('success');
      expect(Object.keys(semColor).sort()).toContain('surface');
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
  });
});
