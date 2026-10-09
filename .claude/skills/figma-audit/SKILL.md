---
name: figma-audit
description: Audit ONE Level design system component set in Figma against the design system (tokens synced to code, text styles, naming, states, WCAG) and, only after the person running it approves specific fixes, write those fixes to Figma with a version-history checkpoint. Use when asked to "audit", "lint", "clean up", "fix", or "bring in line with the design system" a Figma component, or to check a component's tokens or accessibility in Figma.
---

# Figma audit (audit, then approved fixes)

This is the **only** sanctioned way to write to the Level Figma file. Everything else, including `figma-inspect` and the component workflows, stays read-only. The audit itself is read-only; writes happen only in step 7, only for fixes the runner approved, and always after a version checkpoint.

The skill combines three sources:
- **Southleft's checks, built into figma-console:**
  - `figma_lint_design` (WCAG 2.2 and layout rules)
  - `figma_audit_component_accessibility` (an a11y scorecard)
  - the background and scoring in [references/a11y-categories.md](references/a11y-categories.md) (MIT, from [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills))
- **Level checks** in `scripts/level-audit.js`, which compare the component against `libs/ui-tokens` and the code.
- **Fixes** in `scripts/apply-fixes.js`, modelled on figmalint's auto-fix. Each fix binds an existing token; nothing is invented.

Rule details, auto-fix criteria and known false positives: [references/rules.md](references/rules.md).

## 1. Connect and target

1. Run `figma_get_status` with `probe: true`. The link's fileKey must match `connectedFile.fileKey`. The built-in lint tools act on the **active** file, so if it doesn't match, ask the runner to bring that file to the front.
2. Audit **one component set** per run. If the link points at a page, list its component sets and ask which one to audit.
3. Prerequisite: `libs/ui-tokens/dist/css` must exist. If it doesn't, run `pnpm build:tokens`.

## 2. Run the audit (read-only)

Run these three in parallel:
- **Level checks:** generate the code, then pass it to `figma_execute` with the `fileKey` and `timeout: 30000`:
  ```bash
  node .claude/skills/figma-audit/scripts/build.mjs audit <figma-url-or-node-id>
  ```
  Leave the `// fileKey:` line out of the code; pass it as the `fileKey` parameter.
- `figma_lint_design` with `nodeId` and `rules: ["wcag", "layout", "default-name", "detached-component", "token-misuse"]`. This skips `hardcoded-color` and `no-text-style`, because the Level checks cover those and add token suggestions.
- `figma_audit_component_accessibility` with `nodeId`.

Also capture a screenshot with `figma_capture_screenshot` on the set. If the component exists in code (`libs/ui-components/src/components/`), read its types and compare:
- variant properties, e.g. `Size=Small/Default/Large` vs `sm | md | lg`
- states, e.g. a Figma `Indeterminate` state the code lacks, or the other way round
- props

## 3. Triage

- Drop the known false positives listed in references/rules.md, and say how many you dropped.
- Findings on layers inside instances belong to the nested set: list `nestedComponentSets` as "audit next" and don't fix them here.
- Merge duplicates that the lint and Level checks both report.

## 4. Report

Number every row. Group the rows by who acts on them:

```text
Audit: <set> (<n> variants) · a11y score <n>/100 · <n> findings (<n> dropped as known false positives)

Auto-fixable (same value in every mode, one clear token)
 1. stale-binding  Background fill → surface/default (synced 7903:132)   2 variants   #ffffff / #ffffff

Choose (pick a candidate, or skip)
 2. raw-number     Background height 16 → spacing/400?                  12 variants

Designer (no token fits, or a variant/visual change is needed)
 3. raw-color      Disabled stroke #000000 @ 38%, no token                1 variant
 4. a11y           Focus ring not detected by the lint tool (it's a nested instance; check manually)

Code / pipeline
 5. naming         Figma Size=Small/Default/Large vs code sm|md|lg (keep as is: code maps them)

Audit next: _Focus ring, Icon / check
```

## 5. STOP for approval

Ask the runner which rows to apply, e.g. "1, 2 → spacing/400". The runner is whoever invoked the audit, and their approval covers only the rows they name. Never apply:
- rows that weren't approved
- anything from the designer or code groups
- anything that adds or removes variants or changes a visual value

For descriptions, show the exact text and get approval of the wording.

## 6. Build the fix plan

Write the approved rows to `<scratchpad>/figma-audit-plan.json`, expanding each row to every node it covers, then build the code:

```json
{ "setId": "8029:156", "setName": "Check", "fixes": [
  { "ref": 1, "op": "bindPaint", "nodeId": "8029:158", "paint": "fills", "index": 0, "variableId": "VariableID:7903:132" }
] }
```
```bash
node .claude/skills/figma-audit/scripts/build.mjs fix <scratchpad>/figma-audit-plan.json
```

The ops are:

| op | Fields |
|---|---|
| `bindPaint` | `nodeId`, `paint` (`fills` or `strokes`), `index`, `variableId` |
| `bindNumber` | `nodeId`, `fields` (list), `variableId` |
| `textStyle` | `nodeId`, `styleId` |
| `rename` | `nodeId`, `name` |
| `description` | `nodeId`, `description` |

The builder rejects unknown ops, malformed fields and layers inside instances.

## 7. Apply (writes)

Run the printed code with `figma_execute`, passing `fileKey` and `timeout: 30000`. The script:
1. validates every fix, and writes nothing if any fails
2. saves a version-history checkpoint named `figma-audit: before <n> fixes to <set> (<time> UTC)`
3. applies the fixes, stopping at the first error

Report the checkpoint name, then `applied` and `before → after` for each fix. If it stops partway, report what was applied and the error. Don't retry blindly.

## 8. Verify

Re-run the Level audit and take a fresh screenshot. Confirm:
- the fixed findings are gone
- nothing else changed
- the screenshot looks the same as before (binding to a token with an identical value makes no visible change)

To undo the batch: in Figma, open **File › Show version history** and restore the checkpoint.
