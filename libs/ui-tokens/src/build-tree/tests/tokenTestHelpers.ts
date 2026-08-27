import type {
  TokenTree,
  FigmaVariable,
  FigmaTextVariable,
  FigmaEffectVariable,
  FigmaExport,
  DtcgToken,
} from '../types.js';
import { buildDtcgTrees } from '../buildTokenTree.js';
import { basicFixture } from './fixture.js';

type allVariableTypes = FigmaVariable | FigmaTextVariable | FigmaEffectVariable;

export const build = (variable: allVariableTypes, type?: string) => () =>
  buildDtcgTrees(withVariable(basicFixture, variable, type));

// Helper to append variables onto Figma export
export const withVariable = (
  fixture: FigmaExport,
  variable: FigmaVariable | FigmaTextVariable | FigmaEffectVariable,
  type?: string,
): FigmaExport => {
  if (type === 'text') {
    return {
      ...fixture,
      textVariables: [...fixture.textVariables, variable as FigmaTextVariable],
    };
  } else if (type === 'shadow') {
    return {
      ...fixture,
      effectVariables: [
        ...(fixture.effectVariables ?? []),
        variable as FigmaEffectVariable,
      ],
    };
  }
  return {
    ...fixture,
    variables: [...fixture.variables, variable as FigmaVariable],
  };
};

// retrieve token from tree based on path segments
export const getToken = (tree: TokenTree, path: string): DtcgToken => {
  const [next, ...rest] = path.split('/');
  const nextPathNode = tree[next as string];
  if (rest.length === 0) {
    return nextPathNode as DtcgToken;
  }
  return getToken(nextPathNode as TokenTree, rest.join('/'));
};
