---
name: storybook-visual-check
description: Visually verify a Level ui-components component in Storybook — screenshots against fresh Figma, computed token values, interactive states, Pro brand, load behaviour, console errors. Use after changing a component's styling, stories or docs; for step 10 of create-component; or when asked to "check it in Storybook", "screenshot the stories", or "does it look right / match Figma?".
---

# Storybook visual check

Full guide: [storybookVisualCheck.md](../../../libs/ui-components/docs/storybookVisualCheck.md). It's the source of truth for each check; this skill gives the order to run them in and a helper for the server mechanics.

Lint, typecheck and tests can all pass while a component is visibly wrong, so this check is still required.

## 1. Get a server and the story list

```bash
node .claude/skills/storybook-visual-check/scripts/storybook.mjs start        # reuses :6006, else starts :6007
node .claude/skills/storybook-visual-check/scripts/storybook.mjs stories <ComponentName>
```

`start` prints the base URL to use. Use `start --own` instead when the user's server on :6006 may be stale, for example after a branch switch or when changes aren't showing up. `stories` prints a URL for each **visible** story and for the docs page; hidden `<Name>Test` stories are skipped.

## 2. Browser

- Use **Playwright MCP** first; it writes files relative to the repo root.
- If Playwright isn't available, use **Claude in Chrome**: call `tabs_context_mcp`, then work in a new tab.
- If neither is available, give the user the manual checklist at the end of the guide.

## 3. Per visible story

Open each story URL on its own, then:

1. **Load:** watch it for about 2 seconds. Nothing should open, toggle, or type on its own.
2. **Screenshot**, cropped to the component:
   ```js
   // browser_run_code_unsafe
   await page.evaluate(() => Object.assign(document.querySelector('#storybook-root').style, { width: 'fit-content', padding: '16px' }));
   await page.locator('#storybook-root').screenshot({ path: '.playwright-mcp/<componentName>/<storyName>.png', scale: 'device' });
   ```
3. **Compare** with a fresh Figma screenshot of the matching variant (the `figma-inspect` skill). Compare proportions, not pixels.
4. **Tokens:** compare computed styles with token values (§3 of the guide). A transparent or default value usually means an undefined CSS variable.
5. **States:** reach focus with `Tab` (a click doesn't trigger `:focus-visible`), then check hover and click/open. Reload the story between states.
6. **Pro brand:** if the story uses `brand-*` tokens, repeat with `&globals=brand:Pro`. Only the brand colours should change.
7. **Console:** check for errors and warnings. Ignore the `favicon.ico` 404.

Then open the docs page URL: every example should render, and nothing should open on load.

## 4. Finish

- Fix in-scope mismatches, re-check them, and re-take the saved screenshots.
- Flag design issues instead of fixing them.
- Report the results table from §8 of the guide.
- Screenshots go in `.playwright-mcp/<componentName>/`, which git ignores, for attaching to the PR.
- If `start` reported "started by this script", always run `node .claude/skills/storybook-visual-check/scripts/storybook.mjs stop`. Never stop the user's server.
