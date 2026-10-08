import type { Preview } from '@storybook/react-vite';
import '../src/globals.css';
import { themeDecorator } from '@sb/configs/decorators';
import { qmTheme } from '@sb/configs/theme';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
      config: {
        checks: [
          {
            id: 'has-test-id',
            evaluate: (node: HTMLElement) => node.hasAttribute('data-testid'),
          },
        ],
        rules: [
          {
            id: 'target-size', // WCAG2.2 not currently enabled by default, added the new rule from 2.2
            enabled: true,
          },
          {
            id: 'require-test-id',
            selector: 'button, a, input, select, textarea, form',
            any: ['has-test-id'],
          },
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      // docgen automatically populates className & style from element prop types, remove
      exclude: /^(className|style)$/g,
    },
    options: {
      // Welcome, then the Foundations and Components sections, each A–Z (case-insensitive). Stories within a
      // component keep their authored order (Default first), which the built-in 'alphabetical' method would
      // reorder. Storybook parses this function as plain JavaScript: keep it self-contained, with no TS
      // annotations (the default parameter values give TypeScript the types instead).
      storySort: (a = { title: '' }, b = { title: '' }) => {
        const sections = ['Welcome', 'Foundations', 'Components'];
        const rank = (title = '') =>
          sections.indexOf(title.split('/')[0] ?? '');
        return (
          rank(a.title) - rank(b.title) ||
          a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
        );
      },
    },
    docs: {
      theme: qmTheme,
      codePanel: true,
      toc: {
        headingSelector: 'h1, h2, h3',
        disable: false,
      },
    },
    customBlock: {
      // provide documentation placeholders for customization on a per-component basis
      accessibility: '',
      usage: '',
    },
  },
  tags: ['autodocs'],
  // Brand theme global read by themeDecorator. Its toolbar control is the custom
  // select registered in manager.ts (keep the brand list in sync there).
  globalTypes: {
    brand: {
      description: 'Brand Themes',
    },
  },
  initialGlobals: {
    brand: 'Homeowner',
  },
  decorators: [themeDecorator],
};

export default preview;
