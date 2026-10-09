#!/usr/bin/env node
// Storybook helper for visual checks.
//
//   node .claude/skills/storybook-visual-check/scripts/storybook.mjs start [--own]   # prints the base URL
//   node .claude/skills/storybook-visual-check/scripts/storybook.mjs stories <ComponentName>
//   node .claude/skills/storybook-visual-check/scripts/storybook.mjs stop
//
// `start` reuses the user's Storybook on :6006 if it responds, otherwise starts a private one on :6007
// (nx blocks a second `pnpm storybook`, so it runs storybook directly from libs/ui-components).
// `--own` skips :6006, e.g. when the user's server is stale after a branch switch.
// `stop` only ever stops the private server this script started.

import { spawn } from 'node:child_process';
import { existsSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const packageDir = join(repoRoot, 'libs/ui-components');
const USER_URL = 'http://localhost:6006';
const OWN_PORT = 6007;
const OWN_URL = `http://localhost:${OWN_PORT}`;
const pidFile = join(tmpdir(), `level-storybook-${OWN_PORT}.pid`);
const logFile = join(tmpdir(), `level-storybook-${OWN_PORT}.log`);
const START_TIMEOUT_MS = 180_000;

const fail = (message) => {
  console.error(`storybook: ${message}`);
  process.exit(1);
};

async function responds(url) {
  try {
    const res = await fetch(`${url}/index.json`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

const ownPid = () => (existsSync(pidFile) ? Number(readFileSync(pidFile, 'utf8')) : null);

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function baseUrl() {
  if (ownPid() && (await responds(OWN_URL))) return OWN_URL;
  if (await responds(USER_URL)) return USER_URL;
  return null;
}

async function start(own) {
  if (!own && (await responds(USER_URL))) {
    console.log(`${USER_URL}  (user's server — do not stop it)`);
    return;
  }
  if (await responds(OWN_URL)) {
    console.log(`${OWN_URL}  (already running)`);
    return;
  }
  const log = openSync(logFile, 'w');
  const child = spawn('pnpm', ['exec', 'storybook', 'dev', '-p', String(OWN_PORT), '--no-open', '--ci'], {
    cwd: packageDir,
    detached: true, // own process group, so `stop` can end storybook and its children together
    stdio: ['ignore', log, log],
  });
  child.unref();
  writeFileSync(pidFile, String(child.pid));

  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await responds(OWN_URL)) {
      console.log(`${OWN_URL}  (started by this script — run \`stop\` when done)`);
      return;
    }
    if (!isAlive(child.pid)) fail(`storybook exited during startup — see ${logFile}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  fail(`storybook did not respond within ${START_TIMEOUT_MS / 1000}s — see ${logFile}`);
}

async function stories(component) {
  if (!component) fail('pass a component name, e.g. `stories Avatar`');
  const url = await baseUrl();
  if (!url) fail('no Storybook running — run `start` first');
  const { entries } = await (await fetch(`${url}/index.json`)).json();
  const title = `Components/${component}`.toLowerCase();
  const matches = Object.values(entries).filter((e) => e.title.toLowerCase() === title);
  if (!matches.length) fail(`no entries titled "Components/${component}"`);

  for (const e of matches) {
    // Hidden <Name>Test stories are tagged !dev and exist for Vitest only
    if (e.type === 'story' && !e.tags?.includes('dev')) continue;
    const mode = e.type === 'docs' ? 'docs' : 'story';
    console.log(`${e.type.padEnd(5)}  ${e.name.padEnd(24)}  ${url}/iframe.html?id=${e.id}&viewMode=${mode}`);
  }
}

function stop() {
  const pid = ownPid();
  if (!pid) {
    console.log('no private Storybook to stop (a server on :6006 belongs to the user and is left running)');
    return;
  }
  try {
    process.kill(-pid, 'SIGTERM');
    console.log(`stopped private Storybook on :${OWN_PORT}`);
  } catch {
    console.log('private Storybook was not running');
  }
  rmSync(pidFile, { force: true });
}

const [command, arg] = process.argv.slice(2);
if (command === 'start') await start(arg === '--own');
else if (command === 'stories') await stories(arg);
else if (command === 'stop') stop();
else fail('usage: storybook.mjs start [--own] | stories <ComponentName> | stop');
