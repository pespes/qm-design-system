import { describe, it, expect } from '@jest/globals';
import { type Dictionary, type TransformedToken } from 'style-dictionary/types';
import { validateTokens } from '../actions.js';

describe('validateTokens action', () => {
  describe('when platform is css', () => {
    const mockToken: TransformedToken = {
      name: 'color-primary',
      $type: 'color',
      $value: '#00ba3b',
      isSource: true,
      path: ['color', 'primary'],
      filePath: 'fake/filePath.json',
      original: {},
    };
    const cssConfig = {
      platforms: {
        css: {},
      },
    };
    
    it('should not throw an error if all tokens have values', () => {
      const mockDictionary: Dictionary = {
        allTokens: [mockToken],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).not.toThrow();
    });

    it ('should throw an error if a token has an undefined value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: undefined }],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it ('should throw an error if a token has a null value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: null }],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it ('should throw an error if a token has value of type object', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: {} }],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });
  });

  describe('when platform is native', () => {
    const mockToken: TransformedToken = {
      name: 'fontSize-h1',
      $type: 'typography',
      $value: [ '16px', { lineHeight: '20', fontWeight: '400' }],
      isSource: true,
      path: ['fontSize', 'h1'],
      filePath: 'fake/filePath.json',
      original: {},
    };
    const nativeConfig = {
      platforms: {
        native: {},
      },
    };
    it('should not throw an error if all tokens have values', () => {
      const mockDictionary: Dictionary = {
        allTokens: [mockToken],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).not.toThrow();
    });

    it ('should throw an error if a token has an undefined value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: undefined }],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it ('should throw an error if a token has a null value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: null }],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it ('should throw an error if a nested value is undefined', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: [ undefined, { lineHeight: '20', fontWeight: '400' }] }],
        tokens: {},
        tokenMap: new Map()
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });
  })
})
