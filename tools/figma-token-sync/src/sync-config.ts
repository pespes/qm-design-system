import { resolve } from 'node:path';
import type { SyncConfig } from './types.js';

const currDir = import.meta.dirname;
const configDir = resolve(currDir, '..', '..');

export const loadConfig = (): SyncConfig => {
  return {
    repoPath: resolve(configDir, '../..'),
    tokensRoot: 'libs/ui-tokens/tokens',
    git: {
      remote: 'origin',
      baseBranch: 'development',
      branchName: 'token-figma-sync',
      repoRemoteUrl: 'git@github.com:Quartermaster-Inc/qm-design-system.git',
    },
  };
};
