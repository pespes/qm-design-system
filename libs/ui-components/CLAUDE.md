# CLAUDE.md — ui-components

This file provides quick reference for component-engineering in ui-components. For repo-wide context, see [root CLAUDE.md](../../CLAUDE.md).

## Package Scope

ui-components is a React component library built on Shadcn + BaseUI, styled with Tailwind v4 and css stylesheet from ui-tokens.

- **Primitives** (`src/components/primitives/`): Shadcn created low-level components
- **Composed** (`src/components/composed/`): Multi-component aggregations
- **Shared utils** (`src/components/_shared/`): Shared typings / utils across multiple components. iconSlot handles icon size/position conventions, renderUtils handle resolving native Button element tag, and validationUtils helps parse received error messages for *Field components.
- Full architecture of package: [README.md](./README.md)

## Icon Conventions
This package uses `lucide-react` for its icons, supported by Shadcn and included in any `*.stories.tsx files`. Any buttons containing these icons have mapped sizings and positionings, found in `src/components/_shared/iconSlot.ts`.

## Getting Started

**Read these first - do not skip** (in order):

1. [componentGuide.md](./docs/componentGuide.md) — Rules, patterns, file structure, conventions, styling
2. [figmaVariables.md](./docs/figmaVariables.md) — Available tokens and their Figma mappings
3. [componentTesting.md](./docs/componentTesting.md) - Testing patterns for components
4. [componentChecklist.md](./docs/componentChecklist.md) — Completion criteria

### Reference Implementation
See `composed/input/` for an annotated reference. All `/** */` comments explain conventions.

## Local Development Commands (run from root of repo)

```bash
# Viewing & testing
pnpm storybook                      # Start Storybook (http://localhost:6006)
nx test ui-components --watch     # Watch mode (fast, for active development)
nx test ui-components             # Full test suite (CI command)

# Building & validation
pnpm build:components               # Build dist/
nx lint ui-components               # ESLint check
nx typecheck ui-components          # TypeScript check

# Adding Shadcn components
pnpm -C libs/ui-components exec shadcn add <name>   # Auto-scaffolds to primitives/ (uses the installed shadcn version)
```

## Pre-PR Checklist

Before opening a PR for a new component, ensure all criteria listed in [componentChecklist.md](./docs/componentChecklist.md) are met.
Root CLAUDE.md covers lint, typecheck, tests, commit format and screenshots.

### Breaking Changes

A change to an existing component is **breaking** if a consumer's code breaks without them changing anything. Treat any of these as breaking:
- A prop is removed / renamed, or becomes required
- A prop's default value changes
- An export is removed or renamed in `src/index.ts`

New optional props, new exports or new stories are **not** breaking.

If a PR contains one, mark the commit as breaking by appending `!` directly after the type/scope, or use a `BREAKING CHANGE:` footer when the reason needs more than a subject line:
```bash
feat(ui-components)!: <message>
```

``` bash
feat(ui-components): <message>

BREAKING CHANGE: <what is breaking>
```
Scope is required and must be the affected package to prevent major bumps on unaffected packages.

### PR Splitting (New Components)

If changes exceed 300 lines of code, it must be split into multiple PRs:

1. **Core PR** (always first):
   - `ComponentName.tsx`, `ComponentName.types.ts`, `index.ts`, barrel export in `src/index.ts`
   - Additional files may be included if the PR stays under 300 lines
   - If stories are not included, add a screenshot of the Primary Storybook example

2. **Stories + Tests PR(s)**:
   - Keep each story file with its related test (e.g., story scaffold + `.mdx` + default story test in one PR, remaining stories + tests in another)
   - Every PR must include screenshots of the stories it contains

### Branch Naming
The branch name should always follow the convention:
```bash
<componentName>
```
If subsequent PRs / branches needed, they should be identified by scope:
```bash
<componentName>-stories  # for all stories + tests added
<componentName>-<type>-stories # if multiple story / test PRs, type of stories (ie. state)
```
