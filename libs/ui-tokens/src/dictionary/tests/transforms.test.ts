import { describe, it, expect } from '@jest/globals';
import { type TransformedToken } from 'style-dictionary/types';
import {
  spacingToEm,
  typeConversion,
  nativeColorFallback,
  typeConversionRN,
} from '../transforms.js';

type CleanedTypographyType = {
  'font-family': string;
  'font-size': string;
  'font-weight'?: number;
  'line-height'?: number;
  'letter-spacing'?: number;
};

type NativeTypographyType = {
  fontSize: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
};

describe('Custom Transforms', () => {
  describe('spacingToEm', () => {
    const token: TransformedToken = {
      name: 'letterSpacing-050',
      path: ['letterSpacing', '050'],
      original: {
        $value: 50,
        $type: 'number',
      },
      $value: 50,
      isSource: true,
      filePath: 'fake/filepath.json',
    };

    describe('transforming tokens', () => {
      it('should convert unitless tracking (base 1000) to em string', () => {
        expect(spacingToEm.transform(token, {}, {})).toBe('0.05em');
      });

      it('should handle negative tracking values', () => {
        const updatedToken = {
          ...token,
          $value: -25,
          original: { ...token.original, value: -25 },
        };
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('-0.025em');
      });

      it('should handle unitless string numbers correctly', () => {
        const updatedToken = {
          ...token,
          $value: '100',
          original: { ...token.original, $value: '100' },
        };
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('0.1em');
      });

      it('should return original value for unit strings like 2px', () => {
        const updatedToken = {
          ...token,
          $value: '2px',
          original: { ...token.original, $value: '2px' },
        };
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('2px');
      });

      it('should return the value as is if it is missing (to be caught by validation/formatter)', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const { $value, ...otherTokenProps } = token;
        expect(spacingToEm.transform(otherTokenProps, {}, {})).toBe(undefined);
      });
    });

    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        expect(spacingToEm.filter?.(token, {})).toBe(true);
      });

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, path: ['color', 'white'] };
        expect(spacingToEm.filter?.(updatedToken, {})).toBe(false);
      });
    });
  });

  describe('typeConversion (typography/clean)', () => {
    const token: TransformedToken = {
      name: 'header-h1',
      $type: 'typography',
      $value: {
        fontFamily: 'DM Sans',
        fontSize: '1rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '0.25em',
      },
      original: {
        $value: { fontFamily: 'DM Sans' },
        $type: 'typography',
      },
      path: ['header, h1'],
      filePath: 'fake/filepath.json',
      isSource: true,
    };

    describe('transforming tokens', () => {
      it('should return new configuration with variables unchanged', () => {
        const result = typeConversion.transform(
          token,
          {},
          {},
        ) as CleanedTypographyType;
        expect(result['letter-spacing']).not.toHaveProperty('letterSpacing');
        expect(result['font-family']).toBe('DM Sans');
        expect(result['font-size']).toBe('1rem');
        expect(result['line-height']).toBe(1.25);
        expect(result['font-weight']).toBe(700);
      });

      it('should return undefined if value is missing (to be caught by validation/formatter)', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const { $value, ...otherTokenProps } = token;
        expect(typeConversion.transform(otherTokenProps, {}, {})).toBe(
          undefined,
        );
      });

      it('should return undefined if required field is missing (to be caught by validation/formatter)', () => {
        const noFamilyToken = {
          ...token,
          $value: { fontSize: '1rem', lineHeight: 1.25 },
          original: {
            ...token.original,
            $value: { fontSize: '1rem', lineHeight: 1.25 },
          },
        };
        expect(typeConversion.transform(noFamilyToken, {}, {})).toBe(undefined);
      });
    });

    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        expect(typeConversion.filter?.(token, {})).toBe(true);
      });

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, $type: 'color' };
        expect(typeConversion.filter?.(updatedToken, {})).toBe(false);
      });
    });
  });

  describe('nativeColorFallback', () => {
    const token: TransformedToken = {
      name: 'color-primary-background',
      path: ['color', 'primary', 'background'],
      original: {},
      $value: 'oklch(26.24% 0.0036 78.30)',
      $extensions: {
        'hex-fallback': '#262423',
      },
      $type: 'color',
      isSource: true,
      filePath: 'fake/filepath.json',
    };

    describe('transforming tokens', () => {
      it('should return the hex-fallback value for color tokens when provided', () => {
        expect(nativeColorFallback.transform(token, {}, {})).toBe('#262423');
      });

      it('should return the rgba-fallback value for color tokens when provided', () => {
        const updatedToken = {
          ...token,
          original: {},
          $extensions: {
            'rgba-fallback': 'rgba(255,255,255, 0.1)',
          },
        };
        expect(nativeColorFallback.transform(updatedToken, {}, {})).toBe(
          'rgba(255,255,255, 0.1)',
        );
      });

      it('should return undefined if missing the fallback (to be caught by validation/formatter)', () => {
        const updatedToken = {
          ...token,
          original: {},
          $extensions: {},
        };
        expect(nativeColorFallback.transform(updatedToken, {}, {})).toBe(
          undefined,
        );
      });
    });

    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        expect(nativeColorFallback.filter?.(token, {})).toBe(true);
      });

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, $type: 'typography' };
        expect(nativeColorFallback.filter?.(updatedToken, {})).toBe(false);
      });
    });
  });

  describe('typeConversionRN', () => {
    const token: TransformedToken = {
      name: 'header-h1',
      $type: 'typography',
      $value: {
        fontFamily: 'DM Sans',
        fontSize: 16,
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: 25,
      },
      original: {},
      path: ['header, h1'],
      filePath: 'fake/filepath.json',
      isSource: true,
    };

    describe('transforming tokens', () => {
      it('should remove fontFamily from the value object, and return other transformed variables in string format', () => {
        // Should return an array - first value is fontSize, second is object with other properties
        const result = typeConversionRN.transform(token, {}, {}) as [
          string,
          NativeTypographyType,
        ];
        const spacingConversion =
          (token.$value.letterSpacing / 1000) * token.$value.fontSize;
        const lineHeightConversion =
          token.$value.lineHeight * token.$value.fontSize;
        expect(result[0]).toBe('16');
        expect(result[1].fontWeight).toBe('700');
        expect(result[1].lineHeight).toBe(lineHeightConversion.toString());
        expect(result[1].letterSpacing).toBe(spacingConversion.toString());
        expect(result[1]).not.toHaveProperty('fontFamily');
      });

      it('should return undefined if required fontSize is undefined (to be caught by validation/formatter)', () => {
        const token: TransformedToken = {
          name: 'header-h1',
          $type: 'typography',
          $value: {
            fontFamily: 'DM Sans',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: 25,
          },
          original: {},
          path: ['header, h1'],
          filePath: 'fake/filepath.json',
          isSource: true,
        };
        expect(typeConversionRN.transform(token, {}, {})).toBe(undefined);
      });

      it('should return undefined if value is missing (to be caught by validation/formatter)', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const { $value, ...otherTokenProps } = token;
        expect(typeConversionRN.transform(otherTokenProps, {}, {})).toBe(
          undefined,
        );
      });
    });

    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        expect(typeConversionRN.filter?.(token, {})).toBe(true);
      });

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, $type: 'color' };
        expect(typeConversionRN.filter?.(updatedToken, {})).toBe(false);
      });
    });
  });
});
