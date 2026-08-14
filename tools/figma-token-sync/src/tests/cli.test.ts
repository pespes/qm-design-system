import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  git,
  confirmCleanTree,
  getCurrentRef,
  resolveAndParseTokenFile,
  verifyRemote,
  checkoutSyncBranch,
  rebaseOntoBase,
  commitAndPushTokens,
} from '../cli.js';
import { loadConfig } from '../sync-config.js';

describe('CLI testing', () => {
  let repoDir: string;
  const errorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  const TOKEN_FILE_NAME = 'test.tokens.json';
  const TOKEN_FILE_CONTENT = { color: { primary: '#FF0000' } };
  const TOKEN_FILE_CONTENT_UPDATED = { color: { primary: '#00FF00' } };
  const TOKEN_FILE_CONTENT_CONFLICT = { color: { primary: '#0000FF' } };

  // Create fake credentials on repo for git commands
  const setIdentity = (cwd: string) => {
    git(cwd, ['config', 'user.email', 'test@example.com']);
    git(cwd, ['config', 'user.name', 'Test']);
  };

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('confirmCleanTree', () => {
    beforeAll(() => {
      repoDir = mkdtempSync(join(tmpdir(), 'clean-tree-dir'));
      git(repoDir, ['init']);
    });

    afterAll(() => {
      rmSync(repoDir, { recursive: true, force: true });
    });

    it('does not exit when the working tree is clean', () => {
      expect(() => confirmCleanTree(repoDir)).not.toThrow();
    });

    it('exits when the working tree has uncommitted changes', () => {
      writeFileSync(join(repoDir, 'untrackedFile.txt'), 'hello');

      expect(() => confirmCleanTree(repoDir)).toThrow(/process\.exit/);
      expect(errorSpy).toHaveBeenCalledWith(
        '\n Working tree has uncommitted changes. Commit/stash them first.',
      );
    });
  });

  describe('resolveAndParseTokenFile', () => {
    beforeAll(() => {
      repoDir = mkdtempSync(join(tmpdir(), 'find-file-dir'));
      // changes value of process.env variable to not point at ~/Downloads folder.
      // Needed since homedir() reads $HOME, which should now point to temp folder instead
      // Cleared in afterAll() at end of describe block
      vi.stubEnv('HOME', repoDir);
    });

    afterAll(() => {
      vi.unstubAllEnvs();
      rmSync(repoDir, { recursive: true, force: true });
    });

    it('exits when no file is found at path', () => {
      const inputPath = join(repoDir, 'not-a-real-file.json');
      expect(() =>
        resolveAndParseTokenFile({
          file: inputPath,
        }),
      ).toThrow(/process\.exit/);
      expect(errorSpy).toHaveBeenCalledWith(
        `\n No extraction file at ${inputPath} or not valid JSON`,
      );
    });

    it('falls back to Downloads when no --file is given', () => {
      const downloadsDir = join(repoDir, 'Downloads');
      mkdirSync(downloadsDir, { recursive: true });
      writeFileSync(
        join(downloadsDir, 'figma-tokens.json'),
        JSON.stringify(TOKEN_FILE_CONTENT),
      );

      const result = resolveAndParseTokenFile({ file: undefined });
      expect(result).toEqual(TOKEN_FILE_CONTENT);
    });

    it('reads from the path given via --file', () => {
      const filePath = join(repoDir, 'custom-export.json');
      writeFileSync(filePath, JSON.stringify(TOKEN_FILE_CONTENT));

      const result = resolveAndParseTokenFile({ file: filePath });
      expect(result).toEqual(TOKEN_FILE_CONTENT);
    });
  });

  describe('verifyRemote', () => {
    // helper to set remote url prior to firing a get-url
    const setRemoteUrl = (url: string) =>
      git(repoDir, ['remote', 'set-url', 'origin', url]);
    const testRepoRemoteUrl = 'git@github.com:test-org/test-repo.git';

    beforeAll(() => {
      repoDir = mkdtempSync(join(tmpdir(), 'verify-remote-dir'));
      git(repoDir, ['init']);
      git(repoDir, ['remote', 'add', 'origin', testRepoRemoteUrl]);
    });

    afterAll(() => {
      rmSync(repoDir, { recursive: true, force: true });
    });

    it('does not exit when remoteUrl matches expectedRemoteUrl', () => {
      setRemoteUrl(testRepoRemoteUrl);
      expect(() => verifyRemote(repoDir, testRepoRemoteUrl)).not.toThrow();
    });

    it('fails when remoteUrl does not match expectedRemoteUrl', () => {
      const wrongUrl = 'git@github.com:wrong-org/wrong-repo.git';
      setRemoteUrl(wrongUrl);
      expect(() => verifyRemote(repoDir, testRepoRemoteUrl)).toThrow(
        /process\.exit/,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        `\n Remote "origin" points to ${wrongUrl}, expected ${testRepoRemoteUrl}.`,
      );
    });
  });

  describe('getCurrentRef', () => {
    beforeAll(() => {
      repoDir = mkdtempSync(join(tmpdir(), 'current-ref-dir'));
      git(repoDir, ['init', '-b', 'main']);
      setIdentity(repoDir);
      // create empty commit so when in a detached state, can still find a commit sha
      git(repoDir, ['commit', '--allow-empty', '-m', 'init commit']);
    });

    afterAll(() => {
      rmSync(repoDir, { recursive: true, force: true });
    });

    it('returns the name of the current branch', () => {
      git(repoDir, ['checkout', 'main']);
      expect(getCurrentRef(repoDir)).toBe('main');
    });

    it('falls back to the commit SHA when HEAD is detached', () => {
      // pull commit sha for comparison
      const sha = git(repoDir, ['rev-parse', 'HEAD']);
      git(repoDir, ['checkout', '--detach', sha]);
      // in detached HEAD state, so getCurrentRef should return commit sha instead
      expect(getCurrentRef(repoDir)).toBe(sha);
    });
  });

  // ---- Git Workflow - firing checkoutSyncBranch / rebaseOntoBase / commitAndPushTokens ---
  describe('checkout, rebase and commit/push flow', () => {
    const tempDirs: string[] = []; // track dirs created to remove at end of tests

    // pull config used to for github workflow (minus repoPath which resolves to real qm-design-system root - creating temp directories instead)
    const { tokensRoot, git: gitConfig } = loadConfig();
    const { baseBranch, branchName } = gitConfig;
    const tokenFilePath = join(tokensRoot, TOKEN_FILE_NAME);

    let remoteRepoDir: string; // GitHub remote directory
    let localRepoDir: string; // dev's local that script runs in
    let teammateRepoDir: string; // teammate's local to test rebasing

    const writeTokenFile = (cwd: string, contents: unknown) =>
      writeFileSync(join(cwd, tokenFilePath), JSON.stringify(contents));

    const commitFile = (cwd: string, file: string, contents: string) => {
      writeFileSync(join(cwd, file), contents);
      git(cwd, ['add', '.']);
      git(cwd, ['commit', '-m', 'a commit message']);
    };

    // reads token file in remote to confirm push fired correctly
    const readFileOnRemote = () =>
      git(remoteRepoDir, ['show', `${branchName}:${tokenFilePath}`]);

    // compares commit counts from base branch in comparison to feature branch
    const countCommitsAheadOfBase = (cwd: string) =>
      git(cwd, ['rev-list', '--count', `origin/${baseBranch}..HEAD`]);

    // Build what exists prior to running `pnpm sync:tokens`
    beforeAll(() => {
      // create bare remote repo with no commits
      remoteRepoDir = mkdtempSync(join(tmpdir(), 'remote-repo'));
      tempDirs.push(remoteRepoDir);
      git(remoteRepoDir, ['init', '--bare', '-b', baseBranch]);

      // create local repo (with 'development' branch) and set origin to remote repo
      localRepoDir = mkdtempSync(join(tmpdir(), 'local-repo'));
      tempDirs.push(localRepoDir);
      git(localRepoDir, ['init', '-b', baseBranch]);
      setIdentity(localRepoDir);
      git(localRepoDir, ['remote', 'add', 'origin', remoteRepoDir]);

      // create empty commit to push to base branch so remote has a commit history
      mkdirSync(join(localRepoDir, tokensRoot), { recursive: true });
      commitFile(localRepoDir, tokenFilePath, '{}');
      // push to base 'development' branch and newly created feature branch ('token-figma-sync') in remote
      git(localRepoDir, [
        'push',
        'origin',
        baseBranch,
        `${baseBranch}:${branchName}`,
      ]);
    });

    afterAll(() => {
      tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }));
    });

    // First run: checks out feature branch (doesn't exist on local yet), commit / push
    it('first run', () => {
      checkoutSyncBranch(localRepoDir, baseBranch, branchName);
      rebaseOntoBase(localRepoDir, baseBranch, branchName);
      writeTokenFile(localRepoDir, TOKEN_FILE_CONTENT);
      commitAndPushTokens(localRepoDir, tokensRoot, branchName);

      // confirm local creates / checks-out new feature branch
      expect(git(localRepoDir, ['branch', '--show-current'])).toBe(branchName);
      // confirm new commit, sitting on the feature branch
      expect(countCommitsAheadOfBase(localRepoDir)).toBe('1');
      // confirm commit / push reached the remote
      expect(git(remoteRepoDir, ['rev-parse', branchName])).toBe(
        git(localRepoDir, ['rev-parse', 'HEAD']),
      );
      expect(readFileOnRemote()).toBe(JSON.stringify(TOKEN_FILE_CONTENT));
    });

    // Second run: after commit is merged to base, second run drops that merged commit and
    // rebases onto current base
    it('second run:', () => {
      // Teammate machine created to test rebasing on second run
      teammateRepoDir = mkdtempSync(join(tmpdir(), 'teammate-repo'));
      tempDirs.push(teammateRepoDir);
      git(tmpdir(), ['clone', remoteRepoDir, teammateRepoDir]);
      setIdentity(teammateRepoDir);

      // Teammate machine merges the commit from first run, and creates new commit (unknown to
      // first machine) to advance base branch
      git(teammateRepoDir, ['checkout', baseBranch]);
      git(teammateRepoDir, ['merge', '--ff-only', `origin/${branchName}`]);
      commitFile(teammateRepoDir, 'unrelated.txt', 'some unrelated contents');
      git(teammateRepoDir, ['push', 'origin', baseBranch]);

      // newest commit sha on base branch to compare with run 2's rebase
      const newBaseTip = git(teammateRepoDir, ['rev-parse', baseBranch]);

      // original machine fires second run with updated token content
      checkoutSyncBranch(localRepoDir, baseBranch, branchName);
      rebaseOntoBase(localRepoDir, baseBranch, branchName);
      writeTokenFile(localRepoDir, TOKEN_FILE_CONTENT_UPDATED);
      commitAndPushTokens(localRepoDir, tokensRoot, branchName);

      // checkoutSyncBranch pulled teammate machine's new commits on base
      expect(git(localRepoDir, ['rev-parse', `origin/${baseBranch}`])).toBe(
        newBaseTip,
      );
      // checkoutSyncBranch rebased onto this new commit
      expect(git(localRepoDir, ['rev-parse', 'HEAD~1'])).toBe(newBaseTip);
      // confirm new token commit sitting on feature branch
      expect(countCommitsAheadOfBase(localRepoDir)).toBe('1');
      // confirm push reached remote
      expect(readFileOnRemote()).toBe(
        JSON.stringify(TOKEN_FILE_CONTENT_UPDATED),
      );
    });

    // Third run: manually create merge conflict to force failure on rebase step
    it('third run:', () => {
      // Teammate machine pushes change to token file directly to base 'development' branch
      commitFile(
        teammateRepoDir,
        tokenFilePath,
        JSON.stringify(TOKEN_FILE_CONTENT_CONFLICT),
      );
      git(teammateRepoDir, ['push', 'origin', baseBranch]);

      checkoutSyncBranch(localRepoDir, baseBranch, branchName);
      // pull commmit sha of latest commit prior to running rebase step
      const preRebaseTip = git(localRepoDir, ['rev-parse', 'HEAD']);

      expect(() =>
        rebaseOntoBase(localRepoDir, baseBranch, branchName),
      ).toThrow(/process\.exit/);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Failed to rebase ${branchName} onto ${baseBranch}`,
        ),
      );
      // rebase --abort put the feature branch back previous commit on exit
      expect(git(localRepoDir, ['rev-parse', 'HEAD'])).toBe(preRebaseTip);
    });
  });
});
