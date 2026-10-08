import { create } from 'storybook/theming';

// Shared Storybook UI theme, used by both the manager (sidebar/toolbar) and docs pages.
// Colour values mirror the Homeowner ui-tokens (--color-brand-background), as the default brand.
export const qmTheme = create({
  base: 'light',
  brandTitle: 'Quartermaster Design System',
  brandUrl: 'https://github.com/pespes/qm-design-system',
  brandTarget: '_self',

  colorPrimary: '#00780E',
  colorSecondary: '#00780E',

  fontBase: '"DM Sans", sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',

  appBorderRadius: 8,
  inputBorderRadius: 6,
});
