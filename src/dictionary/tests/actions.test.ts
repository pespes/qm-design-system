import { describe, it, expect } from '@jest/globals';
import { type Dictionary, type TransformedToken } from 'style-dictionary/types';
import { validateTokens } from '../actions.js';

describe('validateTokens action', () => {
  it('should not throw an error if all tokens have values', () => {     
    const mockToken: TransformedToken[] = [
      {
        name: 'color-primary',
        $type: 'color',
        $value: '#00ba3b',
        isSource: true,
        path: ['color', 'primary'],
        filePath: 'fake/filePath.json',
        original: {},
      },
    ];

    const mockDictionary: Dictionary = {
      allTokens: mockToken,
      tokens: {},
      tokenMap: new Map()
    };

    expect(() => {
      if (typeof validateTokens.do === 'function') {
        validateTokens.do(mockDictionary, {}, {}, {});
      }
    }).not.toThrow();
  });

  it ('should throw an error if a token has an undefined value', () => {
    const mockToken: TransformedToken[] = [
      {
        name: 'color-primary',
        $type: 'color',
        isSource: true,
        path: ['color', 'primary'],
        filePath: 'fake/filePath.json',
        original: {},
      },
    ];

    const mockDictionary: Dictionary = {
      allTokens: mockToken,
      tokens: {},
      tokenMap: new Map()
    };

    expect(() => {
      if (typeof validateTokens.do === 'function') {
        validateTokens.do(mockDictionary, {}, {}, {});
      }
    }).toThrow('Build failed: invalid token values found.');
  })

  it ('should throw an error if a token has an undefined value', () => {
    const mockToken: TransformedToken[] = [
      {
        name: 'color-primary',
        $type: 'color',
        $value: null,
        isSource: true,
        path: ['color', 'primary'],
        filePath: 'fake/filePath.json',
        original: {},
      },
    ];

    const mockDictionary: Dictionary = {
      allTokens: mockToken,
      tokens: {},
      tokenMap: new Map()
    };

    expect(() => {
      if (typeof validateTokens.do === 'function') {
        validateTokens.do(mockDictionary, {}, {}, {});
      }
    }).toThrow('Build failed: invalid token values found.');
  })
})
