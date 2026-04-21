import { describe, it, expect } from '@jest/globals';
import { type TransformedToken, type Dictionary } from 'style-dictionary/types';
import { tailwindTheme } from '../formats.js';

describe('formats', () => {
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
      value: 'bold 16px/1.25 "DM Sans"',
      isSource: true,
      path: ['text', 'body', 'default'],
      filePath: 'fake/filePath.json',
      original: {},
    }
  ];

  describe('tailwindTheme', () => {
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
      expect(result).toContain('--text-body-default: bold 16px/1.25 "DM Sans"')
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
});
