// Applies APPROVED figma-audit fixes to ONE component set. WRITES TO FIGMA.
// Run only through `build.mjs fix <plan.json>`, after the person running the audit approved each fix.
//
// 1. Validates every fix (node exists, sits inside the set, is not an instance sublayer, variable/style
//    exists and suits the property). If anything fails, nothing is written.
// 2. Saves a named version history checkpoint, so the whole batch can be restored from File › Show version history.
// 3. Applies the fixes in order, stopping at the first error, and returns before/after for each.

const SET_ID = '__SET_ID__';
const CHECKPOINT = '__CHECKPOINT__';
const FIXES = [];

const set = await figma.getNodeByIdAsync(SET_ID);
if (!set || !['COMPONENT_SET', 'COMPONENT'].includes(set.type)) return { applied: 0, error: `Component set ${SET_ID} not found — nothing applied` };

const insideSet = (node) => {
  for (let n = node; n; n = n.parent) if (n.id === set.id) return true;
  return false;
};
const hex = ({ r, g, b, a = 1 }) =>
  '#' + [r, g, b, ...(a < 1 ? [a] : [])].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
const paintsOf = (node, kind) => (node[kind] ?? []).map((p) => (p.boundVariables?.color ? `var:${p.boundVariables.color.id}` : p.color ? hex({ ...p.color, a: p.opacity ?? 1 }) : p.type));
const numbersOf = (node, fields) => Object.fromEntries(fields.map((f) => [f, node.boundVariables?.[f]?.id ? `var:${node.boundVariables[f].id}` : node[f]]));

// ---- Validate everything before writing anything ----
const prepared = [];
for (const [i, fix] of FIXES.entries()) {
  const label = `fix ${fix.ref ?? i + 1}`;
  const node = await figma.getNodeByIdAsync(fix.nodeId);
  if (!node) return { applied: 0, error: `${label}: node ${fix.nodeId} not found — nothing applied` };
  if (!insideSet(node)) return { applied: 0, error: `${label}: ${node.name} is not inside ${set.name} — nothing applied` };
  let variable = null, style = null;
  if (fix.op === 'bindPaint' || fix.op === 'bindNumber') {
    variable = await figma.variables.getVariableByIdAsync(fix.variableId);
    if (!variable) return { applied: 0, error: `${label}: variable ${fix.variableId} not found — nothing applied` };
  }
  if (fix.op === 'bindPaint') {
    if (variable.resolvedType !== 'COLOR') return { applied: 0, error: `${label}: ${variable.name} is not a colour — nothing applied` };
    if (!node[fix.paint]?.[fix.index] || node[fix.paint][fix.index].type !== 'SOLID') return { applied: 0, error: `${label}: ${node.name} has no solid ${fix.paint}[${fix.index}] — nothing applied` };
  }
  if (fix.op === 'bindNumber') {
    if (variable.resolvedType !== 'FLOAT') return { applied: 0, error: `${label}: ${variable.name} is not a number — nothing applied` };
    const missing = fix.fields.filter((f) => !(f in node));
    if (missing.length) return { applied: 0, error: `${label}: ${node.name} has no ${missing.join(', ')} — nothing applied` };
  }
  if (fix.op === 'textStyle') {
    if (node.type !== 'TEXT') return { applied: 0, error: `${label}: ${node.name} is not a text layer — nothing applied` };
    style = await figma.getStyleByIdAsync(fix.styleId);
    if (!style || style.type !== 'TEXT') return { applied: 0, error: `${label}: text style ${fix.styleId} not found — nothing applied` };
  }
  if (fix.op === 'description' && !['COMPONENT_SET', 'COMPONENT'].includes(node.type))
    return { applied: 0, error: `${label}: descriptions can only be set on components — nothing applied` };
  prepared.push({ fix, label, node, variable, style });
}

// ---- Checkpoint ----
const version = await figma.saveVersionHistoryAsync(CHECKPOINT, `${prepared.length} approved figma-audit fixes on ${set.name}`);

// ---- Apply ----
const results = [];
for (const { fix, label, node, variable, style } of prepared) {
  try {
    let before, after;
    if (fix.op === 'bindPaint') {
      before = paintsOf(node, fix.paint);
      const paints = [...node[fix.paint]];
      paints[fix.index] = figma.variables.setBoundVariableForPaint(paints[fix.index], 'color', variable);
      node[fix.paint] = paints;
      after = paintsOf(node, fix.paint);
    } else if (fix.op === 'bindNumber') {
      before = numbersOf(node, fix.fields);
      for (const f of fix.fields) node.setBoundVariable(f, variable);
      after = numbersOf(node, fix.fields);
    } else if (fix.op === 'textStyle') {
      before = node.textStyleId || null;
      await figma.loadFontAsync(style.fontName);
      await node.setTextStyleIdAsync(style.id);
      after = style.name;
    } else if (fix.op === 'rename') {
      before = node.name;
      node.name = fix.name;
      after = node.name;
    } else if (fix.op === 'description') {
      before = node.description || null;
      node.description = fix.description;
      after = node.description;
    }
    results.push({ ref: fix.ref, op: fix.op, nodeId: node.id, node: node.name, before, after });
  } catch (e) {
    return { checkpoint: { title: CHECKPOINT, id: version?.id }, applied: results.length, results, error: `${label} failed: ${e.message} — fixes after it were not applied` };
  }
}
return { checkpoint: { title: CHECKPOINT, id: version?.id }, applied: results.length, results };
