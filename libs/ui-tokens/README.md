### ui-tokens

This package contains the sharable DTCG tokens to be used across Quartermaster applications. Through a token transformation pipeline with Style Dictionary, it provides theming and css properties for both web and react native.

- `tokens/figma-tokens.json`: The raw Figma plugin export — the single source of truth for  all token values.
- `src/build-tree/`: Converts token files into DTCG token trees in memory, maintaining references to primitive values if defined and assigning which values will be exposed in outputted styles for which platform.
- `src/dictionary/`: Custom Style Dictionary logic (transforms, formats, actions).
- `src/dictionary-config.ts`: The creation of the StyleDictionary instances.
- `dist/`: The generated style artifacts.

Token values come from Figma, which are exported via the `figma-token-sync` plugin in `tools/`, to the raw `tokens/figma-tokens.json` file. New or udpated tokens in Figma will be synced into the repo by Design via the plugin's `pnpm sync:tokens` script. For more information, see `figma-token-sync`[README.md](../../tools/figma-token-sync/README.md).

For a token to render in the outputted files, its Figma group needs to retreive it's exposure in `src/build-tree/tokenGroupConfig.ts`. This file determines whether the token should ever emit (colour / text primitives are not currently included in the final output), and what platform(s) the tokens should be included in (css / native). An unmapped group will throw during `build:tokens` rather than being silently dropped to surface lost tken values immediately.

**Note ** All but shadows exist in both platforms currently. Figma only exports shadow variables that are web compatible, and do not contain necessary native shadow properties such as "elevation". 


## Style Dictionary Pipeline

1. Token tree: `buildDtcgTrees` parses the raw Figma export (`tokens/figma-tokens.json`) into a base DTCG token tree, tagging each token's exposure under `$extensions.exposure` (whether it emits, and for which platform). Theme modes are returned as separate override trees keyed by mode name. For a given `StyleDictionary` instance, the base tree is merged with a mode's override tree (via `mergeTokenTrees`) when building for that mode, or uses the base tree as-is for the default build; the exposure's `mode` field marks which tokens a mode build emits.
2. Initialization: Each `StyleDictionary` instance is created with its resolved token tree, hooks (transforms, formats, actions, transform groups), and per-platform output config.
3. Transforms: Token values are modified by an array of transforms, defined by the `TransformGroup` and run sequentially. Transforms modify the token to be understood by a specific platform, and are therefore isolated per platform. Here we run built-in transforms, and several custom transforms to handle some custom configuration.
4. Formats: With the tokens transformed, the formats are responsible for rendering the template for the output file, whether it be CSS variables, a Tailwind @theme block, etc.
5. Actions: After the output files have been generated, actions run to handle any custom side effects. In this case, an action is used to check for any invalid token values that could break the CSS, and will throw an error to break the build.

## ui-tokens Output

The pipeline produces three artifacts split across web (`ui-components` + `web-app` using Tailwind v4) and native (`expo-apps` using TWRNC + Tailwind v3). The web needs two outputs because Tailwind v4 only handles the build-time stylesheet; the runtime `cn()` tailwind helper needs a separate registry to know about the custom tokens.

- **`tokens.css`** — The actual stylesheet consumed by Tailwind v4 in `ui-components`. Defines tokens as CSS variables inside `@theme` blocks, and typography tokens as `@utility type-*` blocks so they can be applied as single classes.
- **`tokenKeys.ts`** — A typed map of theme keys and utility names consumed by `ui-components`' `cn()` helper. It tells `tailwind-merge` which custom token names belong to which conflict group (eg. `color`, `radius`), so overriding `bg-brand-background` with `bg-surface-default` dedupes correctly at runtime. Shares same transformations / transformationGroups and formatting logic with `tokens.css` to stay in sync.
- **`tokens.native.ts`** — A JS object to be merged into the `tailwind.config` of `expo-apps` using `tailwind-react-native-classnames` for React Native + Tailwind v3. Maps token paths to TWRNC's expected theme prop names (`colors`, `fontSize`, `borderRadius`, `boxShadow`, etc.).
