import { describe, it, expect } from '@jest/globals';
import { type TransformedToken, type Dictionary } from 'style-dictionary/types';
import { tailwindTheme, nativeTheme, jsonTwMerge } from '../formats.js';

const cssMockTokens: TransformedToken[] = [
  // --- invalid values that should be filtered out ---
  {
    name: 'color-undefined',
    $type: 'color',
    isSource: true,
    path: ['color', 'undefined'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'color-corrupted',
    $type: 'color',
    $value: {},
    isSource: true,
    path: ['color', 'corrupted'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  // --- one token per TW_MERGE_THEME_CATEGORIES namespace ---
  {
    name: 'breakpoint-md',
    $type: 'dimension',
    $value: '768px',
    isSource: true,
    path: ['breakpoint', 'md'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'color-brand-background',
    $type: 'color',
    $value: '#00ba3b',
    isSource: true,
    path: ['color', 'brand', 'background'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'opacity-200',
    $type: 'number',
    $value: '0.5',
    isSource: true,
    path: ['opacity', '200'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'opacity-full',
    $type: 'number',
    $value: '1',
    isSource: true,
    path: ['opacity', 'full'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'radius-400',
    $type: 'number',
    $value: '1rem',
    isSource: true,
    path: ['radius', '400'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'shadow-200',
    $type: 'shadow',
    $value: '0 2px 4px rgba(0,0,0,0.1)',
    isSource: true,
    path: ['shadow', '200'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  {
    name: 'spacing-200',
    $type: 'number',
    $value: '0.5rem',
    isSource: true,
    path: ['spacing', '200'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  // --- omitted namespaces (verify they don't appear in JSON output) ---
  {
    name: 'zindex-100',
    $type: 'number',
    $value: 10,
    isSource: true,
    path: ['zIndex', '100'],
    filePath: 'fake/filePath.json',
    original: {},
  },
  // --- typography utility ---
  {
    name: 'text-body-default',
    $type: 'typography',
    $value: {
      'font-size': '1rem',
      'font-family': 'DM Sans',
      'line-height': 1.25,
      'font-weight': 700,
      'letter-spacing': '0.025em',
    },
    isSource: true,
    path: ['text', 'body', 'default'],
    filePath: 'fake/filePath.json',
    original: {},
  },
];

describe('formats', () => {
  describe('tailwindTheme', () => {
    it('should format source tokens into Tailwind @theme and @utility blocks', async () => {
      const dictionary: Dictionary = {
        allTokens: cssMockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const result = (await tailwindTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      })) as string;

      const themeBlocks = result.match(/@theme {/g) || [];
      expect(themeBlocks.length).toBe(1);

      const utilityBlocks = result.match(/@utility /g) || [];
      expect(utilityBlocks.length).toBe(1); //only one typography token
    });

    it('should render tokens in tailwind format', async () => {
      const dictionary: Dictionary = {
        allTokens: cssMockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await tailwindTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      });

      const expectedUtility = [
        '@utility type-body-default {',
        '  font-size: 1rem;',
        '  font-family: DM Sans;',
        '  line-height: 1.25;',
        '  font-weight: 700;',
        '  letter-spacing: 0.025em;',
        '}',
      ].join('\n');

      expect(result).toContain(expectedUtility);
      expect(result).toContain('--color-brand-background: #00ba3b;');
    });

    it('should filter out undefined values and objects where transforms could have been corrupted', async () => {
      const dictionary: Dictionary = {
        allTokens: cssMockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await tailwindTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      });
      expect(result).not.toContain('--color-corrupted');
      expect(result).not.toContain('--color-undefined');
    });

    it('renders a "No tokens found" if no matching tokens', async () => {
      const dictionary: Dictionary = {
        allTokens: [cssMockTokens[0]] as TransformedToken[],
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await tailwindTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: { destination: 'tokens.css' },
      });
      expect(result).toContain('No tokens found for tokens.css');
    });
  });

  describe('jsonTwMerge', () => {
    const runFormat = (tokens: TransformedToken[]) => {
      const dictionary: Dictionary = {
        allTokens: tokens,
        tokens: {},
        tokenMap: new Map(),
      };
      return jsonTwMerge.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      }) as Promise<string>;
    };

    const extractTokens = async (tokens: TransformedToken[]) => {
      const result = await runFormat(tokens);
      const jsonStr = result.match(/= ([\s\S]+) as const;/)?.[1];
      return JSON.parse(jsonStr ?? '{}');
    };

    it('groups theme tokens by category for each registered tw-merge namespace', async () => {
      const { theme } = await extractTokens(cssMockTokens);
      expect(theme.breakpoint).toEqual(['md']);
      expect(theme.color).toEqual(['brand-background']);
      expect(theme.opacity).toEqual(['200', 'full']);
      expect(theme.radius).toEqual(['400']);
      expect(theme.shadow).toEqual(['200']);
      expect(theme.spacing).toEqual(['200']);
    });

    it('only emits the namespaces registered in TW_MERGE_THEME_CATEGORIES', async () => {
      const { theme } = await extractTokens(cssMockTokens);
      expect(theme).not.toHaveProperty('zIndex');
      expect(Object.keys(theme).sort()).toEqual([
        'breakpoint',
        'color',
        'opacity',
        'radius',
        'shadow',
        'spacing',
      ]);
    });

    it('emits typography tokens as type-* utility names, not theme entries', async () => {
      const { theme, utilities } = await extractTokens(cssMockTokens);
      expect(utilities).toContain('type-body-default');
      expect(theme).not.toHaveProperty('text');
    });

    it('should filter out undefined values and objects where transforms could have been corrupted', async () => {
      const { theme } = await extractTokens(cssMockTokens);
      expect(theme.color).toContain('brand-background');
      expect(theme.color).not.toContain('corrupted');
      expect(theme.color).not.toContain('undefined');
    });

    it('if no matching tokens, should render theme object with value of empty array', async () => {
      const { theme, utilities } = await extractTokens([cssMockTokens[1]]); //Just the corrupted color token
      expect(theme.color).toStrictEqual([]);
      expect(theme.radius).toStrictEqual([]);
      expect(utilities).toStrictEqual([]);
    });
  });

  describe('CSS / JSON parity', () => {
    // Same fixture run through both formats — guarantees that every theme key exposed to tailwind-merge has
    // a corresponding CSS variable, and every utility name has a corresponding @utility block (and vice versa).
    // If there is any unintentional future divergence this test fails loudly.
    const categoryToKebab = (cat: string) =>
      cat.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

    const buildOutputs = async () => {
      const dictionary: Dictionary = {
        allTokens: cssMockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const css = (await tailwindTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      })) as string;
      const jsonResult = (await jsonTwMerge.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      })) as string;
      const parsed = JSON.parse(
        jsonResult.match(/= ([\s\S]+) as const;/)?.[1] ?? '{}',
      ) as { theme: Record<string, string[]>; utilities: string[] };
      return { css, parsed };
    };

    const assertParity = (
      css: string,
      parsed: { theme: Record<string, string[]>; utilities: string[] },
    ) => {
      // JSON --> CSS: check every JSON theme key / utility appears in CSS.
      for (const [category, keys] of Object.entries(parsed.theme)) {
        for (const key of keys) {
          expect(css).toContain(`--${categoryToKebab(category)}-${key}:`);
        }
      }
      for (const utility of parsed.utilities) {
        expect(css).toContain(`@utility ${utility} {`);
      }
      // CSS --> JSON: check every CSS var included in the tw-merge category, and every @utility block, are listed in JSON.
      for (const category of Object.keys(parsed.theme)) {
        // Grab the key portion of `--<category>-<key>:`, eg. `brand-background` from `--color-brand-background:`.
        const cssVarRegex = new RegExp(
          `--${categoryToKebab(category)}-(?<key>[a-zA-Z0-9_-]+):`,
          'g',
        );
        for (const { groups } of css.matchAll(cssVarRegex)) {
          expect(parsed.theme[category]).toContain(groups?.key);
        }
      }
      // Captures the utility name from `@utility <name> {`, eg. `type-body-default`.
      const utilityRegex = /@utility (?<name>\S+) \{/g;
      for (const { groups } of css.matchAll(utilityRegex)) {
        expect(parsed.utilities).toContain(groups?.name);
      }
    };

    it('every JSON theme key has a matching CSS variable, and vice versa', async () => {
      const { css, parsed } = await buildOutputs();
      expect(() => assertParity(css, parsed)).not.toThrow();
    });

    it('throws when CSS and JSON diverge', async () => {
      const { css, parsed } = await buildOutputs();
      // Drop one CSS var and add a new CSS var to test divergence in matches
      // (both JSON --> CSS and CSS --> JSON gaps)
      const updatedCss =
        css.replace('--opacity-200: 0.5;', '') +
        '\n@theme {\n  --color-phantom: #000;\n}\n';
      expect(() => assertParity(updatedCss, parsed)).toThrow();
    });
  });

  describe('nativeTheme', () => {
    const mockTokens: TransformedToken[] = [
      {
        name: 'color-base',
        $type: 'color',
        $value: '#00ba3b',
        isSource: true,
        path: ['color', 'base'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'color-undefined', // No value, should be filtered out
        $type: 'color',
        isSource: true,
        path: ['color', 'undefined'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'color-corrupted', // No value, should be filtered out
        $type: 'color',
        $value: {},
        isSource: true,
        path: ['color', 'undefined'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'radius-baseRadius',
        $type: 'number',
        $value: '8px',
        isSource: true,
        path: ['radius', 'base-radius'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'shadow-smallShadow',
        $type: 'shadow',
        $value: '8px',
        isSource: true,
        path: ['shadow', 'small-shadow'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'text-body-corrupted', // Nested undefined value, should be filtered out
        $type: 'typography',
        $value: [undefined, { lineHeight: '20', fontWeight: '700' }],
        isSource: true,
        path: ['text', 'body', 'corrupted'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'text-body-default',
        $type: 'typography',
        $value: ['16px', { lineHeight: '20', fontWeight: '700' }],
        isSource: true,
        path: ['text', 'body', 'default'],
        filePath: 'fake/filePath.json',
        original: {},
      },
    ];

    it('correctly maps path[0] names to appropiate TWRNC theme prop', async () => {
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await nativeTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      });
      expect(result).toContain('colors: {');
      expect(result).not.toContain('color: {');
      expect(result).toContain('fontSize: {');
      expect(result).not.toContain('text: {');
      expect(result).toContain('borderRadius: {');
      expect(result).not.toContain('radius: {');
      expect(result).toContain('boxShadow: {');
      expect(result).not.toContain('shadow: {');
    });

    it('correctly filters the tokens', async () => {
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await nativeTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      });
      expect(result).toContain('base:');
      expect(result).not.toContain('undefined:');
      expect(result).not.toContain('corrupted:');
      expect(result).toContain('"body-default":');
      expect(result).not.toContain('"body-corrupted":');
      expect(result).toContain('"base-radius":');
      expect(result).toContain('"small-shadow":');
    });

    it('surfaces fontFamilySans from typography token', async () => {
      const primitiveTokens = {
        fontFamily: {
          sans: {
            name: 'font-family-sans',
            $value: 'DM Sans',
            $type: 'fontFamily',
            isSource: false,
            path: ['fontFamily', 'sans'],
            original: {},
            filePath: 'fake/filePath.json',
          },
        },
      };

      const mockTokens: TransformedToken[] = [
        {
          name: 'text-body-default',
          $type: 'typography',
          $value: ['16px', { lineHeight: '20', fontWeight: '700' }],
          isSource: true,
          path: ['text', 'body', 'default'],
          filePath: 'fake/filePath.json',
          original: {
            $value: {
              fontFamily: '{fontFamily.sans}',
            },
          },
        },
      ];
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: primitiveTokens,
        tokenMap: new Map(),
        unfilteredTokens: primitiveTokens, // getReferences in NatveTheme format looks for reference token here
      };
      const result = await nativeTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: {},
      });
      expect(result).toContain('fontFamily: {');
      expect(result).toContain('sans: "DM Sans"');
    });

    it('throws an error if it fails to surfaces fontFamily from typography token', async () => {
      const primitiveTokens = {
        fontFamily: {
          test: {
            name: 'font-family-sans',
            $value: 'DM Sans',
            $type: 'fontFamily',
            isSource: false,
            path: ['fontFamily', 'sans'],
            original: {},
            filePath: 'fake/filePath.json',
          },
        },
      };

      const mockTokens: TransformedToken[] = [
        {
          name: 'text-body-default',
          $type: 'typography',
          $value: ['16px', { lineHeight: '20', fontWeight: '700' }],
          isSource: true,
          path: ['text', 'body', 'default'],
          filePath: 'fake/filePath.json',
          original: {
            $value: {
              fontFamily: '{fontFamily.sans}',
            },
          },
        },
      ];

      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: primitiveTokens,
        tokenMap: new Map(),
        unfilteredTokens: primitiveTokens, // getReferences in NatveTheme format looks for reference token here
      };

      await expect(
        nativeTheme.format({ dictionary, platform: {}, options: {}, file: {} }),
      ).rejects.toThrow(/fontFamily.sans/);
    });

    it('renders a "No tokens found" if no matching tokens', async () => {
      const dictionary: Dictionary = {
        allTokens: [mockTokens[1]] as TransformedToken[],
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await nativeTheme.format({
        dictionary,
        platform: {},
        options: {},
        file: { destination: 'tokens.css' },
      });
      expect(result).toContain('No tokens found for tokens.css');
    });
  });
});
