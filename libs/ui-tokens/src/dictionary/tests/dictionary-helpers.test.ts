import { describe, it, expect } from 'vitest';
import {
  tokensFor,
  getExposure,
  shouldEmit,
} from '../../utilities/dictionary-helpers.js';
import type { TokenTree, DtcgToken } from '../../build-tree/types.js';
import { EXPOSURE_KEY } from '../../build-tree/types.js';
import { FALLBACK_EXPOSURE } from '../../build-tree/token-manifest.js';

describe('tokensFor', () => {
  const base: TokenTree = {
    color: {
      primary: { $value: '#FF0000', $type: 'color', $description: 'test' },
      secondary: { $value: '#00FF00', $type: 'color' },
      base: {
        suface: { $value: '#FFFFFF', $type: 'color' },
      },
    },
  };

  const modeTrees: Record<string, TokenTree> = {
    pro: {
      color: {
        primary: { $value: '#0000FF', $type: 'color' },
        base: {
          surface: {
            default: {
              $value: '#010101',
              $type: 'color',
              $description: 'dark',
            },
          },
        },
      },
    },
  };

  it('returns base tree when no mode is provided', () => {
    const result = tokensFor(base, modeTrees);
    expect(result).toBe(base);
  });

  it('merges base with override when mode is provided — confirms value changes', () => {
    const result = tokensFor(base, modeTrees, {
      name: 'pro',
      cssSelector: '[data-theme="pro"]',
      rnExportName: 'proThemeOverride',
    });

    const colorTree = result['color'] as TokenTree;
    // Override full DTCG token
    expect(colorTree['primary'].$value).toBe('#0000FF');
    expect(colorTree['primary'].$description).not.toBeDefined();

    // Preserved base value if no override
    expect(colorTree['secondary'].$value).toBe('#00FF00');

    // Replace base.surface token with new base.surface.default token (tokens only leaves)
    expect(
      (colorTree['base'] as TokenTree)['surface'].$value,
    ).not.toBeDefined();
    expect(
      (
        ((colorTree['base'] as TokenTree)['surface'] as TokenTree)[
          'default'
        ] as DtcgToken
      ).$value,
    ).toBe('#010101');
  });

  it('throws when mode name provided has no matching mode tree', () => {
    expect(() =>
      tokensFor(base, modeTrees, {
        name: 'dark',
        cssSelector: '[data-theme="dark"]',
        rnExportName: 'darkThemeOverride',
      }),
    ).toThrow('No mode overrides found for "dark"');
  });
});

describe('exposure', () => {
  const cssExposure = { emit: true, platforms: ['css'] as const };
  const token = {
    $extensions: { [EXPOSURE_KEY]: cssExposure },
    original: { $extensions: { [EXPOSURE_KEY]: cssExposure } },
    name: 'test-dtcg-token',
    path: ['test', 'dtcg'],
    isSource: true,
    filePath: 'fake/path.json',
  };

  describe('getExposure', () => {
    it('reads from $extensions.exposure', () => {
      expect(getExposure(token)).toEqual(cssExposure);
    });

    it('falls back to original.$extensions.exposure if no $extensions', () => {
      const udpatedToken = {
        ...token,
        $extensions: {},
      };
      expect(getExposure(udpatedToken)).toEqual(cssExposure);
    });

    it('falls back to FALLBACK_EXPOSURE when neither path exists', () => {
      const updatedToken = {
        ...token,
        $extensions: {},
        original: {},
      };
      expect(getExposure(updatedToken)).toEqual(FALLBACK_EXPOSURE);
    });
  });

  describe('shouldEmit', () => {
    it('returns true only when emit is true and platform matches', () => {
      const allPlatformToken = {
        ...token,
        $extensions: {
          [EXPOSURE_KEY]: { emit: true, platforms: ['css', 'native'] },
        },
      };
      expect(shouldEmit(allPlatformToken, 'css')).toBe(true);
      expect(shouldEmit(allPlatformToken, 'native')).toBe(true);
    });

    it('returns false when platform does not match', () => {
      // token only has ['css'] for platforms
      expect(shouldEmit(token, 'native')).toBe(false);
    });

    it('returns false when emit is false', () => {
      const noEmitToken = {
        ...token,
        $extensions: {
          [EXPOSURE_KEY]: { emit: false, platforms: ['css', 'native'] },
        },
      };
      expect(shouldEmit(noEmitToken, 'css')).toBe(false);
    });
  });
});
