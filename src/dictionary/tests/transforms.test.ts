import { describe, it, expect } from '@jest/globals';
import { type TransformedToken } from 'style-dictionary/types';
import { spacingToEm, typeConversion } from '../transforms.js';

type TypographyType = {
  fontFamily: string;
  fontSize: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
}

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
      filePath: 'fake/filepath.json'
    };

    describe('transforming tokens', () => {
      it('should convert unitless tracking (base 1000) to em string', () => {      
        expect(spacingToEm.transform(token, {}, {})).toBe('0.05em');
      });

      it('should handle negative tracking values', () => {
        const updatedToken = { ...token, $value: -25, original: { ...token.original, value: -25 }};
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('-0.025em');
      });

      it('should handle unitless string numbers correctly', () => {
        const updatedToken = { ...token, $value: '100', original: { ...token.original, $value: '100' }};
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('0.1em');
      });

      it('should return original value for unit strings like 2px', () => {
        const updatedToken = { ...token, $value: '2px', original: { ...token.original, $value: '2px' }};
        expect(spacingToEm.transform(updatedToken, {}, {})).toBe('2px');
      });

      it('should return the value as is if it is missing (to be caught by validation/formatter)', () => {
        const { $value, ...otherTokenProps } = token;
        expect(spacingToEm.transform(otherTokenProps, {}, {})).toBe(undefined);
      });
    })

    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        expect(spacingToEm.filter?.(token, {})).toBe(true);
      })

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, path: [ 'color', 'white' ]};
        expect(spacingToEm.filter?.(updatedToken, {})).toBe(false);
      });
    })
  });

  describe('typeConversion (typography/clean)', () => {
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
      original: {
        $value: { fontFamily: 'DM Sans'},
        $type: 'typography',
      },
      path: ['header, h1'],
      filePath: 'fake/filepath.json',
      isSource: true
    };

    describe('transforming tokens', () => {
      it('should remove letterSpacing from the value object, and return other variables unchanged', () => {
        const result = typeConversion.transform(token, {}, {}) as TypographyType;     
        expect(result).not.toHaveProperty('letterSpacing');
        expect(result.fontFamily).toBe('DM Sans');
        expect(result.fontSize).toBe(16);
        expect(result.lineHeight).toBe(1.25);
        expect(result.fontWeight).toBe(700);
      });

      it('should return original value if letterSpacing is already removed', () => {
        const noSpacingToken = { 
          ...token,
          $value: { fontSize: 16, fontFamily: 'DM Sans'},
          original: { ...token.original, $value: { fontSize: 16 }}
        }
        const result = typeConversion.transform(noSpacingToken, {}, {}) as TypographyType;     
        expect(result.fontSize).toBe(16);
        expect(result.fontFamily).toBe('DM Sans');
        expect(result).not.toHaveProperty('lineHeight');
        expect(result).not.toHaveProperty('fontWeight');
        expect(result).not.toHaveProperty('letterSpacing');
      })

      it('should return undefined if value is missing (to be caught by validation/formatter)', () => {
        const { $value, ...otherTokenProps } = token;
        expect(typeConversion.transform(otherTokenProps, {}, {})).toBe(undefined);
      });
    })
    
    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        expect(typeConversion.filter?.(token, {})).toBe(true);
      })

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, $type: 'color'};
        expect(typeConversion.filter?.(updatedToken, {})).toBe(false);
      });
    })
  });
});
