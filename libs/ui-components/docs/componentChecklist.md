# COMPONENT CHECKLIST

Use this checklist to verify a component is complete and ready for publication. All items are required.

## Design & Props

- [ ] All Figma properties implemented as props
- [ ] Prop naming is consistent — Variant names (size, variant, etc.) follow existing patterns in similar components (e.g., Button, Select)
- [ ] Default variants specified — Every style variant has an explicit default value
- [ ] No arbitrary Tailwind utilities — Token-controlled categories (color, spacing, radius, shadow, border, typography) use tokens from `tokens.css` or `tokens.pro.css` only

## Styling & Tokens

- [ ] All tokens match finalized output — Every color, spacing, radius, shadow, and border value corresponds to a token in `libs/ui-tokens/dist/css/tokens.css` (verify via `grep`)
- [ ] Uses `cva` for variants — Style variants defined with cva for maintainability
- [ ] Uses `cn()` for class merging
- [ ] Theme variables resolve correctly with no conditional logic

## Type Safety & Structure

- [ ] Separate `*.types.ts` file — All type definitions isolated in a dedicated file
- [ ] No `any` types — Type safety enforced throughout (use generics where appropriate)
- [ ] Components extend base types defined by Shadcn import (either base-ui/react or React.ComponentProps)
- [ ] Includes `ClassMap` type — Every component exports a `classes` prop with mapped element names for consumer overrides

## Component Implementation

- [ ] If an element can receive focus, a ref is forwarded to the nested element that receives focus
- [ ] `testId` prop included on every interactive element requiring a `data-testid` with sensible default
- [ ] `className` applied to visible parent — Top-level className prop applies to the main visible element (exception: *Field components apply to nested form element)
- [ ] `classes` prop enables overrides by passing values within the classmap to nested elements
- [ ] Component file under 250 lines. If larger, split into multiple components

## Accessibility

- [ ] Passes `@storybook/addon-a11y` checks, running `pnpm test` to verify
- [ ] Correct WAI-ARIA attributes and roles for semantic components
- [ ] Keyboard navigation matches expected behaviour, and validated in tests

## Testing

- [ ] Unit tests in separate `*.test.ts` file (not in stories)
- [ ] Tests cover all Figma-defined props
- [ ] Tests cover user interaction — Both mouse and keyboard interactions tested
- [ ] Tests cover state — disabled, loading, invalid, error states tested where necessary
- [ ] All tests passing — Run `pnpm test` to verify

## Storybook Documentation

- [ ] `ComponentName.stories.tsx` story file exists with examples demonstrating different component props
- [ ] Story meta has correct title — Starts with `'Components/'` for proper nesting
- [ ] Story args include defaults — `args` object has default props, mocked handlers, and classes prop
- [ ] Story argTypes documented — All props in `argTypes` with descriptions
- [ ] Story render uses function declaration, not arrow function
- [ ] Interactive components have mocked interactions to demonstrate behaviour
- [ ] If story is tested, test blocks are imported from `*.test.ts` and attached via `play` property
- [ ] `ComponentName.mdx` exists — Documentation page with:
  - Meta referencing `*.stories.tsx`
  - Title and Description
  - Import statement (using MarkdownBlock)
  - Primary example
  - Props table (auto-generated)
  - Usage guidelines
  - Accessibility notes
  - All additional example stories
  - Links to Shadcn/BaseUI references

## Code Quality

- [ ] ESLint passes — `pnpm lint` succeeds (enforced by pre-commit hook)
- [ ] TypeScript compiles — `pnpm typecheck` succeeds (enforced by pre-commit hook)
- [ ] No commented-out code — Dead code removed, not left commented

## Publishing & Export

- [ ] Component exported from `index.ts` — at minimum, Component, Props type, and ClassMap type all exported
- [ ] ui-components package `index.ts` includes export from component's `index.ts`
- [ ] No internal building-block component exports in package's public index

## Final Review

- [ ] Follows existing patterns — Implementation matches similar components (Button, Select, etc.)
- [ ] No breaking changes to existing components — Refactors or additions don't change public APIs
