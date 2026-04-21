import { describe, it, expect } from "@jest/globals";
import type { DesignToken } from "style-dictionary/types";
import { typographySplitParser } from "../parser.js";

describe('typographySplitParser', () => {
const typographyToken: DesignToken = {
    "h1": {
      "$type": 'typography',
      "$value": {
        "fontSize": 14,
        "fontFamily": 'sans serif',
        "fontWeight": 500,
        "letterSpacing": 0,
      },
    }
  };

  it('should create 2 separate tokens when taking in a semantic typography token', () => {
    const contents = JSON.stringify(typographyToken);
    const result = typographySplitParser.parser({ contents });
    expect(result).toEqual({
      h1: {
        $type: 'typography',
        $value: {
          fontSize: 14,
          fontFamily: 'sans serif',
          fontWeight: 500,
          letterSpacing: 0,
        },
      },
      ['h1-tracking']: {
        $type: 'spacing',
        $value: 0,
        comment: 'letter spacing for h1'
      }
    });
  });


  it('should return original when no letterSpacing is present', () => {
    const typographyToken: DesignToken = {
    "h1": {
      "$type": 'typography',
      "$value": {
        "fontSize": 14,
        "fontFamily": 'sans serif',
        "fontWeight": 500,
      },
    }
  };
    const contents = JSON.stringify(typographyToken);
    const result = typographySplitParser.parser({ contents });
    expect(result).toEqual({
      h1: {
        $type: 'typography',
        $value: {
          fontSize: 14,
          fontFamily: 'sans serif',
          fontWeight: 500,
        },
      },
    });
  });
});