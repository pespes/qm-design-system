# Figma Token Sync

Automates syncing variables, styles and effects from Figma into the qm-design-system. This tool consists of two parts: a Figma plugin for extraction and a CLI for integration.

## Figma Plugin

The plugin exports variable collections, variables, text styles, and effects (drop shadows in this case) from Figma into a JSON file.

#### Architecture:
- `code.ts` — Main plugin entry point; uses the Figma API to fetch variables, text styles, and effects
- `ui.html` — UI iframe in Figma desktop; provides the extraction UI

The two parts communicate via `postMessage`/`onMessage` in `ui.html`, and Figma's `ui.onmessage` and `ui.postmessage` in code.ts: the UI triggers extraction requests, code.ts fetches the data, and posts it back to the UI for download.

#### Extracted Data Formats:

Variables:
```typescript
{
  id: string
  name: string
  description?: string
  value: string | number | { type: "VARIABLE_ALIAS"; id?: string; aliasName: string }
}
```

Text Styles:
```typescript
{
  id: string
  name: string
  fontFamily: string | alias
  fontWeight: number
  fontSize: string | number | alias
  lineHeight: number
  letterSpacing: number
}
```

Shadows:
```typescript
{
  id: string
  name: string
  description: string
  effects: ShadowVariable[]
}
```

#### Implementation Notes
- The Figma Plugin API does not include fontWeight in the Text Style output, and therefore is extracted from the `fontStyle` property with the following naming convention: `fontStyle/<weight>` (e.g., `fontStyle/700`). `fontStyle` primitives not following this convention will error.
- Among the collections imported is the "Theme" collection with additional modes. The exported JSON file collects these mode values under a proeprty name suffixed with `$` + lowercased mode name + "Value" (e.g., `$proValue` for "Pro" theme) for Style Dictionary consumption.
- Values are cleaned but not transformed; transformations happen during the build step.

See [Figma Variables API](https://developers.figma.com/docs/plugins/api/figma-variables/) and [Figma Plugin API](https://developers.figma.com/docs/plugins/api/figma/).

## CLI Sync Workflow

The CLI pulls the exported JSON from Figma and syncs it to the repository.

#### Usage:

```bash
# Basic sync (pulls from ~/Downloads/figma-tokens.json by default)
pnpm sync:tokens

# Specify a custom export file location
pnpm sync:tokens --file=/path/to/figma-tokens.json

# Dry-run: update tokens without committing
pnpm sync:tokens --dry-run
```

Running any of the above commands will trigger `cli.ts`, which runs a script that executes the following steps:

1. Confirm working tree is clean
2. Parse the Figma export file
3. Checkout the `token-figma-sync` branch (a permanent branch living in the GH repo)
4. Write the export file to `libs/ui-tokens/tokens/`
5. Run `pnpm build:tokens` to validate the build
6. Commit and push to `token-figma-sync` branch
7. Return to the original branch (if beginning from a different branch)

Creating / merging the PR off the pushed commits is all manual in GitHub at the moment.

#### Requirements:
In order for the CLI to work correctly, the following must be true:
- Working tree must be clean before running
- Figma export file must be valid JSON
- Build must pass (tokens are validated during `pnpm build:tokens`)