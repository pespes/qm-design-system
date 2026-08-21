import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  allVariables,
  allTextStyles,
  primitiveCollection,
  themeCollection,
  componentCollection,
  THEME_ID,
  PRIMITIVE_ID,
  COMPONENT_ID,
  HOMEOWNER_MODE_ID,
  PRO_MODE_ID,
  textStyleWithBoundVars,
  textStyleWithoutBoundVars,
  nonTextStyle,
  semanticColourVar,
  primitiveColourVar,
  spacingVar,
  fontWeightVar,
  orphanVar,
  type TestCollection,
  type TestVariable,
} from './fixtures.js';

interface ExtractedVariable {
  id: string;
  name: string;
  collectionName: string;
  $value: unknown;
  $proValue?: unknown;
  $description?: string;
}

interface VariableAliasRef {
  type: 'VARIABLE_ALIAS';
  aliasName: string;
}

interface ExtractedText {
  id: string;
  name: string;
  fontFamily: VariableAliasRef | string;
  fontSize: VariableAliasRef | number;
  fontWeight: VariableAliasRef | string;
  lineHeight: number;
  letterSpacing: number;
}

// --- Mock figma global (hoisted so it's available before code.ts top-level executes) ---
const mockPostMessage = vi.hoisted(() => vi.fn());

const mockFigma = vi.hoisted(() => {
  const mock = {
    variables: {
      getLocalVariablesAsync: vi.fn(),
      getVariableCollectionByIdAsync: vi.fn(),
    },
    getLocalTextStylesAsync: vi.fn(),
    showUI: vi.fn(),
    ui: {
      onmessage: (() => Promise.resolve()) as (msg: {
        type: string;
      }) => Promise<void>,
      postMessage: mockPostMessage,
    },
  };
  vi.stubGlobal('figma', mock);
  vi.stubGlobal('__html__', '');
  return mock;
});

const collectionLookup: Record<string, TestCollection> = {
  [THEME_ID]: themeCollection,
  [PRIMITIVE_ID]: primitiveCollection,
  [COMPONENT_ID]: componentCollection,
};

// ----- Helpers ------
// Helper to reset all API calls to return expected fixtures
function resetMocks() {
  mockFigma.variables.getLocalVariablesAsync.mockResolvedValue(allVariables);
  mockFigma.variables.getVariableCollectionByIdAsync.mockImplementation(
    (id: string) => Promise.resolve(collectionLookup[id] ?? null),
  );
  mockFigma.getLocalTextStylesAsync.mockResolvedValue(allTextStyles);
}

// Mock figma.ui.onMessage/figma.ui.postMessage communication to trigger the extractAll() call in code.ts via Figma's
// onmessage handler (which returns type { type: 'EXTRACTION_READY', extraction: {collections, variables, textVariables}}
// on success or type { type: 'EXTRACTION_ERROR', message: string } on failure)
async function triggerExtraction() {
  await mockFigma.ui.onmessage({ type: 'REQUEST_EXTRACTION' });
  const errorCall = mockPostMessage.mock.calls.find(
    (c) => c[0]?.type === 'EXTRACTION_ERROR',
  );
  if (errorCall) throw new Error(errorCall[0].message);

  const successCall = mockPostMessage.mock.calls.find(
    (c) => c[0]?.type === 'EXTRACTION_READY',
  );
  if (!successCall) throw new Error('No message posted');
  return successCall[0].extraction;
}

describe('extractAll', () => {
  beforeEach(async () => {
    vi.resetModules();
    resetMocks();
    // Import code.ts so it assigns figma.ui.onmessage call.
    // @ts-expect-error code.ts --  Error because test treats code.js as a module to import
    await import('../code.js');
  });

  describe('collections', async () => {
    it('returns collections with expected shape', async () => {
      const result = await triggerExtraction();
      const returnedThemeColl = result.collections[1];
      expect(returnedThemeColl).toEqual({
        id: themeCollection.id,
        name: themeCollection.name,
        modes: themeCollection.modes,
      });
    });

    it('posts EXTRACTION_ERROR when a collection returns null', async () => {
      mockFigma.variables.getVariableCollectionByIdAsync.mockImplementation(
        (id: string) => {
          if (id === COMPONENT_ID) return Promise.resolve(null);
          return Promise.resolve(collectionLookup[id] ?? null);
        },
      );
      await expect(triggerExtraction()).rejects.toThrow(
        'Not all collections properly retrieved',
      );
    });
  });

  describe('variables', async () => {
    it('returns variables with an expected shape', async () => {
      const result = await triggerExtraction();
      const primitiveVar = result.variables[0];
      expect(primitiveVar).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        collectionName: expect.any(String),
        $description: expect.any(String),
      });
      const valueType = typeof primitiveVar.$value;
      expect(['string', 'number', 'object']).toContain(valueType);
    });

    it('returns literal value for primitive variable', async () => {
      const result = await triggerExtraction();
      const primitiveColour: ExtractedVariable = result.variables.find(
        (v: { id: string }) => v.id === primitiveColourVar.id,
      );
      expect(primitiveColour).toBeDefined();
      expect(primitiveColour.$value).toEqual({ r: 0, g: 0.4, b: 1, a: 1 });

      const primitiveSpacing: ExtractedVariable = result.variables.find(
        (v: { id: string }) => v.id === spacingVar.id,
      );
      expect(primitiveSpacing).toBeDefined();
      expect(primitiveSpacing.$value).toBe(16);
    });

    it('filters out variables not belonging to a known collection', async () => {
      const result = await triggerExtraction();
      const ids = result.variables.map((v: { id: string }) => v.id);
      expect(ids).not.toContain(orphanVar.id);
    });

    it('throws an error when a variable value is invalid', async () => {
      const invalidVar = {
        id: 'var:font-family-sans',
        name: 'fontFamily/sans',
        variableCollectionId: PRIMITIVE_ID,
        valuesByMode: {
          [HOMEOWNER_MODE_ID]: undefined,
        },
      };
      mockFigma.variables.getLocalVariablesAsync.mockResolvedValue([
        invalidVar,
      ]);

      await mockFigma.ui.onmessage({ type: 'REQUEST_EXTRACTION' });
      await expect(triggerExtraction()).rejects.toThrow(
        `"${invalidVar.name}" has no value. Update variable before syncing.`,
      );
    });

    describe('semantic variables', async () => {
      it('attaches aliasName to semantic $value', async () => {
        const result = await triggerExtraction();
        const semanticColour: ExtractedVariable = result.variables.find(
          (v: { id: string }) => v.id === semanticColourVar.id,
        );
        expect(semanticColour).toBeDefined();
        expect(semanticColour.$value).toEqual({
          type: 'VARIABLE_ALIAS',
          id: 'var:prim-colour',
          aliasName: 'color/blue/500',
        });
      });

      it('throws an error when an aliased variable does not belong to the returned variable list', async () => {
        const updatedSemColourVar: TestVariable = {
          ...semanticColourVar,
          valuesByMode: {
            ...semanticColourVar.valuesByMode,
            [PRO_MODE_ID]: {
              type: 'VARIABLE_ALIAS',
              id: 'fake-id',
            },
          },
        };
        const updatedVars = allVariables.map((v) =>
          v.id === semanticColourVar.id ? updatedSemColourVar : v,
        );
        mockFigma.variables.getLocalVariablesAsync.mockResolvedValue(
          updatedVars,
        );

        await expect(triggerExtraction()).rejects.toThrow(
          `"${updatedSemColourVar.name}" references an unresolved alias. Update variable binding before syncing.`,
        );
      });

      it('throws an error when an aliased variable does not belong to an extracted collection', async () => {
        const updatedSemColourVar: TestVariable = {
          ...semanticColourVar,
          valuesByMode: {
            ...semanticColourVar.valuesByMode,
            [PRO_MODE_ID]: {
              type: 'VARIABLE_ALIAS',
              id: 'var:orphan',
            },
          },
        };
        const updatedVars = allVariables.map((v) =>
          v.id === semanticColourVar.id ? updatedSemColourVar : v,
        );
        mockFigma.variables.getLocalVariablesAsync.mockResolvedValue(
          updatedVars,
        );

        await expect(triggerExtraction()).rejects.toThrow(
          `"${updatedSemColourVar.name}" references an unresolved alias. Update variable binding before syncing.`,
        );
      });

      describe('in Theme collection', async () => {
        it('includes $proValue when it differs from homeowner', async () => {
          const result = await triggerExtraction();
          const semanticColour: ExtractedVariable = result.variables.find(
            (v: { id: string }) => v.id === semanticColourVar.id,
          );
          expect(semanticColour.$proValue).toEqual({
            type: 'VARIABLE_ALIAS',
            id: 'var:prim-colour-alt',
            aliasName: 'color/green/500',
          });
        });

        it('omits $proValue when pro value matches homeowner', async () => {
          // match Pro mode's variableId to Homeowner mode's variableId
          const updatedSemColourVar: TestVariable = {
            ...semanticColourVar,
            valuesByMode: {
              ...semanticColourVar.valuesByMode,
              [PRO_MODE_ID]: {
                type: 'VARIABLE_ALIAS',
                id: (
                  semanticColourVar.valuesByMode[
                    HOMEOWNER_MODE_ID
                  ] as VariableAlias
                ).id,
              },
            },
          };
          const updatedVarList = allVariables.map((v) =>
            v.id === semanticColourVar.id ? updatedSemColourVar : v,
          );
          mockFigma.variables.getLocalVariablesAsync.mockResolvedValue(
            updatedVarList,
          );

          const result = await triggerExtraction();
          const semColour = result.variables.find(
            (v: { id: string }) => v.id === semanticColourVar.id,
          );
          expect(semColour.$proValue).toBeUndefined();
        });
      });
    });
  });

  describe('text styles', async () => {
    it('filters out text styles not beginning with "text/"', async () => {
      const result = await triggerExtraction();
      const nonText = result.textVariables.find(
        (t: { id: string }) => t.id === nonTextStyle.id,
      );
      expect(nonText).toBeUndefined();
    });

    it('returns text styles with an expected shape', async () => {
      const result = await triggerExtraction();
      const textStyle = result.textVariables[0];

      //fontFamily/fontSize/fontStyle to be tested in following tests - assert remainder is expected shape
      expect(textStyle).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        lineHeight: expect.any(Number),
        letterSpacing: expect.any(Number),
      });
    });

    it('resolves boundVariable aliases on textVariables', async () => {
      const result = await triggerExtraction();

      const textVariableWithAlias: ExtractedText = result.textVariables.find(
        (t: { id: string }) => t.id === textStyleWithBoundVars.id,
      );
      expect(textVariableWithAlias.fontFamily).toEqual({
        type: 'VARIABLE_ALIAS',
        aliasName: 'fontFamily/sans',
      });
      expect(textVariableWithAlias.fontSize).toEqual({
        type: 'VARIABLE_ALIAS',
        aliasName: 'fontSize/md',
      });
      expect(textVariableWithAlias.fontWeight).toBe(700);
    });

    it('falls back to hardcoded values when no boundVariables', async () => {
      const result = await triggerExtraction();
      const textVariableNoAlias = result.textVariables.find(
        (t: { id: string }) => t.id === textStyleWithoutBoundVars.id,
      ) as ExtractedText;

      expect(textVariableNoAlias.fontFamily).toBe(
        textStyleWithoutBoundVars.fontName.family,
      );
      expect(textVariableNoAlias.fontWeight).toBe(700);
      expect(textVariableNoAlias.fontSize).toBe(
        textStyleWithoutBoundVars.fontSize,
      );
    });

    it('falls back to hardcoded value when boundVariable resolves to null', async () => {
      const unresolvedTextStyle = {
        ...textStyleWithoutBoundVars,
        boundVariables: {
          ...textStyleWithoutBoundVars.boundVariables,
          fontFamily: { type: 'VARIABLE_ALIAS', id: 'var:fake' }, // use a variable that won't resolve to a value
        },
      };
      mockFigma.getLocalTextStylesAsync.mockResolvedValue([
        unresolvedTextStyle,
      ]);

      const result = await triggerExtraction();
      const textVar = result.textVariables[0];
      expect(textVar.fontFamily).toBe(
        textStyleWithoutBoundVars.fontName.family,
      );
    });

    it('throws an error when there is no fontStyle boundVariable', async () => {
      const unresolvedTextStyle = {
        ...textStyleWithoutBoundVars,
        boundVariables: {},
      };
      mockFigma.getLocalTextStylesAsync.mockResolvedValue([
        unresolvedTextStyle,
      ]);

      await expect(triggerExtraction()).rejects.toThrow(
        `Text style "text/heading/lg" has no variable bound to fontStyle - bind a fontStyle variable named fontStyle/<weightNumber>.`,
      );
    });

    it('throws an error fontStyle variable is incorrectly named', async () => {
      // Text style is untouched and still binds fontStyle correctly - only the
      // variable it points at is renamed to a weight word instead of a number
      const misnamedFontStyle = {
        ...fontWeightVar,
        name: 'fontStyle/Regular',
      };
      mockFigma.variables.getLocalVariablesAsync.mockResolvedValue(
        allVariables.map((v) =>
          v.id === fontWeightVar.id ? misnamedFontStyle : v,
        ),
      );
      mockFigma.getLocalTextStylesAsync.mockResolvedValue([
        textStyleWithBoundVars,
      ]);

      await expect(triggerExtraction()).rejects.toThrow(
        `Text style "text/body/md" binds fontStyle to "fontStyle/Regular", which must follow naming convetion "fontStyle/<weight>".`,
      );
    });

    it('throws an error when boundVariable resolves to null and no fallback', async () => {
      const unresolvedTextStyle = {
        ...textStyleWithoutBoundVars,
        boundVariables: {
          ...textStyleWithoutBoundVars.boundVariables,
          fontSize: { type: 'VARIABLE_ALIAS', id: 'var:fake' }, // use a variable that won't resolve to a value
        },
        fontSize: undefined,
      };

      mockFigma.getLocalTextStylesAsync.mockResolvedValue([
        unresolvedTextStyle,
      ]);

      await expect(triggerExtraction()).rejects.toThrow(
        `"${unresolvedTextStyle.name}" references an unresolved alias`,
      );
    });

    it('converts PERCENT value to decimal and returns raw PIXEL value for lineHeight / letterSpacing', async () => {
      const result = await triggerExtraction();
      const bound: ExtractedText = result.textVariables.find(
        (t: { id: string }) => t.id === textStyleWithBoundVars.id,
      );

      expect(bound.lineHeight).toBe(
        textStyleWithBoundVars.lineHeight.value / 100,
      );
      expect(bound.letterSpacing).toBe(
        textStyleWithBoundVars.letterSpacing.value,
      );
    });

    it('throws an error when lineHeight has unexpected unit', async () => {
      const invalidTextStyle = {
        ...textStyleWithBoundVars,
        lineHeight: { unit: 'EM', value: 1.5 },
      };
      mockFigma.getLocalTextStylesAsync.mockResolvedValue([invalidTextStyle]);

      await expect(triggerExtraction()).rejects.toThrow(
        'LineHeight/LetterSpacing must be PERCENT, PX, or AUTO',
      );
    });
  });
});
