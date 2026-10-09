# READING FIGMA SPECS

How to extract a component spec from Figma for implementation. Used by the `create-component` workflow (Step 4) and any task that compares a component against its Figma design.

The preferred connection is **figma-console-mcp via the Figma Desktop Bridge plugin** (Tier 1). If it is unavailable, fall back to the **official Figma MCP** (Tier 2), then to **user-provided material** (Tier 3). Always report which tier was used and what could not be read.

## Read-Only Rule

Figma is the design team's source of truth. During component work, only use **read** tools. figma-console-mcp also exposes write tools (`figma_execute`, `figma_set_*`, `figma_create_*`, `figma_delete_*`, `figma_rename_*`, `figma_batch_*`, `figma_post_comment`, etc.) — never call them unless the user explicitly asks for a change in Figma.

**One exception:** `figma_execute` may be used to run the repo's read-only inspection script, [figmaInspect.js](./figmaInspect.js), exactly as printed by the `figma-inspect` skill's helper, which fills in the node IDs and depth and refuses to run if the script contains write calls:

```bash
node .claude/skills/figma-inspect/scripts/build-inspect.mjs <figma-url-or-node-id>... [--depth N]
```

Always pass the linked file's `fileKey`. Do not hand-edit the printed code or run any other code through `figma_execute` without the user's explicit permission.

Read tools used in this guide:
- **Tier 1 (figma-console):** `figma_get_status`, `figma_reconnect`, `figma_search_components`, `figma_analyze_component_set`, `figma_get_component_for_development_deep`, `figma_get_component_for_development`, `figma_get_annotations`, `figma_get_variables`, `figma_take_screenshot`, and `figma_execute` with `figmaInspect.js` only
- **Tier 2 (official Figma MCP):** `get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot`

## 1. Parse the Link

From `https://www.figma.com/design/<fileKey>/<fileName>?node-id=<a>-<b>`:
- **fileKey** — the segment after `/design/`. For branch URLs (`/design/<fileKey>/branch/<branchKey>/...`) use the `branchKey`.
- **nodeId** — convert the URL's `a-b` to `a:b` (e.g. `8029-155` → `8029:155`).
- If the link has no `node-id`, ask for a node-specific link. Do not guess a node.

## 2. Connect (Tier 1)

1. Call `figma_get_status` with `probe: true`. A healthy connection reports `setup.valid: true` and a successful `probeResult`.
2. **Verify the file.** Compare the link's fileKey with `transport.websocket.connectedFile.fileKey`. Several files can be connected at once — only the active one is read. If they differ, stop and ask the user to bring the linked file to the front in Figma Desktop with the Desktop Bridge plugin running, then re-check.
3. **If the probe fails**, call `figma_reconnect` once and re-probe. If it still fails, tell the user: "Figma Desktop Bridge isn't responding — open Figma Desktop and run the Figma Console MCP Desktop Bridge plugin in the linked file." Ask whether to wait or continue with Tier 2.

## 3. Locate the Component Set

Links often point at a page or section, not the component itself.
- Use `figma_search_components` with the component name to list candidates (`nodeId`, `type`, `description`). Variant analysis needs the **COMPONENT_SET** node, not a single variant or the page.
- **Figma names may not match code names.** For example, Figma's `Check` set is the code's `primitives/checkbox`, and Figma's `Checkbox` set is `composed/checkbox`. Present the Figma → code mapping you intend to use and confirm it with the user if there is any ambiguity.
- For **composed** components, note every nested component set (e.g. `Checkbox` contains a `Check` instance). Their styling lives in the nested set, not the composed one.

## 4. Extract (Tier 1)

| Need | Tool | Notes |
|---|---|---|
| Props, variants, states | `figma_analyze_component_set` on the component set **and each nested set** | `variantAxes` → variant props; `componentProps` → props (BOOLEAN → boolean, TEXT → string, INSTANCE_SWAP → ReactNode); `stateMachine.cssMapping` → state selectors (Focus → `:focus-visible`, Error → `[aria-invalid="true"]`, Disabled → `:disabled`). |
| Per-state styling | Same call, each variant's `signature` | Compare `signature` (fill/stroke token, stroke weight, effects) across variants yourself. `diffFromDefault` can be `null` when the tool can't identify a default variant — don't rely on it. A composed set's root usually has an empty signature; read the nested set instead. |
| Anatomy & layout | `figma_get_component_for_development_deep` on the default variant (depth 3–5 is usually enough) | Each distinctly styled layer → a `ClassMap` key. `layoutMode` → flex direction, `itemSpacing` → gap, `primaryAxisAlignItems`/`counterAxisAlignItems` → justify/align, `layoutSizing*` → fixed/fill/hug. `boundVariables` are resolved to token names. |
| Stroke side, fill ownership, text styles, unresolved variables, raw values | `figma_execute` with [figmaInspect.js](./figmaInspect.js) on the default variant of each set (and on other variants whose `signature` differs) | The packaged tools omit these. Use the script's output as the source of truth for: **which layer owns each fill/stroke** (`figma_analyze_component_set` can attribute a child's fill to a composed root); **`strokeAlign`** (`INSIDE` → `border`, `OUTSIDE` → `ring`, `CENTER` → ask); **`text.textStyle`** (`text/header/caption` → `type-header-caption`); variable names the other tools leave as IDs; and **`raw: true`** paints with no variable. |
| Designer specs | `figma_get_annotations` with `include_children: true` | Accessibility, interaction, and animation notes. Report "no annotations" explicitly if none exist. |
| Visual reference | `figma_take_screenshot` on the component set | Don't save it to disk — re-fetch a fresh screenshot whenever comparing against Storybook, so the comparison reflects the current design. |

## 5. Map Tokens

Map every bound variable to `libs/ui-tokens/dist/css/tokens.css` (run `pnpm build:tokens` if it doesn't exist). The tools return names **without** the collection's type prefix, so map them like this:

| Figma variable | CSS variable | Tailwind usage |
|---|---|---|
| `border/default`, `brand/background` (color) | `--color-border-default`, `--color-brand-background` | `border-border-default`, `bg-brand-background` |
| `spacing/400` | `--spacing-400` | `p-400`, `gap-400`, `size-400` |
| `radius/200` | `--radius-200` | `rounded-200` |
| `borderWidth/1` | `--border-width-1` | `border-1` |

Verify each CSS variable exists in `tokens.css`. Then handle the exceptions — **never guess a token from a matching value**:
- **Unresolved ID** (e.g. `VariableID:7903:133` with no name): run `figmaInspect.js` — it resolves variables through the Plugin API, which names IDs the other tools can't (in testing it resolved `7903:133` as the local Theme variable `surface/default`). Without the Desktop Bridge, search for the ID in `libs/ui-tokens/tokens/figma-tokens.json`, or check the official MCP's `get_variable_defs` / `get_design_context` output. If the name is found but its ID differs from the one in `figma-tokens.json`, use the token **and** flag that the synced token file may be out of date (re-run `figma-token-sync`). If no name is found, report it as unresolved with its raw value.
- **Text styles:** a text layer bound to a Figma text style maps to the matching `type-*` utility (`text/header/h4` → `type-header-h4`). Only fall back to individual font tokens when the script reports no `textStyle`.
- **Raw value** (e.g. `strokeHex: #000000` with no token): follow the "Token Not Found" workflow in [figmaVariables.md](./figmaVariables.md) and flag it for the design team.

## 6. Fallback: Official Figma MCP (Tier 2)

Use when the Desktop Bridge is unavailable and the user chose to continue.
1. **Load the `figma-design-to-code` skill first** — the official server requires it before `get_design_context`.
2. `get_metadata` (fileKey, nodeId) on the component set — returns the set as a `frame` and each variant as a `symbol` with its name and node ID. Derive variant axes from the names (`Checked?=True, State=Focus` → `Checked?: False | True | Indeterminate`, `State: …`).
3. `get_variable_defs` on the component set — every variable used across all variants, with resolved values (e.g. `brand/background: #00780e`). It does **not** say which layer or variant uses each one; use it as the token inventory and to name IDs.
4. `get_design_context` on **each variant you need to compare** (it reads one node at a time), passing `skillNames: "figma-design-to-code"`. It returns reference React/Tailwind code with Figma variables as `var(--surface/default, white)` plus an inline screenshot. **Adapt it to this repo's tokens and conventions, never copy it** — map variable names with the table in section 5. A hardcoded hex with no `var(...)` is a raw value (section 5). If the response is flagged as sparse, request its child nodes instead of using it.
5. `get_screenshot` — returns a short-lived URL that has to be downloaded to view. Prefer the inline screenshot from `get_design_context`.

**Not available in Tier 2:** the variant state-machine analysis (state → CSS selector mapping) and annotations. List both as gaps in the summary, and ask the user about any state styling or a11y requirements that can't be confirmed.

## 7. Fallback: No Figma Access (Tier 3)

Ask the user for screenshots of each variant/state and the token names or values used. Since these can't be re-fetched, save them under `.design-refs/<componentName>/` (git-ignored) so later steps can compare against them. Treat everything as **unverified** in the summary and confirm each value with the user before implementing.

## 8. Output: Figma Spec Summary

Before presenting, **check proposed prop names and values against existing components** (`componentGuide.md` "Props"): e.g. sizes are `'sm' | 'md' | 'lg'` in Button, IconButton, and Switch (`grep -rn "SIZE_TYPES\|size?:" libs/ui-components/src/components`). Propose the existing convention, and list any Figma names that differ so the user decides once, at the stop.

Present this to the user and **stop until they confirm or correct it**. Do not write code based on an unapproved summary:

```text
Source: Tier <1|2|3> — <tools used>; file "<name>" (<fileKey>), node <nodeId>
Figma → code mapping: <Figma set> → <code component> ...
Props: <prop>: <values> (default <value>) ...
Naming: <Figma name → proposed name, following <existing component>; or "matches existing conventions">
Base UI/shadcn API: <relevant props, data-* attributes, callbacks from Step 3>
States: <state> → <selector> ...
Anatomy / ClassMap keys: <layer> → <key> ...
Tokens: <layer>.<property>: <figma variable> → <css variable> ✅ | ⚠️ unresolved | ❌ missing
Raw values / unresolved: <list, or "none">
Annotations: <summary, or "none">
Design issues to flag: <e.g. variable bound by ID that doesn't match the synced token, raw values>
Design vs code gaps: <e.g. Figma has an Indeterminate state the current code doesn't support>
Not read (tier limits): <e.g. annotations unavailable in Tier 2>
```
