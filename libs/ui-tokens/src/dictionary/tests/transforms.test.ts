import { describe, it, expect } from '@jest/globals';
import { type TransformedToken } from 'style-dictionary/types';
import {
  spacingToEm,
  typeConversion,
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
        $value: 5,
        $type: 'number',
      },
      $value: 5,
      isSource: true,
      filePath: 'fake/filepath.json',
    };

    describe('transforming tokens', () => {
      it('should convert unitless tracking (base 100) to em string', () => {
        expect(spacingToEm.transform(token, {}, {})).toBe('0.05em');
      });

      it('should handle negative tracking values', () => {
        const updatedToken = {
          ...token,
          $value: -2.5,
          original: { ...token.original, value: -2.5 },
        };
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('-0.025em');
      });

      it('should handle unitless string numbers correctly', () => {
        const updatedToken = {
          ...token,
          $value: '10',
          original: { ...token.original, $value: '10' },
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
        const { $value: _, ...otherTokenProps } = token;
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
        const { $value: _, ...otherTokenProps } = token;
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

  describe('typeConversionRN', () => {
    const token: TransformedToken = {
      name: 'header-h1',
      $type: 'typography',
      $value: {
        fontFamily: 'DM Sans',
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: 0.025,
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
        const fontSizeNum = parseFloat(token.$value.fontSize);
        const lineHeightConversion = token.$value.lineHeight * fontSizeNum;

        expect(result[0]).toBe('16px');
        expect(result[1].fontWeight).toBe('700');
        expect(result[1].lineHeight).toBe(
          lineHeightConversion.toString() + 'px',
        );
        expect(result[1].letterSpacing).toBe(
          token.$value.letterSpacing.toString() + 'em',
        );
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
        const { $value: _, ...otherTokenProps } = token;
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
