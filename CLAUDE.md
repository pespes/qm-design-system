# CLAUDE.md 

**Before writing any code, read the "Before Submitting Code" checklist at the end of this file.**

## Project Overview

qm-design-system is an Nx monorepo containing two publishable design system libraries and a token sync tool. **ui-tokens** is the token pipeline (Figma → DTCG → CSS/Native outputs). **ui-components** is a React component library built on Shadcn + BaseUI, styled with tokens from ui-tokens. **figma-token-sync** is a CLI + Figma plugin for syncing tokens from Figma into the repo. These packages power QM product UIs.

## Tech Stack

- **Language**: TypeScript 6.02
- **Runtime**: Node.js >= 22
- **Package Manager**: pnpm 10.33.0
- **Build System**: Nx 22.7.0
- **UI Framework**: React 19
- **Styling**: Tailwind CSS v4 with DTCG tokens
- **Component Library**: Shadcn (primitives for ui-components)
- **Test Runner**: Vitest 2.1.5 (primary, includes Storybook interaction tests), Jest (legacy)
- **Component Docs**: Storybook 10.3.6

## Monorepo Structure & Index

This is an Nx monorepo with two publishable libraries and one internal tool. For details on package architecture and workflows, see their respective documentation:

| Package | Location | Purpose | Documentation |
|---------|----------|---------|-----------------|
| **ui-tokens** | `libs/ui-tokens/` | Design token pipeline: Figma → DTCG → CSS/Native outputs | [README.md](libs/ui-tokens/README.md) |
| **ui-components** | `libs/ui-components/` | React component library (primitives + composed) | [README.md](libs/ui-components/README.md), [CLAUDE.md](libs/ui-components/CLAUDE.md) |
| **figma-token-sync** | `tools/figma-token-sync/` | CLI + Figma plugin for syncing tokens into repo | [README.md](tools/figma-token-sync/README.md) |

### Module Boundaries

Enforced via ESLint `@nx/enforce-module-boundaries` to prevent circular dependencies:
- `ui-components` can depend on `ui-tokens` (and `scope:ui`, `scope:shared`).
- `ui-tokens` can **only** depend on `scope:shared` — never on ui-components to keep tokens independently distributable

## Global Commands
Run from the repository root.

### Building Apps
```bash
pnpm build:tokens                   # Build token outputs (CSS, TS, native)
pnpm build:components               # Build ui-components (auto-triggers token build)
pnpm build:figma-sync               # Build figma-token-sync tool
pnpm build                          # Build all packages
```

### Storybook
```bash
pnpm storybook                      # Launch Storybook dev server (http://localhost:6006)
pnpm build:storybook                # Build static Storybook
```
### Figma-Token Sync
```bash
pnpm sync:tokens                    # Sync tokens from Figma
pnpm sync:tokens --file=/path/to.json     # Sync from custom path
pnpm sync:tokens --dry-run          # Test sync without commit / push
```

### Validation
```bash
pnpm typecheck                      # TypeScript check (all packages)
pnpm lint                           # ESLint check (all packages)
pnpm test                           # Run all tests
nx test <packageName>               # Run tests for specific package
```

## Session Working Rules

Agent permissions are configured in `.claude/settings.json`:
- **Allow list**: Nx commands, quality checks, git read/write operations
- **Deny list**: Force push, hard reset, rebase, clean, branch deletions, remove, pnpm sync:tokens without --dry-run flag

**Always:**
1. Read this file for project conventions and pre-submission checklist - do not skip.
2. Read package and root level README files for context and architecture of packages - do not skip.
3. Check the codebase before speculating - read relevant package code before making claims about what exists.
4. Ask when unclear - stop and ask before:
    - Expanding scope beyond what was asked.
    - Adding a new dependency.
    - Changing patterns established in the codebase.
5. Run tests on the packages modified: `pnpm nx test <packageName>`

## Protected Files

These files must not be changed without explicit human approval:

- `CLAUDE.md` & `libs/ui-components/CLAUDE.md` — AI guidance
- `nx.json` — Nx workspace config, task dependencies, and release automation
- `tsconfig.base.json`, `*/tsconfig.json`, `*/tsconfig.lib.json` — TypeScript paths and compilation config
- `eslint.config.mjs` — Lint rules and module boundary enforcement
- `.github/workflows/` — CI/CD pipelines
- `commitlint.config.mjs` — Commit message validation
- `.claude/settings.json` — Claude Code permissions and guardrails
- `.claude/commands/` — Slash command definitions
- `dist/`, `build/` — Build outputs (regenerated on build)

## Testing Conventions

### ui-tokens
- **Test Runners**: Jest
- **File location**: `src/dictionary/tests/` subdirectory
- **File naming**: `*.test.ts`
- **Pattern**: Unit tests for token processing logic, transforms, output formats

### figma-token-sync
- **Framework**: Vitest
- **File location**: `src/tests/` subdirectory
- **File naming**: `*.test.ts`
- **Pattern**: Integration tests with mock file systems, git workflows

### ui-components
- **Framework**: Vitest with Storybook interaction tests
- **File location**: colocated with component it tests
- **File naming**: `<ComponentName>.test.ts`
- **Pattern**: Storybook play tests exported as async functions, imported into story `play` prop
- **Scope**: Figma-defined props, user interactions (keyboard/mouse), state changes, accessibility, polymorphic rendering

## Commit Messages (Enforced by commitlint)

```text
<type>(scope): <subject>
```
`type`: feat, fix, docs, style, refactor, test, chore, build, ci
`scope`: Package name (ui-tokens, ui-components, plugin for figma-token-sync) or repo for root level changes
`subject`: Brief description of change

```bash
feat(ui-components): add SelectComponent
fix(ui-tokens): fix color token formatting
chore(repo): update dependencies
```

## When Uncertain

- Component patterns & structure: Read [componentGuide.md](libs/ui-components/docs/componentGuide.md)
- Available tokens & Figma mappings: Read [figmaVariables.md](libs/ui-components/docs/figmaVariables.md)
- Token pipeline & DTCG format: Read [ui-tokens/README.md](libs/ui-tokens/README.md)
- Token sync workflow: Read [figma-token-sync/README.md](tools/figma-token-sync/README.md)
- Architecture & design decisions: Read [README.md](README.md)
- Module boundaries & enforcement: Read [eslint.config.mjs](eslint.config.mjs)
- Commit message format: Read [commitlint.config.mjs](commitlint.config.mjs)
- Release process & versioning:  [nx.json](nx.json) (see release configuration)
- CI/CD pipelines: Read [.github/workflows/](.github/workflows/)

## Before Submitting Code
Items marked **[auto]** are enforced by pre-commit hooks or CI. Items marked **[manual]** require self-review.

- [ ] **[auto]** ESLint passes (`pnpm lint`)
- [ ] **[auto]** TypeScript compiles (`pnpm typecheck`)
- [ ] **[auto]** All tests pass (`pnpm test`)
- [ ] **[auto]** Nx module boundaries respected (ESLint + Nx checks)
- [ ] **[auto]** Commit message follows format detailed in `commitlint.config.mjs`
- [ ] **[manual]** New components have colocated tests
- [ ] **[manual]** PR includes screenshots for UI changes

If creating a new component, refer to ui-components/CLAUDE.md for further detailed submission checklists.
