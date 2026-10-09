# STORYBOOK VISUAL CHECK

How to verify a component renders correctly in Storybook and matches its approved Figma spec. Used by the `create-component` workflow (Step 10) and whenever a component's styling or stories change.

Lint, typecheck, and tests can all pass while the component is visibly wrong. For example, a style referencing an undefined CSS variable silently renders transparent, and a `play` function on a visible story makes a dialog flash open every time the story is opened. This check catches those.

## Browser Tool

- **Preferred: Playwright MCP** (headless). It can only write files inside the repo; if a tool call requires a filename, use `.playwright-mcp/` (git-ignored).
- **Fallback: Claude in Chrome.** Call `tabs_context_mcp` first and work in a new tab. If the extension isn't connected, tell the user.
- **If neither is available**, stop and give the user the checklist below to run manually.

**Screenshots:** save the final Storybook screenshot of each story to `.playwright-mcp/<componentName>/<storyName>.png` (git-ignored) so they can be attached to the PR. Figma screenshots are fetched fresh for each comparison and not saved.

Crop to the component rather than capturing the full-width canvas: shrink the story root to its content with a little padding, then screenshot that element.

```js
// Playwright (browser_run_code_unsafe)
await page.evaluate(() =>
  Object.assign(document.querySelector('#storybook-root').style, { width: 'fit-content', padding: '16px' }),
);
await page.locator('#storybook-root').screenshot({ path: '.playwright-mcp/<componentName>/<storyName>.png' });
```

## 1. Open Storybook

1. Get a Storybook server with the `storybook-visual-check` skill's helper. It reuses a server already running on `:6006`; otherwise it starts a private one on `:6007` (nx blocks a second `pnpm storybook`) and prints the base URL to use below:
   ```bash
   node .claude/skills/storybook-visual-check/scripts/storybook.mjs start        # add --own if the :6006 server may be stale
   ```
   Run `storybook.mjs stop` when done. It only stops the private server, never one it didn't start.
2. List the visible stories and the docs page: `storybook.mjs stories <ComponentName>`. It reads `<base>/index.json` and skips hidden `<Name>Test` stories, which exist for Vitest only.
3. Load each story on its own, using the URLs the helper prints: `<base>/iframe.html?id=<storyId>&viewMode=story`. The docs page is `?id=<docsId>&viewMode=docs`.

## 2. Compare Against Figma

For each visible story:
1. Screenshot the story.
2. Fetch a **fresh** screenshot of the matching Figma variant (see [figmaReading.md](./figmaReading.md)) — don't reuse an earlier one, so the comparison reflects the current design.
3. Compare layout and alignment, size and spacing, corner radius, border, colour, typography, and icon size/position. Storybook and Figma render at different scales, so compare proportions rather than pixels.

## 3. Check Computed Tokens

Screenshots miss values that are subtly wrong or silently dropped. For each token-bound property in the approved Figma Spec Summary, compare the element's computed style with the token's value on the same page:

```js
// Run in the story page (e.g. Playwright browser_evaluate)
const el = document.querySelector('[data-slot="checkbox"]');
const token = getComputedStyle(el).getPropertyValue('--color-border-default').trim();
const actual = getComputedStyle(el).borderColor;
({ token, actual }); // these should describe the same colour
```

A transparent or default value where a token was expected usually means the CSS references a variable that doesn't exist (e.g. `var(--opacity-300)`), or the wrong utility class is applied.

## 4. Check States

Use the dedicated stories for static states (disabled, invalid). For interactive states:
- **Focus:** press `Tab` to reach the element — clicking doesn't trigger `:focus-visible`.
- **Hover:** move the mouse over the element.
- **Checked / selected:** click the control.
- **Open (dialog, menu, select):** click the trigger and check the open state, including any backdrop or scrim.

Reload the story before checking the next state so each starts from its default.

## 5. Check Brands

For stories that use `brand-*` tokens, repeat the comparison with the Pro brand by adding `&globals=brand:Pro` to the story URL. Only the brand colours should change.

## 6. Check Load Behaviour

Open each visible story fresh and watch it for a couple of seconds. Nothing should open, toggle, or have text typed into it on its own. If it does, the story has a `play` function that visibly changes it — move the test to a hidden `<Name>Test` story (see `componentGuide.md` "Example Stories").

Also open the docs page and confirm every example renders and nothing opens on load.

## 7. Check the Console

Read console errors and warnings on the story and docs pages. Ignore the missing `favicon.ico` 404. Report anything else, such as React warnings.

## 8. Report

Fix in-scope mismatches and re-check them, then re-take the saved Storybook screenshots so the PR shows the final state. Flag design issues and out-of-scope problems instead of fixing them. Report:

```text
| Story | Brand | Matches Figma | Tokens | Load | Console | Notes |
|-------|-------|---------------|--------|------|---------|-------|
| Default | Homeowner | ✅ | ✅ | ✅ | ✅ | |
| Invalid | Homeowner | ⚠️ border 1px, Figma 2px | ✅ | ✅ | ✅ | fixed |
```

## Manual Checklist (no browser tool)

If no browser tool is available, ask the user to open Storybook (`pnpm storybook`) and confirm for each story:
- [ ] Matches the Figma variant (layout, spacing, colour, type, radius)
- [ ] Focus, hover, and open states look correct
- [ ] Pro brand (toolbar → Select Brand) changes only brand colours
- [ ] Nothing opens or toggles when the story loads
- [ ] No errors in the browser console
