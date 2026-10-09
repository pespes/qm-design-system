# figma-audit rules

## Level checks (`scripts/level-audit.js`)

| Rule | Flags | Fix type |
|---|---|---|
| `stale-binding` | A variable that isn't in `figma-tokens.json`, when a synced variable with the same name exists (e.g. the duplicate `surface/default` 7903:133 vs synced 7903:132) | **auto** if both have the same value in every mode; otherwise **choose** |
| `unsynced-variable` | A variable that isn't in `figma-tokens.json` and has no synced twin | **code**: re-run `figma-token-sync`, or the design uses a token the code doesn't have |
| `unknown-variable` | The bound variable can't be resolved, e.g. a deleted library variable | **designer** |
| `primitive-binding` | A primitive colour bound directly (`color/grey/100`). Primitive colours have no CSS variable in code | **auto** or **choose**: semantic tokens that alias the same value |
| `missing-css-token` | A synced variable with no CSS variable in `tokens.css` | **code**: token pipeline |
| `raw-color` | A solid fill or stroke with no variable | **auto** if exactly one semantic token fits the role and matches the value exactly; **choose** if several fit; **designer** if none |
| `raw-number` | Unbound padding, gap, radius or stroke weight that exactly matches a spacing, radius or borderWidth token (fixed width/height is reported as info) | **auto** if exactly one token fits; width/height are always **choose** |
| `no-text-style` | A text layer without a text style | **auto** if exactly one local style matches size and weight; otherwise **choose** or **designer** |
| `unsynced-text-style` | A text style that isn't in `figma-tokens.json` | **code** |
| `mixed-text-style` | A text layer that mixes styles | **designer** |
| `missing-description` | The component set has no description | **auto**: Claude drafts it and the runner approves the wording |

### What counts as "auto"

An auto fix must satisfy all of these:
- It binds an **existing** variable or style. Nothing is created.
- The token's resolved value **equals** the current value in **every mode** (Homeowner and Pro), so nothing changes visually in either brand.
- The token **fits the role**:
  - its scopes allow the property
  - its name matches the role: `border/*` for strokes, `foreground/*` or `*/text` for text, `surface/*` or `*/background*` for fills, `spacing/*` for gaps and padding
- There is exactly **one** such token.

If any of these fail, it's **choose**, and the runner sees the candidates with their values in each mode. Auto still requires approval; it only means the fix is safe to suggest as the default.

### Scope rules

- **Instances aren't walked.** Layers inside an instance belong to their main component. Fixing them here would only add an override, so audit their set instead (`nestedComponentSets`).
- **Spacing on empty frames is skipped:** gap needs two or more children, padding needs one.
- **Colour matching is exact**, including alpha. Near-matches are left for a designer to decide.
- **Alias + opacity values are resolved.** Some Theme variables store a colour alias plus an opacity rather than a plain colour: `state/*` (e.g. `state/disabled` = `color/black` at 38%) and `surface/overlay` (`color/grey/950` at 50%). They're flattened to hex with alpha before matching, so a raw `#000000` at 38% matches `state/disabled`.

## Southleft checks (figma-console built-in tools)

**`figma_lint_design`** runs:
- 10 WCAG 2.2 rules: contrast, non-text contrast, colour-only, focus indicator, target size, image alt, heading order, reflow, reading order, disabled context
- `default-name`, `detached-component` and `token-misuse`
- the layout rules `no-autolayout` and `empty-container`

`hardcoded-color` and `no-text-style` are switched off, because the Level checks replace them with token suggestions.

**`figma_audit_component_accessibility`** gives a 0–100 score for:
- variant coverage
- focus indicator
- colour differentiation
- target size
- annotations
- colour-blind safety

It classifies each component as interactive or presentational. See [a11y-categories.md](a11y-categories.md).

### Known false positives (drop, and say how many)

| Finding | Why it's wrong for Level |
|---|---|
| Focus variant "has no visible indicator" | Level's focus ring is a nested `_Focus ring` instance, which the tool doesn't look inside. Confirm visually in the Focus variant's screenshot. |
| Target size below 24×24 on primitives that only appear inside a field (e.g. `Check` 16×16) | Their target is the whole field row, label included. Check the composed set (e.g. `Checkbox`) instead. |
| `empty-container` on `Background` / `Focus` / `Offset` frames | These are intentional fill-only or ring shapes. |
| `no-autolayout` on the component set itself | Component sets are never auto-layout. |
| Missing hover/active/loading variants | Not every component needs them, and some states may be handled in code (e.g. with `state/*` tokens). Only report a missing state when the code component has it, or when the component is interactive and the state is plainly needed. |
| `wcag-disabled-no-context` | This is a usage concern (explain why something is disabled), not a component defect. Report it once as a docs note. |

## Never auto-fixed

- Adding or removing variants or states, e.g. a missing Indeterminate or hover state
- Any change to a visual value, colour, size or spacing
- Renaming variant properties or values
- Anything on a layer inside an instance
- Creating variables or styles

Report these in the designer or code group.
