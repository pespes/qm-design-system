// READ-ONLY Figma inspection script, run via figma-console `figma_execute` (Desktop Bridge).
// See figmaReading.md. Do not add setters, create*/remove() calls, or anything that changes the document.
//
// Usage: copy this file's contents into `figma_execute` (pass the linked file's `fileKey`),
// replacing NODE_ID and MAX_DEPTH below. Returns a per-layer tree with properties the packaged tools omit:
// stroke alignment, which layer owns each fill/stroke, variable bindings resolved to names (including ones
// the other tools leave as IDs), raw values with no variable, text styles, and instance references.

const NODE_ID = '__NODE_ID__'; // e.g. '10860:2573'
const MAX_DEPTH = 4;

const MIXED = 'mixed';
const val = (v) => (v === figma.mixed ? MIXED : v);
const hex = ({ r, g, b }) =>
  '#' + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0),
    ),
  );

const variableCache = new Map();
async function resolveVariable(id) {
  if (!id) return null;
  if (!variableCache.has(id)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (!v) {
      variableCache.set(id, { id, unresolved: true });
    } else {
      const collection = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
      variableCache.set(id, compact({ name: v.name, collection: collection?.name, remote: v.remote || undefined, id }));
    }
  }
  return variableCache.get(id);
}

async function readPaint(paint) {
  const boundId = paint.boundVariables?.color?.id;
  return compact({
    type: paint.type,
    visible: paint.visible === false ? false : undefined,
    color: paint.color ? hex(paint.color) : undefined,
    opacity: paint.opacity !== undefined && paint.opacity !== 1 ? paint.opacity : undefined,
    variable: boundId ? await resolveVariable(boundId) : undefined,
    raw: paint.type === 'SOLID' && !boundId ? true : undefined, // no token behind this colour
    scaleMode: paint.scaleMode,
  });
}

async function readBoundVariables(node) {
  const out = {};
  for (const [field, binding] of Object.entries(node.boundVariables || {})) {
    if (field === 'fills' || field === 'strokes' || field === 'effects') continue; // covered per paint/effect
    const ids = (Array.isArray(binding) ? binding : [binding]).map((b) => b?.id).filter(Boolean);
    const resolved = await Promise.all(ids.map(resolveVariable));
    out[field] = resolved.map((r) => r.name || r.id + ' (unresolved)').join(', ');
  }
  return Object.keys(out).length ? out : undefined;
}

async function readText(node) {
  if (node.type !== 'TEXT') return undefined;
  const styleId = val(node.textStyleId);
  const style = styleId && styleId !== MIXED ? await figma.getStyleByIdAsync(styleId) : null;
  return compact({
    characters: node.characters.length > 40 ? node.characters.slice(0, 40) + '…' : node.characters,
    textStyle: style?.name || (styleId === MIXED ? MIXED : undefined),
    font: node.fontName === figma.mixed ? MIXED : `${node.fontName.family} ${node.fontName.style}`,
    fontSize: val(node.fontSize),
    fontWeight: val(node.fontWeight),
    lineHeight: node.lineHeight === figma.mixed ? MIXED : node.lineHeight.unit === 'AUTO' ? 'auto' : `${node.lineHeight.value}${node.lineHeight.unit === 'PERCENT' ? '%' : 'px'}`,
    letterSpacing: node.letterSpacing === figma.mixed ? MIXED : `${node.letterSpacing.value}${node.letterSpacing.unit === 'PERCENT' ? '%' : 'px'}`,
    textAlign: node.textAlignHorizontal,
  });
}

async function readNode(node, depth) {
  const fills = 'fills' in node && node.fills !== figma.mixed ? await Promise.all(node.fills.map(readPaint)) : undefined;
  const strokes = 'strokes' in node ? await Promise.all(node.strokes.map(readPaint)) : undefined;
  const hasStroke = strokes && strokes.length > 0;
  const main = node.type === 'INSTANCE' ? await node.getMainComponentAsync() : null;

  return compact({
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible === false ? false : undefined,
    size: 'width' in node ? `${Math.round(node.width * 100) / 100}x${Math.round(node.height * 100) / 100}` : undefined,
    layout: 'layoutMode' in node && node.layoutMode !== 'NONE'
      ? compact({
          mode: node.layoutMode,
          gap: node.itemSpacing,
          padding: `${node.paddingTop} ${node.paddingRight} ${node.paddingBottom} ${node.paddingLeft}`,
          primaryAlign: node.primaryAxisAlignItems,
          counterAlign: node.counterAxisAlignItems,
        })
      : undefined,
    sizing: 'layoutSizingHorizontal' in node ? `${node.layoutSizingHorizontal}/${node.layoutSizingVertical}` : undefined,
    cornerRadius: 'cornerRadius' in node && node.cornerRadius !== 0 ? val(node.cornerRadius) : undefined,
    clipsContent: node.clipsContent || undefined,
    opacity: node.opacity !== undefined && node.opacity !== 1 ? node.opacity : undefined,
    blendMode: node.blendMode && !['PASS_THROUGH', 'NORMAL'].includes(node.blendMode) ? node.blendMode : undefined,
    fills,
    strokes,
    strokeAlign: hasStroke ? node.strokeAlign : undefined,
    strokeWeight: hasStroke ? val(node.strokeWeight) : undefined,
    effects: 'effects' in node && node.effects.length
      ? await Promise.all(node.effects.map(async (e) => compact({
          type: e.type,
          radius: e.radius,
          offset: e.offset ? `${e.offset.x},${e.offset.y}` : undefined,
          color: e.color ? hex(e.color) : undefined,
          variable: e.boundVariables?.color?.id ? await resolveVariable(e.boundVariables.color.id) : undefined,
        })))
      : undefined,
    boundVariables: await readBoundVariables(node),
    text: await readText(node),
    instanceOf: main ? compact({ name: main.name, set: main.parent?.type === 'COMPONENT_SET' ? main.parent.name : undefined, key: main.key }) : undefined,
    componentProperties: node.type === 'INSTANCE' ? node.componentProperties : undefined,
    children: 'children' in node && depth < MAX_DEPTH
      ? await Promise.all(node.children.map((c) => readNode(c, depth + 1)))
      : undefined,
  });
}

const target = await figma.getNodeByIdAsync(NODE_ID);
if (!target) return { error: `Node ${NODE_ID} not found in "${figma.root.name}"` };
return { file: figma.root.name, node: await readNode(target, 0) };
