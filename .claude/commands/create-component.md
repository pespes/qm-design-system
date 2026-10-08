# Create UI Component

## Required Inputs

Provide:
1. **Component name** (e.g., "Tooltip")
2. **Link to Shadcn base component** (e.g., https://ui.shadcn.com/docs/components/tooltip). 
    - If not provided, this may be custom component. Ask for confirmation that there is no Shadcn component.
    - If provided, you will be importing a Shadcn component in future steps, NOT a BaseUI component or component from another library.
3. **Link to Base UI component** (eg. https://base-ui.com/react/components/tooltip). This may not exist - if link not provided, ask for confirmation that there is no Base UI component that Shadcn references.
4. **Figma spec** (frame link or page link)
5. **Optional additional comments**. A space to provide additional details if necessary.

## Workflow

### Step 1: Before Creating a Component
Refer to the the ui-components [CLAUDE.md](../../libs/ui-components/CLAUDE.md);

### Step 2: Check Existing Components

- Check if the component already exists in `libs/ui-components/src/components/primitives/` or `composed/`, and whether it is exported from `src/index.ts`.
- **If it exists, STOP and ask the user.** Report what you found (file paths, primitive or composed, published or internal-only), then ask which route to take:
    1. **Update the existing component** — switch to the `/update-component` workflow ([update-component.md](./update-component.md)).
    2. **Continue creating** — e.g. a new composed component built on an existing internal primitive. Skip scaffolding for anything that already exists (Steps 5–6) and do not overwrite existing files.
    3. **Cancel.**
- Do not proceed until the user chooses.

### Step 3: Read Base UI Docs

If a link is provided for the Base UI component being referenced by Shadcn, fetch the Base UI documentation. 
- If component not found with url, ask for confirmation that the Base UI component does not exist, or to provide the correct url. Do not make assumptions a similar Base UI component is the target. Confirmation comes solely from the user.
- If confirmation received that there is no relevant Base UI component, ignore subsequent comments in step 3.
- Identify: 
    - what `data-*` attributes are auto-added
    - what compound sub-components exist (Root, Indicator, Thumb, etc.) and their props
    - whether `render` prop is available
    - how disabled/checked/open/etc states are handled
    - any event handlers to include in tests
- **Do NOT manually add attributes that Base UI already provides**

### Step 4. Analyze Figma Spec

Prerequisite: If `libs/ui-tokens/dist/css/tokens.css` does not exist, run `pnpm build:tokens` to generate the token file you will need to compare Figma variables to.

Follow [figmaReading.md](../../libs/ui-components/docs/figmaReading.md) to connect to Figma (Desktop Bridge first, with fallbacks), locate the component set, extract the spec, and map tokens. Figma is read-only during this workflow.

From the Figma spec, extract:
- **Variants** — visual variants (e.g., base/brand/danger) and sizes (sm/md/lg)
- **States** — hover, focus, disabled, checked, open, invalid, loading, etc
- **Style values** — map to tokens in `libs/ui-tokens/dist/css/tokens.css`
- **Color values** — map to tokens in `libs/ui-tokens/dist/css/tokens.css` (never use raw hex/rgb)
- **Sub-elements** — each distinctly styled layer becomes a `ClassMap` key
- **Icon slots** — if icon is present, defer to the Figma document's Assets > Icons size

If a Figma style/color value doesn't have a matching token, follow the "Token Not Found" workflow in `figmaVariables.md`. Do not use arbitrary values without permission.

Before the stop, check proposed prop names and values against existing components (see `componentGuide.md` "Props" and `figmaReading.md` section 8) so naming is decided at the stop, not later.

**STOP:** Present the "Figma Spec Summary" from `figmaReading.md` (including which connection tier was used, anything that couldn't be read, and any naming differences) and wait for the user to confirm or correct it. Do not scaffold or write any code until the user approves the summary.

### Step 5: Scaffold the Shadcn Component

To generate the **new** primitive component (step 2 asserted that the primitive Shadcn component does not already exist), first preview what will be written. Use the shadcn version installed in `ui-components` (not `@latest`) so results are consistent:
```bash
pnpm -C libs/ui-components exec shadcn add <component-name> --dry-run
```

Check both sections of the dry-run output:

- **Files:** shadcn writes flat files to `src/components/primitives/<component-name>.tsx` (kebab-case). Because this repo keeps components in folders (e.g. `primitives/button/Button.tsx`), shadcn does not recognize existing components and lists their dependencies as `create`, not overwrite. Any listed file other than the target component is a dependency that will be duplicated.
- **Dependencies:** these are **npm packages that will be added** to `libs/ui-components/package.json`. Adding a dependency requires the user's approval. In particular, shadcn lists `cn` — this repo already provides `cn()` from `@/utils/utils.js`, so the `cn` package is not needed.

Note these before running the command without `--dry-run`:
```bash
pnpm -C libs/ui-components exec shadcn add <component-name>
```

**Never use the `--overwrite` (`-o`) flag.** If adding a component triggers the scaffolding of an existing component, we do not want to overwrite it.

After scaffolding, run `git diff libs/ui-components/package.json pnpm-lock.yaml`. Remove any dependency the user hasn't approved (including `cn`) from `package.json` and run `pnpm install` to update the lockfile. In the scaffolded file, replace `import { cn } from "cn"` with `import { cn } from '@/utils/utils.js'`.

This will generate a `<component-name>.tsx` file. Move that file under a `componentName` folder (camelCase) in `src/components/primitives/`, keeping the kebab-case filename for now (it is renamed in Step 8 only if it becomes a publishable primitive). Do not create any additional files.

If running the command generated additional component files beyond the expected `<component-name>.tsx` file, check if those components already exist under `src/components/primitives/*` or `src/components/composed/*`. If the component **does** exist, remove the additional component file generated by the shadcn command, and adjust any import statements in `<component-name>.tsx` to match the existing component.

### Step 6: Implement Base Styling on Shadcn component

Update all Tailwind stylings in the **new** scaffolded Shadcn components within the primitive component file to match Figma spec. 
- Extract Figma's layout strategy (flex direction, gaps, alignment) and translate to Tailwind classes
- Shadcn's component structure (JSX hierarchy) takes precedence over HTML tag names; adjust Tailwind utilities to match Figma's visual layout

Run `nx lint ui-components` and `nx typecheck ui-components` prior to proceeding to fix any linting errors.

### Step 7: Determine "Primitive" or "Composed"

Based on the Figma spec and scaffolded Shadcn component, determine whether the publishable component should be a single primitive or a composed component:
- **Primitive:** Single exported component from the Shadcn scaffolded file (e.g., Button, Badge)
- **Composed:** Combines multiple components into one export — either multiple imports from a single primitive file (e.g., Input), or multiple primitive files combined (e.g., Dialog)

Refer to [componentGuide.md "Primitive vs Composed"](../../libs/ui-components/docs/componentGuide.md) for clarification. If ambiguous, ask: "Does the Figma spec require combining multiple components, or is it a single component?"

If determined to be **composed**, create a new folder under `src/components/composed/componentName` (camelCase). This will also mean that any newly scaffolded Shadcn primitive files will not be publishable.

Estimate the size of the change now. If it is likely to exceed 300 changed lines, plan the PR split described in Step 12 (core PR first, then stories + tests) and build in that order.

### Step 8: Implement Component

Under the publishable component folder, create these files following `componentGuide.md` file structure:
1. `ComponentName.types.ts` - all typings, const arrays for variants, exported types, `ClassMap`, extend Base UI/HTML element props. 
    - For **publishable** primitives: rename the scaffolded `<component-name>.tsx` to `ComponentName.tsx` (PascalCase, e.g. `button.tsx` → `Button.tsx`), then extract its types into this separate types file.
    - For composed: create new types file in the composed folder. Typings should use the same types as the primitives - ie. if importing BaseUI types in the primitive, the composed should ALSO import / extend BaseUI types.
2. **`ComponentName.tsx`** — standard function declaration, `cva` for variants (if Shadcn scaffolds it), `cn()` for class merging, `data-slot` and `data-testid`, spread remaining props
3. **`index.ts`** — export component + types
4. **If the component defines a list-item subcomponent** (e.g., `SelectGroupItem`, `RadioGroupItem`): **ask the user whether that subcomponent should also be exported** from `index.ts` for consumer use. 
    - If yes: add it to the barrel export alongside its Props type in the next sub-step.
    - It does **not** need its own separate `.mdx` documentation page (Step 9) — it stays documented within the parent component's story/doc page. However, if the subcomponent is exported, the parent `.mdx` should document its props and expected data shape.
    - See `componentGuide.md` "Conventions" for when to define subcomponents in the first place.
5. **Update `src/index.ts`** — add barrel export

**Internal-only primitives** (not publishable) remain as single Shadcn-generated `<component-name>.tsx` files (kebab-case, e.g. `dropdown-menu.tsx`) in their primitives folder and do not require separate types.ts, stories, or tests.

### Step 9: Implement Stories & Tests

Story and docs files go in a `stories/` subfolder of the publishable component folder; the test file stays at the component root, next to `ComponentName.tsx` (see `componentGuide.md` "Published Components"):

```text
componentName/
  ├── ComponentName.test.ts
  └── stories/
       ├── ComponentName.stories.tsx
       └── ComponentName.mdx
```

1. **`stories/ComponentName.stories.tsx`** — populate basic meta with title/component/docs, `fn()` for action mocks, `argTypes` matching variants, and examples as per `componentGuide.md`. 
2. **`ComponentName.test.ts`** - populate with test functions using `StoryContext` pattern per `componentTesting.md` guidelines.
3. Attach tests via the `play` property. If a test visibly changes the story (opens a popup/dialog/menu, toggles a control, types text), put `play` on a hidden `<Name>Test` copy of the story tagged `['!dev', '!autodocs']` instead of the visible story, so browsing Storybook doesn't auto-run it. See `componentGuide.md` "Example Stories".
4. Create and populate the `stories/ComponentName.mdx` documentation page.

### Step 10: Visual Check in Storybook

Follow [storybookVisualCheck.md](../../libs/ui-components/docs/storybookVisualCheck.md): compare every visible story against a fresh Figma screenshot, check computed token values, interactive states, both brands, load behaviour (nothing auto-plays when a story is opened), and console errors. Fix in-scope mismatches, flag design issues, and report the results table. Storybook screenshots are saved to `.playwright-mcp/<componentName>/` for the PR.

### Step 11: Verify

Run through every item in `componentChecklist.md`. Verify all items across these categories: Design & Props, Styling & Tokens, Type Safety & Structure, Component Implementation, Accessibility, Testing, Storybook Documentation, Code Quality, Publishing & Export, Final Review.

Once complete run the following commands:

```bash
pnpm build:components
pnpm nx lint ui-components
pnpm nx typecheck ui-components
pnpm nx test ui-components
```

### Step 12: PR Readiness

Follow Pre-PR rules in `libs/ui-components/CLAUDE.md`:
- If over 300 changed lines, split into sequential PRs (core first, then stories+tests)
- Branch naming: `<componentName>`, with follow-up PRs suffixed `<componentName>-stories` (or `<componentName>-<type>-stories` if stories are split further)
- Include screenshots of Storybook stories in every PR (from Step 10's `.playwright-mcp/<componentName>/`)
