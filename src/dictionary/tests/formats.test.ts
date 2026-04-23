import { describe, it, expect } from '@jest/globals';
import { type TransformedToken, type Dictionary, type DesignToken } from 'style-dictionary/types';
import { tailwindTheme, nativeTheme } from '../formats.js';
import { getReferences } from 'style-dictionary/utils';

describe('formats', () => {
  describe('tailwindTheme', () => {
    const mockTokens: TransformedToken[] = [
      {
        name: 'color-primary',
        $type: 'color',
        $value: '#00ba3b',
        isSource: true,
        path: ['color', 'primary'],
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
        name: 'text-body-default',
        $type: 'typography',
        value: '16px bold 16px/1.25 "DM Sans"',
        isSource: true,
        path: ['text', 'body', 'default'],
        filePath: 'fake/filePath.json',
        original: {},
      },
      {
        name: 'text-heading-h1',
        $type: 'spacing',
        value: '0em',
        isSource: true,
        path: ['text', 'heading', 'h1'],
        filePath: 'fake/filePath.json',
        original: {},
      }
    ];

    it('should format source tokens into Tailwind @theme blocks', async () => {
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: {},
        tokenMap: new Map()
      };
      const result = await tailwindTheme.format({ dictionary, platform: {}, options: {}, file: {} }) as string;
      const themeBlocks = result.match(/@theme {/g) || [];
      expect(themeBlocks.length).toBe(2); //one for clearing existing variables, one for tokens
      expect(result).toContain('--color-*: initial;');
    });

    it('should render tokens in tailwind format', async () => {
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: {},
        tokenMap: new Map()
      };
      const result = await tailwindTheme.format({ dictionary, platform: {}, options: {}, file: {} });
      expect(result).toContain('--color-primary: #00ba3b;');
      expect(result).toContain('--text-body-default: 16px bold 16px/1.25 "DM Sans"');
      expect(result).toContain('--tracking-heading-h1: 0em');
    });

    it('should filter out undefined values and objects where transforms could have been corrupted', async () => {
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: {},
        tokenMap: new Map()
      };
      const result = await tailwindTheme.format({ dictionary, platform: {}, options: {}, file: {} });
      expect(result).not.toContain('--color-corrupted');
      expect(result).not.toContain('--color-undefined');
    });

    it('renders a "No tokens found" if no matching tokens', async () => {
      const dictionary: Dictionary = {
        allTokens: [mockTokens[1]] as TransformedToken[],
        tokens: {},
        tokenMap: new Map()
      };
      const result = await tailwindTheme.format({ dictionary, platform: {}, options: {}, file: {destination: 'tokens.css'} });
      expect(result).toContain('No tokens found for tokens.css')
    })
  });

  describe('nativeTheme', () => {
    const mockTokens: TransformedToken[] = [
      {
        name: 'color-primary',
        $type: 'color',
        $value: '#00ba3b',
        isSource: true,
        path: ['color', 'primary'],
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
        $value: [ undefined, { lineHeight: '20', fontWeight: '700' }],
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
        original: {
        },
      },
    ];

    it('correctly maps path[0] names to appropiate TWRNC theme prop', async () => {
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: {},
        tokenMap: new Map(),
      };
      const result = await nativeTheme.format({ dictionary, platform: {}, options: {}, file: {} });
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
        tokenMap: new Map()
      };
      const result = await nativeTheme.format({ dictionary, platform: {}, options: {}, file: {} });
      expect(result).toContain('primary:')
      expect(result).not.toContain('undefined:')
      expect(result).not.toContain('corrupted:')
      expect(result).toContain('"body-default":');
      expect(result).not.toContain('"body-corrupted":')
      expect(result).toContain('"base-radius":')
      expect(result).toContain('"small-shadow":')
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
          }
        }
      }

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
            fontFamily: "{fontFamily.sans}",
          }
        },
      },
      ]
      const dictionary: Dictionary = {
        allTokens: mockTokens,
        tokens: primitiveTokens,
        tokenMap: new Map(),
        unfilteredTokens: primitiveTokens, // getReferences in NatveTheme format looks for reference token here
      };
      const result = await nativeTheme.format({ dictionary, platform: {}, options: {}, file: {} });
      expect(result).toContain('fontFamily: {');
      expect(result).toContain('sans: "DM Sans"');
    });

    it('renders a "No tokens found" if no matching tokens', async () => {
      const dictionary: Dictionary = {
        allTokens: [mockTokens[1]] as TransformedToken[],
        tokens: {},
        tokenMap: new Map()
      };
      const result = await nativeTheme.format({ dictionary, platform: {}, options: {}, file: {destination: 'tokens.css'} });
      expect(result).toContain('No tokens found for tokens.css')
    })
  });
});
