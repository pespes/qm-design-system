### ui-components

This library is a React-based design system built on BaseUI and Shadcn. It provides a collection of themeable components designed to work with the `ui-tokens` pipeline and to be used across Quartermaster applications.

## Styling & Tokens
The library relies on Tailwind v4 with a direct integration of DTCG tokens. Instead of the v3 `tailwind.config.js` file, tokens are injected into the system through `src/globals.css`, and are mapped to Tailwind utility classes. This ensures that if a token changes in the design pipeline, the component library updates these values automatically. 

## Architecture

The `/component` folder is divided into two directories to help manage complexity.

### Primitives

Found in `src/components/primitives`, these are low-level components generated from Shadcn. They handle base styling, accessibility and state logic. Not all primitive components are exported for public consumption, only those meant to also act as a standalone component in the library. Others are used as building blocks for more complex components.
New additions from Shadcn can be added via

```
pnpm -C libs/ui-components exec shadcn add <component>   # run from the repo root
```

### Composed

Found in `src/components/composed`, these pre-assemble multiple primitive or other composed components. For example, a composed Input component may combine primitive Label, Input and FieldDescription components. These components handle internal dependency management to allow users to import a single tag. Note that new Shadcn imported components should not live in this folder.

## Component Structure & Versioning

The library currently uses overall versioning, but individual components are designed to ease the transition to component-level versioning if the need arrives. Every component should be self-contained with its own logic, types and tests, and any component imports should use formal entry points (ie. `import { Button } from '.../button.index.js`). The component files are exported via its own `index.ts` file to be funnelled through the library's root `index.ts` entry point.
To maintain consistency, each component folder should have the following layout:

```text
── button/
  ├── Button.tsx
  ├── Button.types.ts
  ├── stories/
  |    └── Button.stories.tsx
  ├── Button.test.ts
  └── index.ts
```

Each component is rendered as a standard function call isntead of an arrow function. This is to remain insync with Shadcn, which renders each of its components in this manner. Any additional functions called
within components are expected to be arrow functions for consistency.

## Usage

Import the `ui-components` package with:
```
pnpm add @pespes/ui-components
```

All packages are built using typescript, and expose ES6-compatible javascript files, alongside typescript definition files (`*.d.ts`). 
```typescript jsx
import { Button, ButtonProps } from '@pespes/ui-components';

type MyComponentProps = ButtonProps & { label: string };

const MyComponent = ({ label, ...props }: MyComponentProps) => (
   <Button>{label}</Button>
);
```

The library supports multi-theme environments. By default, the system applies the 'Homeowner' brand theme. However, any children under a component wrapped in `data-theme="pro"` will automatically adopt pro-themed brand colors without requiring additional CSS classes.

```typescript jsx
<Button variant="brand">I am a green button</Button>

<div data-theme="pro">
    <Button variant="brand">I am a blue button</Button>
</div>
```

Base UI also provides a `render` prop on many components to override the rendered HTML tag on the component. For example, if we wanted to render a <div> instead of a <button>, this can be done by passing either an HTML element or function:
```typescript jsx
  <Button render={<div/>}>I still look like a button</Button>

  <Button 
    render={(...props, state) => (
      <div {...props}>
        {state.loading ? <LoadingSpinner/>}
        I still look like a button
      </div>
    )}
  />
```

### Styling Imports
When importing token and component styling into the app's main stylesheet, import in the following order:

```
@import ui-tokens/css/tokens
@import ui-tokens/css/tokens-pro
@import 'tailwindcss'
@import ui-components/styles.css
```

- **design tokens / tokens-pro** - CSS custom properties (ie. --color-brand-background) must be declared before any rule references them. Loading tokens first ensures they exist in the cascade before Tailwind or consuming components attempt to use them.
- **ui-components/styles.css** - This file is pre-compiled, so any Tailwind utitilies needed by the components are already included at library build time. Loading it after Tailwind ensures component-specific rules can override Tailwind base styles where necessary. This file uses **@reference** to point to token files, so does not re-emit these token values, preventing any duplication of the custom token properties.

## Development: Storybook
In order to provide context and usage guidelines for components, additional configuration is required for the base `meta` data consumed for the component's docs page. Description, usage, and accessibility content should be added, and can be written as either strings or html.

```typescript jsx
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'This is a description to provide context about the element.'
      },
    },
    customBlock: {
      usage: <span>This is how to use the component...</span>,
      accessibility: 'Make sure it is accessible',
    },
  },
} satisfies Meta<typeof Button>;
```
In order to run storybook to interact with components and test documentation, run the following command from the `qm-design-system` root directory:
```
pnpm storybook
```
