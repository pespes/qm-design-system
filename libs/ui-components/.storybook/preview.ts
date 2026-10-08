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
      // Pin the Introduction page above the component stories
      storySort: {
        order: ['Introduction', 'Components'],
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
