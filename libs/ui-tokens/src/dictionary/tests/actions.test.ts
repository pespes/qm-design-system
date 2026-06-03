import { describe, it, expect } from '@jest/globals';
import { type Dictionary, type TransformedToken } from 'style-dictionary/types';
import { validateTokens } from '../actions.js';

describe('validateTokens action', () => {
  describe('when platform is css', () => {
    const mockToken: TransformedToken = {
      name: 'color-base',
      $type: 'color',
      $value: '#00ba3b',
      isSource: true,
      path: ['color', 'base'],
      filePath: 'fake/filePath.json',
      original: {},
    };

    const mockToken2: TransformedToken = {
      name: 'text-header-h2',
      $type: 'typography',
      $value: {
        'font-weight': 700,
        'line-height': 1.25,
        'font-family': "'DM Sans', 'Arial'",
        'font-size': '1rem',
        'letter-spacing': '0em',
      },
      isSource: true,
      path: ['text', 'header', 'h2'],
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
        allTokens: [mockToken, mockToken2],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).not.toThrow();
    });

    it('should throw an error if a token has an undefined value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: undefined }],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a token has a null value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: null }],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a typography token has a nested null value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [
          {
            ...mockToken2,
            $value: { ...mockToken2.$value, 'font-weight': null },
          },
        ],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a typography token has a nested undefined value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [
          {
            ...mockToken2,
            $value: { ...mockToken2.$value, 'font-weight': undefined },
          },
        ],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a non-typography token has value of type object', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: {} }],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, cssConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a token has an unresolved value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: '{color.blue.500}' }],
        tokens: {},
        tokenMap: new Map(),
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
      $value: ['16px', { lineHeight: '20', fontWeight: '400' }],
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
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).not.toThrow();
    });

    it('should throw an error if a token has an undefined value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: undefined }],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a token has a null value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: null }],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a nested value is undefined', () => {
      const mockDictionary: Dictionary = {
        allTokens: [
          {
            ...mockToken,
            $value: [undefined, { lineHeight: '20', fontWeight: '400' }],
          },
        ],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });

    it('should throw an error if a token has an unresolved value', () => {
      const mockDictionary: Dictionary = {
        allTokens: [{ ...mockToken, $value: '{color.blue.500}' }],
        tokens: {},
        tokenMap: new Map(),
      };

      expect(() => {
        if (typeof validateTokens.do === 'function') {
          validateTokens.do(mockDictionary, {}, nativeConfig, {});
        }
      }).toThrow('Build failed: invalid token values found.');
    });
  });
});
