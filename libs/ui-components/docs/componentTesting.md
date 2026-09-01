# COMPONENT TESTING

Component testing is done via Storybook's 'storybook/test', and context to tests provided by '@storybook/react'. Storybook & addons are defined at root of repository, not within the ui-components package.json file.
A11y testing is configured in the [preview.ts file](../.storybook/preview.ts), set to error on several new testing requirements in addition to the default WAI-ARIA 2.1 requirements provided by storybook's `addon-a11y` plugin.

## What to Test For
- All props explicitly included in Figma documentation
- Any user events fire as expected (ie. onClick, onOpenChange, etc)
    - test all user interactions paths - via mouse or keyboard
- All states of component are tested
    - disabled state does not trigger any user events (this may require the use of fireEvent, as userEvent.click is blocked by pointer-events:none)
    - disabled state has either disabled or data-disabled attribute (determined by Shadcn / Baseui api)
    - if disabled parent has list of child items (ie. [RadioGroupItem](../src/components/composed/radioGroup/RadioGroup.tsx), test children are also disabled)
    - invalid state adds aria-invalid or data-invalid attribute (if applicable and determined by Shadcn / Baseui api)
    - loading state (if applicable) renders expected message or content, disables component if specified in Figma documentation
- If a ref is forwarded, confirm it is passed to the proper element
    - ref tests should be paired with a non-"primary" story (a story determined by Storybook not to be the default, which renders its props in the control panel)
    - refer to [InputField Tests](../src/components/composed/inputField/InputField.test.ts) for a strategy to testing passed refs
- expected roles exist via screen.getByRole('')
- Form element focusing: both clicking the element itself and clicking the associated label should trigger focus
- Verify proper aria-relationships with assertions such as `toHaveAccessibleName`/ `toHaveAccessibleDescription`

## Rules
- Test files should be split into test blocks targeting a single example within the StoryContext, and steps within each test block scoped to a single purpose.
- Tests should run in isolation, and not be dependent on the flow of the previous test. beforeEach / afterEach do not fire between storybook `steps` in a given testing block, so may need to manually reset the componenet's state via user interaction.
- Testing blocks should define variables needed across multiple tests outside of step blocks to prevent cluttering step blocks.
- Prefer using `await waitFor()` after a user event and waiting for a component to render / unmount
- When possible in assertions, use props over hardcoded values. ie.`toHaveAccessibleDescription(expect.stringContaining(errorText))` vs `toHaveAccessibleDescription("error: a description")`
- When testing components that require portals, require using screen over canvas (ie. [Dialog tests](../src/components/composed/dialog/Dialog.test.ts))