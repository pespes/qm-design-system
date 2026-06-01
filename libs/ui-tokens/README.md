### ui-tokens

This package contains the sharable DTCG tokens to be used across Quartermaster applications. Through a token transformation pipeline with Style Dictionary, it provides theming and css properties for both web and react native.

- `tokens/`: The source DTCG JSON files (primitives, semantics, modes).
- `src/dictionary/`: Custom Style Dictionary logic (transforms, formats, actions).
- `src/dictionary-config.ts`: The creation of the StyleDictionary instances.
- `dist/`: The generated style artifacts.

Currently, all token values are hosted in the `tokens/` folder, based off of tokens defined in [Notion](https://www.notion.so/Design-token-spec-33a4dc390c85803a9bdaf6ccfda64330#33d4dc390c8580f88224defe10fbc6c1). In the future, tokens will be handled within Figma and imported into the `ui-tokens`. For now, any new tokens should be added directly into either the `/tokens/primitives` or `/tokens/semantic` folders, and theme-specific tokens should be added into the `tokens/modes` folder. Adding tokens into these folders will ensure the dictionary pipeline registers the new additions.

## Style Dictionary Pipeline

1. Initialization: Defining a new `StyleDictionary` instance that defines which token values are to be 'source' tokens (emitted in final output), or 'include' (for reference only), registers any hooks, and sets up the various platforms to export the token values to.
2. Parser: Iterates through relevant token files based on a provided filepath and modifies either the token file or tokens themselves. In this instance, it is used to create a sibling `letterSpacing` token to the semantic typography tokens to surface its value.
3. Transforms: Token values are modified by an array of transforms, defined by the `TransformGroup` and run sequentially. Transforms modify the token to be understood by a specific platform, and are therefore isolated per platform. Here we run built-in transforms, and several custom transforms to handle some custom configuration.
4. Formats: With the tokens transformed, the formats are responsible for rendering the template for the output file, whether it be CSS variables, a Tailwind @theme block, etc. 
5. Actions: After the output files have been generated, actions run to handle any custom side effects. In this case, an action is used to check for any invalid token values that could break the CSS, and will throw an error to break the build. 


## ui-tokens Output

The pipeline produces three artifacts split across web (`ui-components` + `web-app` using Tailwind v4) and native (`expo-apps` using TWRNC + Tailwind v3). The web needs two outputs because Tailwind v4 only handles the build-time stylesheet; the runtime `cn()` tailwind helper needs a separate registry to know about the custom tokens.

- **`tokens.css`** — The actual stylesheet consumed by Tailwind v4 in `ui-components`. Defines tokens as CSS variables inside `@theme` blocks, and typography tokens as `@utility type-*` blocks so they can be applied as single classes.
- **`tokenKeys.ts`** — A typed map of theme keys and utility names consumed by `ui-components`' `cn()` helper. It tells `tailwind-merge` which custom token names belong to which conflict group (eg. `color`, `radius`), so overriding `bg-brand-background` with `bg-surface-default` dedupes correctly at runtime. Shares same transformations / transformationGroups and formatting logic with `tokens.css` to stay in sync.
- **`tokens.native.ts`** — A JS object to be merged into the `tailwind.config` of `expo-apps` using `tailwind-react-native-classnames` for React Native + Tailwind v3. Maps token paths to TWRNC's expected theme prop names (`colors`, `fontSize`, `borderRadius`, `boxShadow`, etc.).
