#!/usr/bin/env node
// Builds the code figma-audit passes to figma-console `figma_execute`. Prints it to stdout.
//
//   node .claude/skills/figma-audit/scripts/build.mjs audit <figma-url-or-node-id>
//   node .claude/skills/figma-audit/scripts/build.mjs fix <plan.json>
//
// audit — READ-ONLY. Builds level-audit.js with token data from libs/ui-tokens (figma-tokens.json + tokens.css).
//         Refuses to build if the script contains a write call. The first output line is `// fileKey: …`
//         when the input was a URL. (The generic WCAG/lint checks are figma-console's built-in Southleft tools.)
// fix   — WRITES. Builds apply-fixes.js from a plan of fixes the runner approved:
//         { "setId": "8138:628", "setName": "Checkbox", "fixes": [ { "ref": 1, "op": "bindPaint", ... } ] }
//         ops: bindPaint { nodeId, paint: "fills"|"strokes", index, variableId }
//              bindNumber { nodeId, fields: [..], variableId }
//              textStyle { nodeId, styleId }
//              rename { nodeId, name }
//              description { nodeId, description }

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');
const tokensDir = resolve(repoRoot, 'libs/ui-tokens');

const fail = (message) => {
  console.error(`figma-audit build: ${message}`);
  process.exit(1);
};
const read = (path) => readFileSync(resolve(here, path), 'utf8');
const stripComments = (code) => code.replace(/^\s*\/\/.*\n/gm, '');

// ---- Target parsing (same rules as figma-inspect) ----
function parseTarget(arg) {
  if (!arg) fail('pass a Figma URL or node ID for the component set');
  if (arg.startsWith('http')) {
    const url = new URL(arg);
    const path = url.pathname.match(/\/(?:design|file)\/([^/]+)(?:\/branch\/([^/]+))?/);
    const nodeId = url.searchParams.get('node-id');
    if (!nodeId) fail(`no node-id in ${arg} — ask for a link to the component set`);
    return { nodeId: nodeId.replace('-', ':'), fileKey: path ? (path[2] ?? path[1]) : null };
  }
  if (/^\d+[:-]\d+$/.test(arg)) return { nodeId: arg.replace('-', ':'), fileKey: null };
  fail(`not a Figma URL or node ID: ${arg}`);
}

// ---- Token data from the repo ----
function loadTokens() {
  const jsonPath = resolve(tokensDir, 'tokens/figma-tokens.json');
  const cssPaths = ['dist/css/tokens.css', 'dist/css/tokens.pro.css'].map((p) => resolve(tokensDir, p));
  if (!cssPaths.every(existsSync)) fail('libs/ui-tokens/dist/css is missing — run `pnpm build:tokens` first');
  const cssVars = new Set(cssPaths.flatMap((p) => readFileSync(p, 'utf8').match(/--[a-z0-9-]+(?=\s*:)/g) ?? []));
  const json = JSON.parse(readFileSync(jsonPath, 'utf8'));

  const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replaceAll('/', '-');
  const TEXT_STYLE_GROUPS = /^(fontSize|fontWeight|fontFamily|fontStyle|lineHeight|letterSpacing)\//; // reach code via type-* utilities
  const synced = [];
  const noCss = [];
  for (const v of json.variables) {
    synced.push(v.id.replace('VariableID:', ''));
    if (TEXT_STYLE_GROUPS.test(v.name)) continue;
    if (v.$type === 'COLOR' && v.collectionName === 'Primitives') continue; // never in CSS; flagged as primitive-binding instead
    const css = v.$type === 'COLOR' ? `--color-${kebab(v.name)}` : `--${kebab(v.name)}`;
    if (!cssVars.has(css)) noCss.push(v.name);
  }
  return { synced, noCss, textStyles: (json.textVariables ?? []).map((t) => t.name) };
}

// figma_execute may only run audit code because it is read-only; enforce that on every build
const WRITE_PATTERNS = [/figma\.create\w*\(/, /\.remove\(\)/, /\.set[A-Z]\w*\(/, /\.set\w+Async\(/, /\.insertChild\(|\.appendChild\(/, /figma\.commitUndo|figma\.closePlugin|saveVersionHistory/, /\b(node|child|set|root|target|instance|cur|n|c)\.(name|description|fills|strokes|characters)\s*=[^=]/];
function assertReadOnly(file, code) {
  const found = WRITE_PATTERNS.filter((p) => p.test(stripComments(code)));
  if (found.length) fail(`${file} contains possible write calls (${found.join(', ')}) — audit scripts must stay read-only`);
}

function replaceInput(code, pattern, replacement, file) {
  if (!pattern.test(code)) fail(`could not find the input ${pattern} in ${file} — has the script changed?`);
  return code.replace(pattern, replacement);
}

function buildAudit(args) {
  const { nodeId, fileKey } = parseTarget(args[0]);
  const file = 'level-audit.js';
  const { synced, noCss, textStyles } = loadTokens();
  let code = read(file);
  assertReadOnly(file, code);
  code = replaceInput(code, /const NODE_ID = '__NODE_ID__';/, `const NODE_ID = ${JSON.stringify(nodeId)};`, file);
  code = replaceInput(code, /const SYNCED = \[\];/, `const SYNCED = ${JSON.stringify(synced)};`, file);
  code = replaceInput(code, /const NO_CSS = \[\];/, `const NO_CSS = ${JSON.stringify(noCss)};`, file);
  code = replaceInput(code, /const SYNCED_TEXT_STYLES = \[\];/, `const SYNCED_TEXT_STYLES = ${JSON.stringify(textStyles)};`, file);
  const header = fileKey ? `// fileKey: ${fileKey}\n` : "// fileKey: (not in input — use the linked file's key from figma_get_status)\n";
  return `${header}// figma-audit READ-ONLY Level audit of ${nodeId}\n${stripComments(code)}`;
}

const NODE_ID_RE = /^\d+:\d+$/; // instance sublayer IDs (I…;…) are rejected: fix those in their own component set
const VAR_ID_RE = /^VariableID:[\w:/-]+$/;
const OPS = {
  bindPaint: (f) => NODE_ID_RE.test(f.nodeId) && ['fills', 'strokes'].includes(f.paint) && Number.isInteger(f.index) && VAR_ID_RE.test(f.variableId),
  bindNumber: (f) => NODE_ID_RE.test(f.nodeId) && Array.isArray(f.fields) && f.fields.length > 0 && f.fields.every((x) => /^[a-zA-Z]+$/.test(x)) && VAR_ID_RE.test(f.variableId),
  textStyle: (f) => NODE_ID_RE.test(f.nodeId) && /^S:[\w,:]+$/.test(f.styleId),
  rename: (f) => NODE_ID_RE.test(f.nodeId) && typeof f.name === 'string' && f.name.trim().length > 0,
  description: (f) => NODE_ID_RE.test(f.nodeId) && typeof f.description === 'string' && f.description.trim().length > 0,
};

function buildFix(args) {
  const planPath = args[0];
  if (!planPath || !existsSync(planPath)) fail('pass the path to a plan JSON file of approved fixes');
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  if (!NODE_ID_RE.test(plan.setId ?? '')) fail('plan.setId must be the component set node ID, e.g. "8138:628"');
  if (!Array.isArray(plan.fixes) || plan.fixes.length === 0) fail('plan.fixes is empty — nothing approved');
  for (const [i, fix] of plan.fixes.entries()) {
    if (/^I/.test(fix.nodeId ?? '')) fail(`fix ${fix.ref ?? i + 1}: ${fix.nodeId} is a layer inside an instance — fix it in its own component set (changing it here would only add an override, not fix the source)`);
    const check = OPS[fix.op];
    if (!check) fail(`fix ${fix.ref ?? i + 1}: unknown op "${fix.op}" (allowed: ${Object.keys(OPS).join(', ')})`);
    if (!check(fix)) fail(`fix ${fix.ref ?? i + 1}: invalid fields for ${fix.op}: ${JSON.stringify(fix)}`);
  }
  const file = 'apply-fixes.js';
  let code = read(file);
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  code = replaceInput(code, /const SET_ID = '__SET_ID__';/, `const SET_ID = ${JSON.stringify(plan.setId)};`, file);
  code = replaceInput(code, /const CHECKPOINT = '__CHECKPOINT__';/, `const CHECKPOINT = ${JSON.stringify(`figma-audit: before ${plan.fixes.length} ${plan.fixes.length === 1 ? 'fix' : 'fixes'} to ${plan.setName ?? plan.setId} (${stamp} UTC)`)};`, file);
  code = replaceInput(code, /const FIXES = \[\];/, `const FIXES = ${JSON.stringify(plan.fixes)};`, file);
  return `// figma-audit WRITE: ${plan.fixes.length} approved ${plan.fixes.length === 1 ? 'fix' : 'fixes'} to ${plan.setName ?? plan.setId}\n${stripComments(code)}`;
}

const [command, ...args] = process.argv.slice(2);
if (command === 'audit') process.stdout.write(buildAudit(args));
else if (command === 'fix') process.stdout.write(buildFix(args));
else fail('usage: build.mjs audit <figma-url-or-node-id> | build.mjs fix <plan.json>');
