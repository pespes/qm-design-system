import { describe, it, expect } from '@jest/globals';
import { type TransformedToken } from 'style-dictionary/types';
import { spacingToRem, spacingToEm, typeConversion } from '../transforms.js';

type TypographyType = {
  fontFamily: string;
  fontSize: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
}

describe('Custom Transforms', () => {
  
  describe('spacingToRem', () => {
    const token: TransformedToken = {
      name: 'spacing-100',
      path: ['spacing', '100'],
      original: {
          $value: 16,
          $type: 'dimension',
      },
      $value: 16,
      $type: 'dimension',
      isSource: true,
      filePath: 'fake/filepath.json'
    };

    describe('transforming tokens', () => {
      it('should convert unitless numbers to rem string', () => {
        // Transform takes arguments: token, options, platform
        const result = spacingToRem.transform(token, {}, {});
        expect(result).toBe('1rem');
      });

      it('should handle decimal values correctly', () => {
        const updatedToken = { ...token, $value: 20, original: { ...token.original, $value: 20 }};
        expect(spacingToRem.transform(updatedToken, {}, {})).toBe('1.25rem');
      });

      it('should handle a zero value correctly', () => {
        const updatedToken = { ...token, $value: 0, original: { ...token.original, $value: 0 }};
        expect(spacingToRem.transform(updatedToken, {}, {})).toBe('0rem');
      });

      it('should return the original value if it is not a number', () => {
        const updatedToken = { ...token, $value: '2rem', original: { ...token.original, $value: '2rem' }};
        expect(spacingToRem.transform(updatedToken, {}, {})).toBe('2rem');
      });

      // the filtering out of any invalid css will happen in the Format, just ensure it doesn't break
      it('should return undefined if the value is missing', () => {
        const { $value, ...otherTokenProps } = token
        expect(spacingToRem.transform(otherTokenProps, {}, {})).toBe(undefined);
      });
    })

    describe('filtering tokens', () => {
      it('should filter any tokens that shold be converted', () => {
        // Filter takes arguments: token, options
        expect(spacingToRem.filter?.(token, {})).toBe(true);
      })

      it('should filter out any tokens that should not be converted', () => {
        const updatedToken = { ...token, path: [ 'color', 'white' ]};
        expect(spacingToRem.filter?.(updatedToken, {})).toBe(false);
      });
    })
  });

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

      it('should return undefined if the value is missing', () => {
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

      it('should return undefined if the value is missing', () => {
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