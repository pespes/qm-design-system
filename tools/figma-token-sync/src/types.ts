export interface GitConfig {
  /** Git remote name to push to */
  remote: string;
  /** Branch the PR targets and is based on */
  baseBranch: string;
  /** Name of the branch the updated tokens are pushed to */
  branchName: string;
  /** Github url pointing to qm-design-system repo */
  repoRemoteUrl: string;
}

export interface SyncConfig {
  repoPath: string;
  tokensRoot: string;
  git: GitConfig;
}
