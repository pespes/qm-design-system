import { create } from 'storybook/theming';

// Shared Storybook UI theme, used by both the manager (sidebar/toolbar) and docs pages.
// Colour values mirror brand-neutral ui-tokens (`accent` for highlights and actions, `base` for surfaces and text),
// so the UI stays the same whichever brand is selected.
// The manager can't read CSS variables, so values are copied from libs/ui-tokens/dist/css/tokens.css.
export const qmTheme = create({
  base: 'light',
  brandTitle: 'Level design system',
  brandUrl: 'https://github.com/pespes/qm-design-system',
  brandTarget: '_self',

  colorPrimary: '#7A37B7', // --color-accent-background
  colorSecondary: '#7A37B7', // --color-accent-background
  barSelectedColor: '#7A37B7', // --color-accent-background
  barHoverColor: '#622A96', // --color-accent-text
  textColor: '#252523', // --color-base-text
  appBg: '#F6F6F6', // --color-base-background-subtlest
  appBorderColor: '#DDDDDB', // --color-base-border-subtle

  fontBase: '"DM Sans", sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',

  appBorderRadius: 8,
  inputBorderRadius: 6,
});
