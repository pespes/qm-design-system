# Update UI Component

> **Status: stub.** This outlines the workflow for changing an existing component. Steps marked **TODO** still need detailed guidance — when you reach one, follow the outline, ask the user where unclear, and do not invent conventions.

## Required Inputs

Provide:
1. **Component name** (e.g., "Checkbox") — must already exist in `libs/ui-components/src/components/`.
2. **What's changing** — e.g. updated Figma design, new prop/variant, bug fix, accessibility fix.
3. **Figma spec** (frame or page link) if the change is design-driven.
4. **Optional additional comments.**

## Workflow

### Step 1: Before Updating
Refer to the ui-components [CLAUDE.md](../../libs/ui-components/CLAUDE.md), including **Breaking Changes**. Work on a branch named `<componentName>`.
- **TODO:** confirm branch naming for updates (e.g. `<componentName>-update`).

### Step 2: Locate the Existing Component
Map everything the change could touch:
- Component, types, and `index.ts` files (primitive and/or composed)
- Primitives it imports, and other components that import it
- Exports in `src/index.ts`
- `stories/ComponentName.stories.tsx`, `stories/ComponentName.mdx`, and `ComponentName.test.ts`

If the component doesn't exist, stop and suggest `/create-component` instead.

### Step 3: Read the Figma Spec (design-driven changes)
Use the `figma-inspect` skill, which follows [figmaReading.md](../../libs/ui-components/docs/figmaReading.md), including the read-only [figmaInspect.js](../../libs/ui-components/docs/figmaInspect.js) script. In addition to the Figma Spec Summary, list the **differences from the current implementation** (props, variants, states, tokens, anatomy).

**STOP:** present the summary and the differences, and wait for the user to approve before changing code.

### Step 4: Classify the Change
Using **Breaking Changes** in `libs/ui-components/CLAUDE.md`, state whether each change is breaking or non-breaking. If anything is breaking, confirm with the user before proceeding and note it for the commit message (`!` or `BREAKING CHANGE:` footer).
- **TODO:** guidance on deprecating props instead of removing them.

### Step 5: Implement the Change
Follow [componentGuide.md](../../libs/ui-components/docs/componentGuide.md). Keep changes scoped to what was requested; flag unrelated issues instead of fixing them.
- **TODO:** guidance for changes to a primitive that other composed components depend on.

### Step 6: Update Stories, Docs & Tests
Update the existing stories, `.mdx`, and tests to cover the change (new props/states get stories and tests; removed ones are deleted). Tests that visibly change a story go on a hidden `<Name>Test` story (see `componentGuide.md` "Example Stories").

### Step 7: Visual Check in Storybook
Use the `storybook-visual-check` skill, which follows [storybookVisualCheck.md](../../libs/ui-components/docs/storybookVisualCheck.md), for the updated component **and** any components that import it.

### Step 8: Verify
Run the relevant items in `componentChecklist.md`, then:

```bash
pnpm build:components
pnpm nx lint ui-components
pnpm nx typecheck ui-components
pnpm nx test ui-components
```

### Step 9: PR Readiness
Follow the Pre-PR rules in `libs/ui-components/CLAUDE.md`. Include before/after Storybook screenshots, and mark breaking changes in the commit message.
- **TODO:** confirm whether before/after screenshots are required.
