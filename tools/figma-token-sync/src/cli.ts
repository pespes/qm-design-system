import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { loadConfig } from './sync-config.js';

const DEFAULT_EXPORT_FILENAME = 'figma-tokens.json';
const COMMIT_MESSAGE = 'fix(ui-tokens): update token values';

// Helper for running a git command in the given directory
export const git = (cwd: string, args: string[]): string =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
  }).trim();

const getArgs = (): {
  file: string | undefined;
  dryRun: boolean | undefined;
} => {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'dry-run': { type: 'boolean', default: false },
      file: { type: 'string' },
    },
  });
  return { file: values.file, dryRun: values['dry-run'] };
};

const isTreeClean = (cwd: string): boolean => {
  const status = git(cwd, ['status', '--porcelain']);
  return status.length === 0;
};

const endAndLog = (message: string) => {
  console.error(`\n ${message}`);
  process.exit(1);
};

export const resolveInputPath = (filePath: string): string =>
  filePath.startsWith('~') ? filePath.replace('~', homedir()) : filePath;

export const confirmCleanTree = (cwd: string) => {
  if (!isTreeClean(cwd)) {
    endAndLog('Working tree has uncommitted changes. Commit/stash them first.');
  }
};

export const resolveAndParseTokenFile = (args: {
  file: string | undefined;
}): unknown => {
  const inputPath = args.file
    ? resolveInputPath(args.file)
    : join(homedir(), 'Downloads', DEFAULT_EXPORT_FILENAME);
  try {
    return JSON.parse(readFileSync(inputPath, 'utf-8'));
  } catch {
    endAndLog(`No extraction file at ${inputPath} or not valid JSON`);
  }
};

export const verifyRemote = (cwd: string, expectedRemoteUrl: string): void => {
  const remoteUrl = git(cwd, ['remote', 'get-url', 'origin']);
  if (remoteUrl !== expectedRemoteUrl) {
    endAndLog(
      `Remote "origin" points to ${remoteUrl}, expected ${expectedRemoteUrl}.`,
    );
  }
};

export const getCurrentRef = (cwd: string): string => {
  const branch = git(cwd, ['branch', '--show-current']).trim();
  return branch || git(cwd, ['rev-parse', 'HEAD']); // fallback to commit SHA if in detached HEAD state
};

export const checkoutSyncBranch = (
  cwd: string,
  baseBranch: string,
  branchName: string,
): void => {
  git(cwd, ['fetch', 'origin', baseBranch, branchName]);
  git(cwd, ['checkout', '-B', branchName, `origin/${branchName}`]);
};

export const rebaseOntoBase = (
  cwd: string,
  baseBranch: string,
  branchName: string,
): void => {
  // Rebase onto base branch to drop commits already merged into development.
  try {
    git(cwd, ['rebase', `origin/${baseBranch}`]);
  } catch (error) {
    git(cwd, ['rebase', '--abort']);
    endAndLog(
      `Failed to rebase ${branchName} onto ${baseBranch}: ${(error as Error).message}. Resolve conflicts manually and re-run.`,
    );
  }
};

const writeTokenFile = (
  repoPath: string,
  tokensRoot: string,
  parsedFile: unknown,
): void => {
  // (Currently just dumping JSON files into a test json file)
  const outPath = resolve(
    repoPath,
    tokensRoot,
    'primitives',
    'test.tokens.json',
  );
  writeFileSync(outPath, JSON.stringify(parsedFile, null, 2), 'utf-8');
};

const buildTokens = (cwd: string): void => {
  // Confirm a broken build does not get pushed
  console.log('\nRunning build:tokens…');
  execFileSync('pnpm', ['build:tokens'], { cwd, stdio: 'inherit' });
};

export const commitAndPushTokens = (
  cwd: string,
  tokensRoot: string,
  branchName: string,
): void => {
  try {
    git(cwd, ['add', tokensRoot]);
    git(cwd, ['commit', '-m', COMMIT_MESSAGE]);
    git(cwd, ['push', '--force', 'origin', branchName]);
  } catch (error) {
    endAndLog(`Failed to commit / push tokens: ${(error as Error).message}`);
  }
};

export const restoreOriginalBranch = (
  cwd: string,
  originalRef: string,
): void => {
  try {
    git(cwd, ['checkout', originalRef]);
  } catch (error) {
    console.error(
      `\nWarning: Could not restore original branch "${originalRef}"
        \nYou may need to manually run: git checkout <your-branch-name> to return
      `,
    );
  }
};

export const runScript = (): void => {
  const args = getArgs();
  const config = loadConfig();
  const { git: gitConfig } = config;
  const cwd = config.repoPath;
  process.chdir(cwd);

  // 1. Before anything fires, confirm working tree is clean so only token updates are committed.
  confirmCleanTree(cwd);

  // 2. Locate + parse the exported file.
  const parsedFile = resolveAndParseTokenFile(args);

  // 3. Build DTCG trees (dry-run stops after reporting the would-be writes).
  //  TBD for building tokens, for now just confirm dry run returns at this point.

  if (args.dryRun) {
    console.log(
      'nothing to show yet, but will iterate through lines of DTCG tokens when converted',
    );
    return;
  }

  // 4. Verify remote points to expected SSH URL.
  verifyRemote(cwd, gitConfig.repoRemoteUrl);

  // 5. Save current branch ref to restore post checkout / commit / push
  const originalRef = getCurrentRef(cwd);

  try {
    // 6. Checkout token sync branch, then rebase onto the base branch.
    checkoutSyncBranch(cwd, gitConfig.baseBranch, gitConfig.branchName);
    rebaseOntoBase(cwd, gitConfig.baseBranch, gitConfig.branchName);

    // 7. Write tokens. (Currently just dumping JSON files into a test json file)
    writeTokenFile(config.repoPath, config.tokensRoot, parsedFile);

    // 8. Confirm a broken build does not get pushed
    buildTokens(cwd);

    if (isTreeClean(cwd)) {
      console.log('\nNo token changes vs. base — nothing to sync.');
      return;
    }

    // 9. Git add / commit / push.
    commitAndPushTokens(cwd, config.tokensRoot, gitConfig.branchName);

    console.log(`\n✔ Pushed ${gitConfig.branchName}.`);
  } finally {
    // 10. Restore the original branch, whatever happened.
    restoreOriginalBranch(cwd, originalRef);
  }
};
