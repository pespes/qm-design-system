#!/usr/bin/env node
// Prints figmaInspect.js with NODE_IDS and MAX_DEPTH filled in, ready to pass to figma-console `figma_execute`.
//
//   node .claude/skills/figma-inspect/scripts/build-inspect.mjs <figma-url-or-node-id>... [--depth N]
//
// Accepts Figma URLs (node-id=10607-7401) or node IDs (10607:7401 / 10607-7401). The first line of the
// output is a comment with the fileKey parsed from the URLs: pass it as `fileKey` to `figma_execute`.
// Refuses to run if the inspection script contains anything that could modify the Figma document.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const scriptPath = resolve(repoRoot, 'libs/ui-components/docs/figmaInspect.js');

const fail = (message) => {
  console.error(`build-inspect: ${message}`);
  process.exit(1);
};

const args = process.argv.slice(2);
let depth = 4;
const nodeIds = [];
const fileKeys = new Set();

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--depth') {
    depth = Number(args[++i]);
    if (!Number.isInteger(depth) || depth < 0 || depth > 10) fail('--depth must be a whole number from 0 to 10');
    continue;
  }
  if (arg.startsWith('http')) {
    const url = new URL(arg);
    // Branch URLs (/design/<fileKey>/branch/<branchKey>/...) are read from the branch
    const path = url.pathname.match(/\/(?:design|file)\/([^/]+)(?:\/branch\/([^/]+))?/);
    if (path) fileKeys.add(path[2] ?? path[1]);
    const nodeId = url.searchParams.get('node-id');
    if (!nodeId) fail(`no node-id in ${arg} — ask for a node-specific link`);
    nodeIds.push(nodeId.replace('-', ':'));
    continue;
  }
  if (/^I?\d+[:-]\d+(;\d+:\d+)*$/.test(arg)) {
    nodeIds.push(arg.replace(/^(I?\d+)-/, '$1:'));
    continue;
  }
  fail(`not a Figma URL or node ID: ${arg}`);
}

if (nodeIds.length === 0) fail('pass at least one Figma URL or node ID');
if (fileKeys.size > 1) fail(`URLs point at different files (${[...fileKeys].join(', ')}) — inspect one file at a time`);

let script = readFileSync(scriptPath, 'utf8');

// figma_execute may only run this script because it is read-only; enforce that before every use
const writePatterns = [/figma\.create\w*\(/, /\.remove\(\)/, /\.set\w+\(/, /\.set\w+Async\(/, /\.insertChild\(|\.appendChild\(/, /figma\.commitUndo|figma\.closePlugin/];
const strippedComments = script.replace(/^\s*\/\/.*$/gm, '');
const found = writePatterns.filter((pattern) => pattern.test(strippedComments));
if (found.length) fail(`figmaInspect.js contains possible write calls (${found.join(', ')}) — it must stay read-only`);

script = script
  .replace(/const NODE_IDS = \[[^\]]*\];.*$/m, `const NODE_IDS = ${JSON.stringify([...new Set(nodeIds)])};`)
  .replace(/const MAX_DEPTH = \d+;/, `const MAX_DEPTH = ${depth};`);

const fileKeyLine = fileKeys.size
  ? `// fileKey: ${[...fileKeys][0]}`
  : '// fileKey: (not in input — use the linked file\'s key from figma_get_status)';
process.stdout.write(`${fileKeyLine}\n${script}`);
