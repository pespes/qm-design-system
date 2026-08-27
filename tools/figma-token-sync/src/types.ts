export interface GitConfig {
  /** Branch the PR targets and is based on */
  baseBranch: string;
  /** Name of the branch the updated tokens are pushed to */
  branchName: string;
  /** Github url pointing to qm-design-system repo */
  repoRemoteUrl: string;
}

export interface SyncConfig {
  repoPath: string;
  tokenFilePath: string;
  git: GitConfig;
}

// Just determine the shape of the parsed Figma file for cli.ts - ui-tokens handles values
export interface FigmaExport {
  exportedAt: string;
  collections: unknown[];
  variables: unknown[];
  textVariables: unknown[];
  effectVariables?: unknown[];
}
