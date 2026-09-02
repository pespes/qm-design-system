# COMPONENT CREATION GUIDE

### Quick References
- [figmaVariables.md](./figmaVariables.md)
- [componentChecklist.md](./componentChecklist.md)
- ui-tokens [output files](../../ui-tokens/dist/css/)

### Rules
1. **Ask, don't assume.** If anything is ambiguous - prop names, default variants, mutual exclusivity, styling variants - ask for clarification before proceeding.
2. **Check before scaffolding.** Before importing a Shadcn component, confirm it does not already exist under `primitives/`. If it doesn't exist, run `pnpm dlx shadcn@latest add <component>`.
3. **Tokens are mandatory.** Use design tokens from `ui-tokens/dist/css/tokens.css` for color, spacing, radius, shadow, border-width, and typography. See [figmaVariables.md](./figmaVariables.md) for better understanding. If no matching token exists, surface the discrepancy — do not fall back to arbitrary Tailwind values.
4. **Follow established patterns.** Refer to existing components in the codebase ([Button.tsx](../src/components/primitives/button/Button.tsx) for primitives, [Select.tsx](../src/components/composed/select/Select.tsx) for composed) when in doubt about structure, naming, or implementation.

## Component File Structure

### Internal only components (building blocks)
Single File, not exported from the library:
```text
── button/
  └── Button.tsx
```

### Published Components
Every published component is designed to be self-contained with its own logic, types and tests, and a barrel export via component's root `index.ts` entry point. 

```text
── componentName/
  ├── ComponentName.tsx
  ├── ComponentName.types.ts
  ├── stories/
  |    ├── ComponentName.stories.tsx
  |    └── ComponentName.mdx  
  ├── ComponentName.test.ts
  └── index.ts
```
Naming: Folder names are camelCase, component/type/story/test files are PascalCase

- `<component>.tsx` - The ui component itself, either imported directly from Shadcn or imported from primitive components built by Shadcn. Keep file under 250 lines, otherwise split if larger.
- `<component>.types.ts` - The type file containing all typings for component
- `<component>.test.ts` - Test file using Storybook testing suites
- `<component>.stories.tsx` - Documentation for the component, including props, usage guidelines and examples of various prop usage
- `index.ts` - Barrel export. Every published component must export the component, its Props type, and ClassMap type.

Determining if Publishable: Components built via direct interaction are publishable. Building-block sub components are internal unless explicitly stated otherwise. If a building block already exists in the library, its current status is preserved.

## Primitive vs Composed Components
All components are located under `ui-components/src/components`, in one of two directories:
- `primitives/` - Directly scaffolded from Shadcn, may be publishable or internal
- `composed/` - Combine multiple primitive or composed components (from any number of files) into a single output. These are NOT Shadcn-generated files.


## Component Construction

### Conventions
- Split children into named subcomponents in the same file when they represent repeated items with their own props (ie. [SelectGroupItem](../src/components/composed/select/Select.tsx) or [RadioGroupItem](../src/components/composed/radioGroup/RadioGroup.tsx))
- Extract complex JSX logic into named render functions to keep the return statement clean.
- Every interactive element requires a `data-testid` prop. Published components accept this as a prop with a fallback default to satisfy lint checks.
- Use descriptive variable and function names that explain intent. Comments should explain WHY, not WHAT.

### Props
- Props must be explicit and match all properties from the Figma design.
- Use consistent naming across components (ie. size: 'sm' | 'md' | 'lg'). If Figma uses a different name than existing components, surface the discrepancy.
- Style-related variants (ie. Button / Badge) must have a default value - if not specified in Figma, ask.
- Use discriminated unions for mutually exclusive props. If exclusivity is unclear from Figma, ask.
- A ref is forwarded from the exposed component to the nested element that should receive focus. See [Button.tsx](../src/components/primitives/button/Button.tsx) for the pattern: ref flows through custom components down to the base HTML element.

### Types
- Base types extend the Shadcn / base-ui primitive type (ie. Button.Props from @base-ui/react/button for for base-ui components when provided by Shadcn, React.ComponentProps for Shadcn-created components not using base-ui).
- Every component includes a `classes` prop using `ClassMap` (imported from `@/types.ts`). ClassMap maps visible element names to optional className strings for consumer overrides.
- This ClassMap type is always included in the component's `index.ts` exports.
- Prefer extending primitive interfaces in composed components. Only create new interfaces when omissions from the primitive interface changes the semantic meaning of it.
- Enforce type safety: no `any` types. Use generics where appropriate. Use const arrays for variant values (e.g. `const sizes = ['sm', 'md', 'lg'] as const`). 
- Prefer creating types or interfaces over using the `unknown` type.

### Shadcn Patterns
**Important**: Shadcn in this project uses @base-ui/react, NOT @radix-ui/*. All base-ui imports come from @base-ui/react/{component}.
- Use cva (class-variance-authority) for variant definitions. See [Button.tsx](../src/components/primitives/button/Button.tsx) for reference.
- Use cn() from `@utils/utils.ts` for all class merging.

## Styling

- Token-controlled categories (must use tokens): color, spacing, radius, shadow, border-width, typography. Any discrepancies in design not using these tokens, or token does not exist, ask before applying a Tailwind utility. See [figmaVariables](./figmaVariables.md).
- Examples of standard Tailwind categories to use Tailwind utilities(no tokens):
Layout (flex, grid, inline-flex), alignment (justify-*, items-*), display, overflow, cursor, pointer-events, transitions.
- Prefer less complex selectors for easier consumer overrides. Confirm styles still apply correctly.
- When arbitrary utility values are necessary (no token matches value, and received confirmation that using an arbitrary value is acceptable), always prefer explict absolute value over calculated value (ie. spacing-[30px] over spacing-[calc(var(--spacing-200) / 2)])

### Class application
- `className` prop applied to the visible parent element. Exception for *Field components which apply className to the nested form element, not the FieldWrapper (see [SelectField](../src/components/composed/selectField/SelectField.tsx)).
- `classes` prop applies ClassMap object for targeting specific internal elements. Every element in the map merges passed classnames via cn().

### Focus ring pattern
Interactive components with focus borders use this combination:
```
focus-visible:ring-2 focus-visible:outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-border-subtle
```
Figma documentation specifies which element displays the focus ring. If unclear, or if the styling in Figma differs from this combination, ask.

### Theming
Not a concern during component building. Components automatically adapt between themes withotu conditional logic. When `[data-theme="pro"]` is applied to the root element, all pro-theme overrides in `tokens.pro.css` are applied. Using `bg-brand-background` renders correctly in both themes.

## Accessibility
All components must pass a11y checks via Storybook's @storybook/addon-a11y (runs during `pnpm test`).

Verify WAI-ARIA 1.2 patterns: correct aria-* attributes, especially on composed components that combine multiple primitives.
Keyboard navigation must follow expected patterns for the component type.
Focus must land on the appropriate element in interactive components.


## Stories
Each published component has a `stories/` folder with two files:

### ComponentName.mdx
Layout structure for the Storybook docs page, in the following order:

Meta — references the *.stories.tsx file
Title, Description (from @storybook/addon-docs)
MarkdownBlock — documenting import statement of component
Primary, Props (from @storybook/addon-docs)
Usage guidelines
Accessibility notes (any dev requirements beyond what is built into the component)
All example stories
Additional documentation links (Shadcn & BaseUI component references where applicable)


### ComponentName.stories.tsx
This file includes all the examples documented in Storybook and dictates the props rendered in the page's control panel.
Within the Storybook meta object:
  - `title` starts with 'Components/' for proper nesting.
  - `args` includes the default state the Primary example should have, includes mocks of any event handlers (ie. onClick, onOpenChange), and includes the classes prop in order for the control panel to properly render the classes object for clarity.
  - `argTypes` includes any other Figma-document props, state props (disabled), and event handlers not already included or in need of additional clarity. Provide an explicit 1-sentence description if auto-populated descriptions are insufficient, and add controls for visually meaningful props (ie. checked: { control: { type: 'boolean' }})
  - `paramters.docs.description.component` details a brief component description for the MDX <Description/> block.
  - include an `afterEach` which logs to confirm testing of component is complete

**Example Stories**
- Interactive stories use `render` with a function declaration (not an arrow function - this breaks rendered code block in the Storybook code panel). This function is passed `args` in order to have args/argTypes from the meta object (and any custom assigned args within the story) to apply to the rendered component.
- Use useState/useEffect as needed to create interactions for users. Any component that is interactive in nature must be interactive in documentation.
- Attach test functions from *.test.ts to stories via the `play` proeprty.
- Story example naming should reflect its purpose, after the `default` example (ie. Disabled, Invalid, WithMaxLength ... )
- The stories should demonstrate the use of all Figma defined props, and any expected state (ie. disabled, invalid, loading). Each story should address a single prop / state for separation of concerns.
- If demonstrating different styling of a given prop, rendering multiple components in a single story is acceptable. Otherwise one story contains one component.

## Anti-Patterns, do NOT
- use arbitrary Tailwind values for token categories (color/spacing/radius/shadow/border/font), always use tokens
- create new CSS variables without explicit permission - use existing tokens from `ui-tokens`
- use inline styles - Tailwind utilities only 
- import from `@radix-ui/*` - this project uses `@base-ui/react`
- use arrow functions in a story render attribute - it breaks Storybook code planel display
- use nested ternaries or chained conditionals in JSX - prefer composition
- put tests inside story files - tests are in separate `*.test.ts` files
- assume default variants - always ask if not specified in Figma
- guess intent in Figma documentation - always ask for clarificaiton

