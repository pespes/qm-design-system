import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { loadConfig } from './sync-config.js';

const DEFAULT_EXPORT_FILENAME = 'figma-tokens.json';
const COMMIT_MESSAGE = 'fix(ui-tokens): update token values';

// Helper for running a git command in the given directory
const git = (cwd: string, args: string[]): string =>
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

const fail = (message: string) => {
  console.error(`\n✖ ${message}`);
  process.exit(1);
};

const parseTokenFile = (inputPath: string) => {
  try {
    return JSON.parse(readFileSync(inputPath, 'utf-8'));
  } catch {
    fail(`No extraction file at ${inputPath} or not valid JSON`);
  }
};

const runScript = (): void => {
  const args = getArgs();
  const config = loadConfig();
  const { git: gitConfig } = config;
  const cwd = config.repoPath;

  // 1. Before anything fires, confirm working tree is clean so only token updates are committed.
  if (!isTreeClean(cwd)) {
    fail('Working tree has uncommitted changes. Commit/stash them first.');
  }

  // 2. Locate + parse the exported file.
  const fileName = args.file ?? DEFAULT_EXPORT_FILENAME;
  const inputPath = join(homedir(), 'Downloads', fileName);
  const parsedFile = parseTokenFile(inputPath);

  // 3. Build DTCG trees (dry-run stops after reporting the would-be writes).
  //  TBD for building tokens, for now just confirm dry run returns at this point.

  if (args.dryRun) {
    console.log(
      'nothing to show yet, but will iterate through lines of DTCG tokens when converted',
    );
    return;
  }

  // 4. Verify remote points to expected SSH URL.
  const remoteUrl = git(cwd, ['remote', 'get-url', gitConfig.remote]);
  if (remoteUrl !== gitConfig.repoRemoteUrl) {
    fail(
      `Remote "${gitConfig.remote}" points to ${remoteUrl}, expected ${gitConfig.repoRemoteUrl}.`,
    );
  }

  // 5. Save current branch ref to restore post checkout / commit / push
  const originalRef = (() => {
    const branch = git(cwd, ['branch', '--show-current']).trim();
    return branch || git(cwd, ['rev-parse', 'HEAD']); // fallback to commit SHA if in detached HEAD state
  })();

  try {
    // 6. Checkout sync branch — use existing remote version if available, otherwise create from base.
    git(cwd, [
      'fetch',
      gitConfig.remote,
      gitConfig.baseBranch,
      gitConfig.branchName,
    ]);

    // Try to checkout from token branch; fall back to base branch if it doesn't exist
    try {
      git(cwd, [
        'checkout',
        '-B',
        gitConfig.branchName,
        `${gitConfig.remote}/${gitConfig.branchName}`,
      ]);
    } catch {
      git(cwd, [
        'checkout',
        '-B',
        gitConfig.branchName,
        `${gitConfig.remote}/${gitConfig.baseBranch}`,
      ]);
    }

    // 7. Write tokens. (Currently just dumping JSON files into a test json file)
    const outPath = resolve(
      config.repoPath,
      config.tokensRoot,
      'primitives',
      'test.tokens.json',
    );
    writeFileSync(outPath, JSON.stringify(parsedFile, null, 2), 'utf-8');

    // 8. Build gate — a broken extraction never becomes a PR.
    console.log('\nRunning build:tokens…');
    execFileSync('pnpm', ['build:tokens'], { cwd, stdio: 'inherit' });

    if (isTreeClean(cwd)) {
      console.log('\nNo token changes vs. base — nothing to sync.');
      return;
    }

    // // 9. Git add / commit / push.
    try {
      git(cwd, ['add', config.tokensRoot]);

      git(cwd, ['commit', '-m', COMMIT_MESSAGE]);
      git(cwd, ['push', gitConfig.remote, gitConfig.branchName]);
    } catch (error) {
      fail(`Failed to commit / push tokens: ${(error as Error).message}`);
    }

    console.log(`\n✔ Pushed ${gitConfig.branchName}.`);
  } finally {
    // 10. Restore the designer's original branch, whatever happened.
    git(cwd, ['checkout', originalRef]);
  }
};

runScript();
