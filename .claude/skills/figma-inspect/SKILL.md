---
name: figma-inspect
description: Read a Level design system Figma design (read-only) and turn it into a spec mapped to this repo's tokens and components. Use whenever a figma.com link appears in this repo, or when asked to review, compare against, or check a component's Figma design — including outside the create-component/update-component workflows (e.g. "review the Avatar designs", "does the code match Figma?", "what are these hidden subcomponents?").
---

# Figma inspect (read-only)

Full guide: [figmaReading.md](../../../libs/ui-components/docs/figmaReading.md). It is the source of truth; this skill is the short path through it plus a helper for the inspection script.

## Rules

- **Figma is read-only.** Use only the read tools listed in figmaReading.md. Never call figma-console write tools (`figma_set_*`, `figma_create_*`, `figma_delete_*`, `figma_rename_*`, `figma_batch_*`, `figma_post_comment`, …). If the user wants the design fixed, switch to the `figma-audit` skill.
- `figma_execute` may **only** run the code printed by this skill's helper, and always with `fileKey`. Never hand-edit that code or run anything else through `figma_execute` without the user's permission.

## Steps

1. **Connect.** `figma_get_status` with `probe: true`. Check that `connectedFile.fileKey` matches the link's fileKey; if it doesn't, ask the user to bring the linked file to the front. If the bridge isn't responding, `figma_reconnect` once, then offer the official Figma MCP fallback (figmaReading.md §6).
2. **Map the page.** A link often points at a page. List its component sets read-only (`figma_search_components`, or `figma_analyze_component_set` on each set) and note:
   - descriptions
   - property definitions
   - which sets are hidden: an `_` prefix means internal to Figma, usually an internal primitive or nothing at all in code
3. **Inspect.** Generate the inspection code for the nodes you need (several at once is fine):
   ```bash
   node .claude/skills/figma-inspect/scripts/build-inspect.mjs <figma-url-or-node-id>... [--depth N]
   ```
   Pass the printed code (minus the `// fileKey:` line) to `figma_execute` as `code`, the printed fileKey as `fileKey`, and `timeout: 20000`. The helper converts URL node IDs (`10607-7401` → `10607:7401`) and refuses to run if `figmaInspect.js` contains anything that could write to the document. Use the output as the source of truth for:
   - which layer owns each fill and stroke
   - `strokeAlign`: `INSIDE` → `border`, `OUTSIDE` → `ring`
   - text styles: `text/header/h4` → `type-header-h4`
   - variable names, including IDs the other tools leave unresolved
   - `raw: true` paints, which have no token behind them
4. **Screenshot** with `figma_capture_screenshot` (current state). Don't save Figma screenshots; re-fetch them for each comparison.
5. **Map tokens** using the table in figmaReading.md §5. Verify each one against `libs/ui-tokens/dist/css/tokens.css` (run `pnpm build:tokens` if it's missing). Never guess a token from a matching value.
6. **Compare with code** when a component already exists. Read its files under `libs/ui-components/src/components/` and list the differences.

## Output

- **Building or updating a component:** present the "Figma Spec Summary" from figmaReading.md §8 and **stop** until the user approves it.
- **A review question:** answer it directly, using a Figma → code table:

  ```text
  | Figma | Purpose (from its description) | In code | Needed? |
  ```

  After the table, add any design-vs-code differences and design issues to flag (raw values, stale variable IDs). Say which connection tier was used and anything that couldn't be read.
