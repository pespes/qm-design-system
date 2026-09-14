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
pnpm dlx shadcn@latest add <name>   # Auto-scaffolds to primitives/
```

## Pre-PR Checklist

Before opening a PR for a new component, ensure all criteria listed in [componentChecklist.md](./docs/componentChecklist.md) are met.
Root CLAUDE.md covers lint, typecheck, tests, commit format and screenshots.

### PR Splitting (New Components)

If changes exceed 300 lines of code, it must be split into several PRs:

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
QP-<ticketNumber>-<componentName>
```
If subsequent PRs / branches needed, they should be identified by scope:
```bash
QP-<ticketNumber>-<componentName>-stories  # for all stories + tests added
QP-<ticketNumber>-<componentName>-<type>-stories # if multiple story / test PRs, type of stories (ie. state)
```
