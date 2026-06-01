import type { Preview } from '@storybook/react-vite';
import '../src/globals.css';
import { themeDecorator } from '@sb/configs/decorators';

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
    docs: {
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
  //globalTypes helps render toolbar options applicable to all stories - in this case default brand colours
  globalTypes: {
    brand: {
      description: 'Brand Themes',
      toolbar: {
        title: 'Select Brand',
        icon: 'user',
        items: ['Homeowner', 'Pro'],
        dynamicTitle: false,
      },
    },
  },
  initialGlobals: {
    brand: 'Homeowner',
  },
  decorators: [themeDecorator],
};

export default preview;
