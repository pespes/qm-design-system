# FIGMA VARIABLES & DESIGN TOKENS

This document explains the token system, how tokens flow from Figma into the codebase, and how to use them in components.

### Quick References

- [componentGuide.md](./componentGuide.md)
- [componentChecklist.md](./componentChecklist.md)
- `libs/ui-tokens/tokens/figma-tokens.json` (Token source file to view token descriptions)
- `libs/ui-tokens/dist/css/tokens.css` (Token output styles that components use)
- `libs/ui-tokens/src/dictionary-config.ts` (how tokens are processed)

## Token System Overview

Design tokens are the single source of truth for all visual properties. The flow is:

```
Figma Variables (figma-tokens.json, updated by design team)
    ↓
Style Dictionary transformation pipeline
    ↓
CSS Variables (tokens.css, tokens.pro.css in `ui-tokens/dist/css`)
    ↓
ui-components import in `globals.css` and use via custom Tailwind utilities
```

## Source File: `figma-tokens.json`

**Location**: `libs/ui-tokens/tokens/figma-tokens.json`
This is the exported JSON from Figma containing all token definitions. Each token has:
- **name** — semantic identifier (e.g., `color/surface/default`, `spacing/100`)
- **$type** — figma defined category (COLOR, FLOAT, STRING etc.)
- **$description** (optional) — explains its purpose (eg "Default page/body background")
- **$value** — either a primitive value or alias to another token
- **collectionName** - which collection (Primitives, Theme, Component) it belongs to

## Understanding Token Names

Tokens transform from Figma to CSS:
- Figma name: `color/surface/default`
- CSS variable: `--color-surface-default`
  (slashes become hyphens, add `--` prefix)

To understand what a token does, read its `$description` in figma-tokens.json.
To verify a token is available, check if it exists in `tokens.css`.

## Token Collections in Figma

### Primitives Collection

Raw foundational values. Tokens beginning with spacing/, radius/, borderWidth/, are all available for reference by components. Type-related tokens and color tokens are **not referenced directly in components**, acting as building blocks for the semantic color / type tokens.

Examples: `color/grey/050`, `spacing/4`, `radius/200`, `fontSize/100`

### Theme Collection

Semantic tokens with meaningful names and descriptions. These map to primitives and automatically resolve per theme (homeowner vs. pro).

**Token naming pattern**: `<semantic>/<role>`
- `surface/*` — background colors
- `foreground/*` — text and icon colors
- `border/*` — borders and dividers
- `accent/*` — brand accent colors
- `danger/*` — error/destructive states
- `success/*` — positive/confirmation states
- `warning/*` — cautionary/alert states
- `info/*` - informational context colors
- `state/*` - interaction state colors (ie. hover, pressed, disabled)


## Final Token Output: `tokens.css`

**Location**: `libs/ui-tokens/dist/css/tokens.css`
After Style Dictionary processing, tokens are output as CSS custom properties. This is an example of what components use:

```css
--color-surface-default: rgba(255, 255, 255, 1);
--color-accent-background: rgba(122, 55, 183, 1);
--border-width-4: 0.25rem;
--spacing-100: 0.25rem;
--radius-100: 0.125rem;
--radius-full: 624.9375rem;
--shadow-200: 0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.06);

/* Typography tokens created as custom utility*/
@utility type-header-display1 {
  font-size: 2.5rem;
  font-family: 'DM Sans';
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0;
}
```

## Using Tokens in Components

### Token Categories

Components must use tokens for these visual categories:

| Category | Token prefix | CSS Variable Example | Tailwind Usage in Component |
|----------|------------|---------|---------|
| Color | `--color-*` | `--color-surface-default` | `bg-color-surface-default`, `text-color-foreground-default` |
| Spacing | `--spacing-*` | `--spacing-100` | `p-spacing-100`, `m-spacing-200`, `gap-spacing-300` |
| Radius | `--radius-*` | `--radius-100` | `rounded-radius-100` |
| Shadow | `--shadow-*` | `--shadow-200` | `shadow-shadow-200` |
| Border width | `--border-*` | `--border-width-4:` | `border-border-width-4` |
| Typography | `type-` | `@utility type-header-display1` | `type-header-display1` |

**Typography note**: Type-related primitives (fontSize, fontFamily, fontWeight, etc.) are **not surfaced** for direct component use — they are internal building blocks. Use the typography utility class names instead (e.g., `type-header-h1`).

### Token Not Found?

If Figma specifies a value that doesn't have a matching token in `tokens.css`, do the following:
1. **Check `figma-tokens.json`** for the figma exported variable (using `/` instead of `-` to separate naming layers)
2. **Surface the Missing token**: If found in figma-tokens.json, comment "Token X exists in figma-tokens.json but not in tokens.css. The Style Dictionary pipeline may need to be adjusted to output the token." If not found, comment "This needs token X, but I can't find it in figma-tokens.json. You need to run the `figma-token-sync` plugin to add the token to the repo." 
3. **Do not use arbitrary value without permission.** 
