// Level design-system audit for ONE component set. READ-ONLY.
// Run through build.mjs, which fills in the inputs below from libs/ui-tokens (figma-tokens.json + tokens.css).
//
// Checks what the generic Southleft rules can't: bindings against the synced token file, primitive colours
// that have no CSS variable in code, raw colours/numbers that exactly match a Level token, text styles,
// and the set's description. Every finding says how it can be fixed:
//   auto     — one safe candidate (same resolved value, right role/scope); can be applied once approved
//   choose   — several candidates, or the candidate changes a value in some mode; the runner picks
//   designer — no token matches; needs a design decision
//   code     — the fix belongs in the repo (token pipeline), not in Figma
// Layers inside nested instances are not walked: fix those in their own component set.

const NODE_ID = '__NODE_ID__';
const SYNCED = []; // variable IDs in figma-tokens.json, without the "VariableID:" prefix
const NO_CSS = []; // synced variable names with no CSS variable in tokens.css (primitive colours excluded — they never have one)
const SYNCED_TEXT_STYLES = []; // text style names from figma-tokens.json
const MAX_DEPTH = 12;
const syncedIds = new Set(SYNCED.map((id) => `VariableID:${id}`));

const root = await figma.getNodeByIdAsync(NODE_ID);
if (!root) return { error: `Node ${NODE_ID} not found in "${figma.root.name}"` };
const set = root.type === 'COMPONENT_SET' ? root
  : root.type === 'COMPONENT' && root.parent?.type === 'COMPONENT_SET' ? root.parent
  : root.type === 'COMPONENT' ? root : null;
if (!set) return { error: `${root.name} (${root.type}) is not a component or component set — audit one component set at a time` };

// ---- Variables ----
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collectionById = new Map(collections.map((c) => [c.id, c]));
const localVars = await figma.variables.getLocalVariablesAsync();
const varById = new Map(localVars.map((v) => [v.id, v]));
const getVar = async (id) => varById.get(id) ?? (await figma.variables.getVariableByIdAsync(id));
const collectionName = (v) => collectionById.get(v.variableCollectionId)?.name ?? (v.remote ? 'remote library' : '?');

const hex = ({ r, g, b, a = 1 }) =>
  '#' + [r, g, b, ...(a < 1 ? [a] : [])].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');

async function resolve(v, modeId, depth = 0) {
  const value = v.valuesByMode[modeId] ?? Object.values(v.valuesByMode)[0];
  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
    const target = await getVar(value.id);
    if (!target || depth > 10) return null;
    return resolve(target, collectionById.get(target.variableCollectionId)?.defaultModeId, depth + 1);
  }
  // Alias + opacity (e.g. state/disabled = color/black at 38%, surface/overlay = color/grey/950 at 50%)
  if (value && typeof value === 'object' && value.color?.type === 'VARIABLE_ALIAS') {
    const target = await getVar(value.color.id);
    const base = target && depth <= 10 ? await resolve(target, collectionById.get(target.variableCollectionId)?.defaultModeId, depth + 1) : null;
    return base && 'r' in base ? { ...base, a: (base.a ?? 1) * ((value.opacity ?? 100) / 100) } : null;
  }
  return value;
}
// { Homeowner: '#00780e', Pro: '#1f5fbf' } — every mode of the variable's collection
async function valuesByModeName(v) {
  const collection = collectionById.get(v.variableCollectionId);
  const out = {};
  for (const mode of collection?.modes ?? []) {
    const value = await resolve(v, mode.modeId);
    out[mode.name] = value && typeof value === 'object' && 'r' in value ? hex(value) : value;
  }
  return out;
}
const defaultValue = async (v) => resolve(v, collectionById.get(v.variableCollectionId)?.defaultModeId);

// Semantic colour candidates: Theme/Component variables only (primitive colours have no CSS variable in code)
const colorCandidates = [];
for (const v of localVars) {
  if (v.resolvedType !== 'COLOR' || collectionName(v) === 'Primitives') continue;
  const value = await defaultValue(v);
  if (value && 'r' in value) colorCandidates.push({ v, hex: hex(value) });
}
const numberCandidates = [];
for (const v of localVars) {
  if (v.resolvedType !== 'FLOAT') continue;
  const value = await defaultValue(v);
  if (typeof value === 'number') numberCandidates.push({ v, value });
}

// ---- Roles: which tokens fit which property ----
const COLOR_ROLES = {
  fill: { scopes: ['ALL_FILLS', 'FRAME_FILL', 'SHAPE_FILL'], names: /^(surface|state|counter|rating)\/|\/background(-|$)/ },
  text: { scopes: ['ALL_FILLS', 'TEXT_FILL'], names: /^foreground\/|\/(text|foreground)$/ },
  stroke: { scopes: ['STROKE_COLOR'], names: /^(border|focus)\/|\/border$/ },
};
const NUMBER_ROLES = {
  spacing: { scopes: ['GAP'], names: /^spacing\// },
  size: { scopes: ['WIDTH_HEIGHT'], names: /^spacing\// },
  radius: { scopes: ['CORNER_RADIUS'], names: /^radius\// },
  stroke: { scopes: ['STROKE_FLOAT'], names: /^borderWidth\// },
};
const scopeOk = (v, scopes) => !v.scopes?.length || v.scopes.includes('ALL_SCOPES') || v.scopes.some((s) => scopes.includes(s));

async function describeCandidate(v) {
  return { variableId: v.id, name: v.name, collection: collectionName(v), values: await valuesByModeName(v) };
}
// auto only when exactly one candidate fits the role by name AND its value is the same in every mode
async function classify(candidates, role, currentValues) {
  const fitting = candidates.filter((c) => role.names.test(c.name));
  const ranked = [...fitting, ...candidates.filter((c) => !fitting.includes(c))].slice(0, 5);
  if (!ranked.length) return { fix: 'designer', candidates: [] };
  const sameEverywhere = (c) => !currentValues || Object.values(c.values).every((val) => Object.values(currentValues).includes(val));
  const fix = fitting.length === 1 && sameEverywhere(fitting[0]) ? 'auto' : 'choose';
  return { fix, candidates: ranked };
}

// ---- Walk ----
const findings = [];
const nestedInstances = new Map();
const pathOf = (node) => {
  const parts = [];
  for (let n = node; n && n.id !== set.id; n = n.parent) parts.unshift(n.name);
  return parts.join(' › ');
};
const add = (rule, severity, node, extra) => findings.push({ rule, severity, nodeId: node.id, path: pathOf(node) || set.name, ...extra });

async function checkBindings(node) {
  for (const [field, binding] of Object.entries(node.boundVariables ?? {})) {
    const ids = (Array.isArray(binding) ? binding : [binding]).map((b) => b?.id).filter(Boolean);
    for (const id of ids) {
      const v = await getVar(id);
      if (syncedIds.has(id)) {
        if (v && NO_CSS.includes(v.name))
          add('missing-css-token', 'info', node, { field, variable: v.name, fix: 'code', note: 'Synced variable has no CSS variable in tokens.css — check the token pipeline' });
      } else if (!v) {
        add('unknown-variable', 'warning', node, { field, variableId: id, fix: 'designer', note: 'Bound variable cannot be resolved in this file' });
      } else {
        const target = localVars.find((t) => t.name === v.name && syncedIds.has(t.id));
        if (target) {
          const current = await valuesByModeName(v);
          add('stale-binding', 'warning', node, {
            field, variable: { variableId: v.id, name: v.name, collection: collectionName(v), values: current },
            fix: JSON.stringify(current) === JSON.stringify(await valuesByModeName(target)) ? 'auto' : 'choose',
            candidates: [await describeCandidate(target)],
            note: 'Bound to a variable that is not in figma-tokens.json; a synced variable with the same name exists',
          });
        } else {
          add('unsynced-variable', 'warning', node, { field, variable: v.name, collection: collectionName(v), fix: 'code', note: 'Variable is not in figma-tokens.json — re-run figma-token-sync, or the design uses a token code does not have' });
        }
      }
      if (v && v.resolvedType === 'COLOR' && collectionName(v) === 'Primitives') {
        const value = await defaultValue(v);
        const matches = colorCandidates.filter((c) => value && c.hex === hex(value));
        const role = field === 'strokes' ? COLOR_ROLES.stroke : node.type === 'TEXT' ? COLOR_ROLES.text : COLOR_ROLES.fill;
        const candidates = await Promise.all(matches.filter((c) => scopeOk(c.v, role.scopes)).map((c) => describeCandidate(c.v)));
        add('primitive-binding', 'warning', node, {
          field, variable: v.name, ...(await classify(candidates, role, { value: value ? hex(value) : null })),
          note: 'Primitive colours have no CSS variable in code — bind a semantic (Theme/Component) token instead',
        });
      }
    }
  }
}

async function checkPaints(node, kind) {
  const paints = node[kind];
  if (!Array.isArray(paints)) return;
  for (const [index, paint] of paints.entries()) {
    if (paint.type !== 'SOLID' || paint.visible === false || paint.boundVariables?.color) continue;
    const value = hex({ ...paint.color, a: paint.opacity ?? 1 });
    const role = kind === 'strokes' ? COLOR_ROLES.stroke : node.type === 'TEXT' ? COLOR_ROLES.text : COLOR_ROLES.fill;
    const candidates = await Promise.all(colorCandidates.filter((c) => c.hex === value && scopeOk(c.v, role.scopes)).map((c) => describeCandidate(c.v)));
    add('raw-color', 'warning', node, { field: kind, index, value, ...(await classify(candidates, role, { value })) });
  }
}

async function checkNumber(node, fields, roleName, severity = 'warning') {
  const unbound = fields.filter((f) => f in node && typeof node[f] === 'number' && !node.boundVariables?.[f]);
  if (!unbound.length) return;
  // group fields that share a value (e.g. all four corner radii) into one finding
  const byValue = new Map();
  for (const f of unbound) if (node[f] !== 0) byValue.set(node[f], [...(byValue.get(node[f]) ?? []), f]);
  const role = NUMBER_ROLES[roleName];
  for (const [value, group] of byValue) {
    const matches = numberCandidates.filter((c) => c.value === value && role.names.test(c.v.name) && scopeOk(c.v, role.scopes));
    if (!matches.length && severity === 'info') continue; // fixed sizes with no token are normal
    const candidates = await Promise.all(matches.map((c) => describeCandidate(c.v)));
    const result = await classify(candidates, role, null);
    // A fixed size matching a spacing token may be coincidence, so the runner decides
    if (roleName === 'size' && result.fix === 'auto') result.fix = 'choose';
    add('raw-number', severity, node, { fields: group, value, ...result });
  }
}

async function checkText(node) {
  const styleId = node.textStyleId;
  if (styleId === figma.mixed) return add('mixed-text-style', 'info', node, { fix: 'designer', note: 'Text layer mixes styles' });
  if (styleId) {
    const style = await figma.getStyleByIdAsync(styleId);
    if (style && SYNCED_TEXT_STYLES.length && !SYNCED_TEXT_STYLES.includes(style.name))
      add('unsynced-text-style', 'info', node, { textStyle: style.name, fix: 'code', note: 'Text style is not in figma-tokens.json' });
    return;
  }
  const styles = await figma.getLocalTextStylesAsync();
  const size = node.fontSize, weight = node.fontName === figma.mixed ? null : node.fontName.style;
  const matches = styles.filter((s) => s.fontSize === size && s.fontName.style === weight);
  add('no-text-style', 'warning', node, {
    font: `${size}px ${weight ?? 'mixed'}`,
    fix: matches.length === 1 ? 'auto' : matches.length ? 'choose' : 'designer',
    candidates: matches.slice(0, 5).map((s) => ({ styleId: s.id, name: s.name })),
  });
}

async function walk(node, depth) {
  if (depth > MAX_DEPTH) return;
  if (node.type === 'INSTANCE') {
    // The instance's fills, size (usually content-driven) and children belong to its main component
    const main = await node.getMainComponentAsync();
    const owner = main?.parent?.type === 'COMPONENT_SET' ? main.parent : main;
    if (owner) nestedInstances.set(owner.id, { id: owner.id, name: owner.name, remote: main.remote || undefined });
    return;
  }
  await checkBindings(node);
  if (node.type !== 'COMPONENT_SET') {
    await checkPaints(node, 'fills');
    if (node.strokes?.some((s) => s.visible !== false)) {
      await checkPaints(node, 'strokes');
      await checkNumber(node, ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'], 'stroke');
    }
    if (node.type === 'TEXT') await checkText(node);
    // Gap only matters with 2+ children, padding with 1+ (empty fill-only frames are common)
    const childCount = node.children?.length ?? 0;
    if ('layoutMode' in node && node.layoutMode !== 'NONE' && childCount > 0)
      await checkNumber(node, ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', ...(childCount > 1 ? ['itemSpacing'] : [])], 'spacing');
    if ('topLeftRadius' in node) await checkNumber(node, ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'], 'radius');
    if (node.layoutSizingHorizontal === 'FIXED' || node.layoutSizingVertical === 'FIXED')
      await checkNumber(node, [node.layoutSizingHorizontal === 'FIXED' && 'width', node.layoutSizingVertical === 'FIXED' && 'height'].filter(Boolean), 'size', 'info');
  }
  for (const child of node.children ?? []) await walk(child, depth + 1);
}

await walk(set, 0);

if (!set.description?.trim()) add('missing-description', 'info', set, { fix: 'auto', note: 'Draft a description (purpose, behaviour, usage) for the runner to approve' });

// Group identical findings on the same layer across variants ("raw #000000 stroke on › box in 4 variants");
// each group keeps every node ID so fixes can still target them individually
const groups = new Map();
for (const { nodeId, path, ...rest } of findings) {
  const [variant, ...layerPath] = path.split(' › ');
  const layer = layerPath.join(' › ') || '(variant root)';
  const key = JSON.stringify([rest, nodeId === set.id ? set.name : layer]);
  if (!groups.has(key)) groups.set(key, { ...rest, layer: nodeId === set.id ? set.name : layer, nodes: [] });
  groups.get(key).nodes.push({ id: nodeId, variant: nodeId === set.id ? null : variant });
}
const MAX_GROUPS = 80;
const grouped = [...groups.values()];

const summary = { total: findings.length, groups: grouped.length };
for (const f of findings) {
  summary[f.fix] = (summary[f.fix] ?? 0) + 1;
  summary[f.rule] = (summary[f.rule] ?? 0) + 1;
}
return {
  set: {
    id: set.id, name: set.name, type: set.type, description: set.description || null,
    variants: set.type === 'COMPONENT_SET' ? set.children.length : 1,
    properties: Object.fromEntries(Object.entries(set.componentPropertyDefinitions ?? {}).map(([k, d]) => [k, d.variantOptions ?? d.type])),
  },
  nestedComponentSets: [...nestedInstances.values()],
  findings: grouped.slice(0, MAX_GROUPS),
  truncated: grouped.length > MAX_GROUPS ? `Showing ${MAX_GROUPS} of ${grouped.length} groups` : undefined,
  summary,
};
