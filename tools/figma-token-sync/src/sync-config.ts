import { resolve } from 'node:path';
import type { SyncConfig } from './types.js';

const currDir = import.meta.dirname;
const configDir = resolve(currDir, '..', '..');

export const loadConfig = (): SyncConfig => {
  return {
    repoPath: resolve(configDir, '../..'),
    tokenFilePath: 'libs/ui-tokens/tokens/figma-tokens.json',
    git: {
      baseBranch: 'development',
      branchName: 'test-token-figma-sync',
      repoRemoteUrl: 'git@github.com:Quartermaster-Inc/qm-design-system.git',
    },
  };
};
