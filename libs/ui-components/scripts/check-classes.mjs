/**
 * Build-time check for class names and CSS variables that silently do nothing.
 *
 * Tailwind drops utilities it can't resolve (e.g. `text-status-danger-text` after a token is renamed), and
 * CSS falls back silently when `var(--x)` is undefined. Lint, typecheck and tests all pass in both cases.
 * This script fails the build instead:
 *   1. Utility classes in src/ that Tailwind generates no CSS for, using the same CSS entry as Storybook
 *      (src/globals.css: Tailwind + tw-animate-css + ui-tokens + src/styles.css).
 *   2. CSS variables referenced in src/ (`var(--x)`, Tailwind `(--x)` shorthand) that are defined nowhere.
 *
 * Run: `node scripts/check-classes.mjs` from libs/ui-components (requires ui-tokens to be built).
 * Known false positives can be listed in IGNORED_CLASSES / RUNTIME_VARIABLES below.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(pkgRoot, 'src');

// Strings that look like utilities but aren't classes (e.g. test ids). Add with a comment explaining why.
const IGNORED_CLASSES = new Set([]);

// CSS variables set at runtime (inline styles from Base UI etc.), not defined in any stylesheet.
const RUNTIME_VARIABLES = [
  /^--anchor-/,
  /^--available-/,
  /^--transform-origin$/,
  /^--popup-/,
  /^--positioner-/,
  /^--tw-/,
];

// Only strings starting with one of these utility roots are treated as classes, so prose, test ids and
// data-slot values aren't checked. Covers the utilities that read design tokens.
const UTILITY_ROOTS = [
  'text',
  'bg',
  'border',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-x',
  'border-y',
  'border-s',
  'border-e',
  'ring',
  'ring-offset',
  'outline',
  'outline-offset',
  'fill',
  'stroke',
  'divide',
  'divide-x',
  'divide-y',
  'placeholder',
  'decoration',
  'caret',
  'accent',
  'shadow',
  'inset-shadow',
  'from',
  'via',
  'to',
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'ps',
  'pe',
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  'gap',
  'gap-x',
  'gap-y',
  'space-x',
  'space-y',
  'size',
  'w',
  'h',
  'min-w',
  'max-w',
  'min-h',
  'max-h',
  'inset',
  'inset-x',
  'inset-y',
  'top',
  'right',
  'bottom',
  'left',
  'rounded',
  'rounded-t',
  'rounded-r',
  'rounded-b',
  'rounded-l',
  'rounded-tl',
  'rounded-tr',
  'rounded-bl',
  'rounded-br',
  'rounded-s',
  'rounded-e',
  'type',
  'font',
  'leading',
  'tracking',
  'opacity',
  'z',
].sort((a, b) => b.length - a.length);

// --- Resolve CSS @imports the way the Vite build does ---
function readPackageJson(name) {
  return JSON.parse(
    readFileSync(join(pkgRoot, 'node_modules', name, 'package.json'), 'utf8'),
  );
}

function resolveStylesheet(id, base) {
  if (id.startsWith('.')) return resolve(base, id);
  const parts = id.split('/');
  const name = id.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  const subpath = '.' + id.slice(name.length);
  const pkg = readPackageJson(name);
  const entry = pkg.exports?.[subpath === '.' ? '.' : subpath];
  const target =
    typeof entry === 'string'
      ? entry
      : (entry?.style ?? (subpath === '.' ? pkg.style : undefined));
  if (!target) throw new Error(`Can't resolve stylesheet "${id}"`);
  return join(pkgRoot, 'node_modules', name, target);
}

const loadedCss = [];
async function loadStylesheet(id, base) {
  const path = resolveStylesheet(id, base);
  const content = readFileSync(path, 'utf8');
  loadedCss.push(content);
  return { path, base: dirname(path), content };
}

// --- Collect source files and the class-like strings in them ---
function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = walk(srcDir).filter((f) => /\.(tsx?|mdx|css)$/.test(f));

function utilityOf(candidate) {
  // Strip variants (`hover:`, `group-data-[x]/name:`) outside brackets/parens, then `!` and `/opacity`
  let depth = 0;
  let start = 0;
  for (let i = 0; i < candidate.length; i++) {
    const c = candidate[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === ':' && depth === 0) start = i + 1;
  }
  return candidate.slice(start).replace(/^!|!$/g, '').replace(/^-/, '');
}

function looksLikeUtility(candidate) {
  if (
    !/^[!a-z0-9\-[\]():/._%&>*='#,@]+$/i.test(candidate) ||
    !candidate.includes('-')
  )
    return false;
  const utility = utilityOf(candidate);
  return UTILITY_ROOTS.some((root) => utility.startsWith(root + '-'));
}

const candidates = new Map(); // candidate -> [file:line, ...]
const variableRefs = new Map(); // --var -> [file:line, ...]
const sourceDefinedVariables = new Set(); // set via arbitrary properties, e.g. `[--overlay-inset:-1px]`
for (const file of sourceFiles) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const isCss = file.endsWith('.css');
  lines.forEach((line, i) => {
    const where = `${relative(pkgRoot, file)}:${i + 1}`;
    for (const [, name] of line.matchAll(/\[(--[a-z0-9-]+):/gi))
      sourceDefinedVariables.add(name);
    // `var(--x)` and Tailwind's `(--x)` / `(length:--x)` shorthand. `var(--x, fallback)` is optional by design, so skipped.
    for (const [, name] of line.matchAll(
      /(?:var\(|\((?:[a-z-]+:)?)\s*(--[a-z0-9-]+)(?![a-z0-9-]|\s*,|:)/gi,
    )) {
      (variableRefs.get(name) ?? variableRefs.set(name, []).get(name)).push(
        where,
      );
    }
    if (isCss) return;
    const code = line
      .replace(/^\s*(\/\/|\*|\/\*).*$/, '')
      .replace(/\s\/\/\s.*$/, ''); // skip comments
    for (const match of code.matchAll(/(['"`])((?:(?!\1).)*)\1/g)) {
      if (/(test-?id)\s*[=:]\s*\{?\s*$/i.test(code.slice(0, match.index)))
        continue; // test ids aren't classes
      for (const token of match[2].split(/\s+/)) {
        const outsideBrackets = token.replace(/\[[^\]]*\]|\([^)]*\)/g, '');
        if (
          token.includes('${') ||
          outsideBrackets.includes('*') ||
          IGNORED_CLASSES.has(token) ||
          !looksLikeUtility(token)
        )
          continue;
        (candidates.get(token) ?? candidates.set(token, []).get(token)).push(
          where,
        );
      }
    }
  });
}

if (process.argv.includes('--verbose')) {
  console.log(
    `Scanned ${sourceFiles.length} files: ${candidates.size} utility candidates, ${variableRefs.size} CSS variable references`,
  );
}

// --- 1. Ask Tailwind which candidates generate CSS ---
const entryCss = readFileSync(join(srcDir, 'globals.css'), 'utf8');
const compiler = await compile(entryCss, { base: srcDir, loadStylesheet });

// Tailwind v4 accepts any number on spacing utilities (`size-475` = 475 × the base unit), so a mistyped
// spacing token still generates CSS. This repo uses named tokens, so plain numbers must match a --spacing-N token.
const SPACING_ROOTS = new Set([
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'ps',
  'pe',
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  'gap',
  'gap-x',
  'gap-y',
  'space-x',
  'space-y',
  'size',
  'w',
  'h',
  'min-w',
  'max-w',
  'min-h',
  'max-h',
  'inset',
  'inset-x',
  'inset-y',
  'top',
  'right',
  'bottom',
  'left',
]);

let previous = compiler.build([]);
const unknownClasses = [];
for (const candidate of [...candidates.keys()].sort()) {
  const output = compiler.build([candidate]);
  if (output === previous) unknownClasses.push(candidate);
  previous = output;
}
const spacingTokens = new Set(
  [
    ...previous.matchAll(/--spacing-([a-z0-9]+)\s*:/gi),
    ...loadedCss.join('\n').matchAll(/--spacing-([a-z0-9]+)\s*:/gi),
  ].map((m) => m[1]),
);
const nonTokenSpacing = [...candidates.keys()].filter((candidate) => {
  const utility = utilityOf(candidate);
  const root = UTILITY_ROOTS.find((r) => utility.startsWith(r + '-'));
  const value = utility.slice(root.length + 1);
  return (
    SPACING_ROOTS.has(root) && /^\d+$/.test(value) && !spacingTokens.has(value)
  );
});

// --- 2. Check referenced CSS variables are defined somewhere ---
const definitionSources = [
  ...loadedCss,
  ...sourceFiles
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8')),
  previous,
];
const defined = new Set([
  ...sourceDefinedVariables,
  ...definitionSources.flatMap((css) =>
    [...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]),
  ),
]);
const undefinedVariables = [...variableRefs.keys()].filter(
  (name) =>
    !defined.has(name) && !RUNTIME_VARIABLES.some((re) => re.test(name)),
);

// --- Report ---
const report = (title, items, refs) => {
  console.error(`\n${title}`);
  for (const item of items)
    console.error(
      `  ${item}  (${refs.get(item).slice(0, 3).join(', ')}${refs.get(item).length > 3 ? ', …' : ''})`,
    );
};

if (
  unknownClasses.length ||
  nonTokenSpacing.length ||
  undefinedVariables.length
) {
  if (unknownClasses.length)
    report(
      '✖ Classes Tailwind generates no CSS for (missing or renamed token?):',
      unknownClasses,
      candidates,
    );
  if (nonTokenSpacing.length)
    report(
      '✖ Spacing values with no matching --spacing-N token:',
      nonTokenSpacing,
      candidates,
    );
  if (undefinedVariables.length)
    report(
      '✖ CSS variables referenced but never defined:',
      undefinedVariables,
      variableRefs,
    );
  console.error(
    '\nFix the class/variable, or add a known false positive to IGNORED_CLASSES / RUNTIME_VARIABLES in scripts/check-classes.mjs.\n',
  );
  process.exit(1);
}
console.log(
  `✔ check-classes: ${candidates.size} utility classes and ${variableRefs.size} CSS variables resolve.`,
);
