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
  semanticColourVar,
  primitiveColourVar,
  spacingVar,
  orphanVar,
  textStyleWithBoundVars,
  textStyleWithoutBoundVars,
  nonTextStyle,
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
});
