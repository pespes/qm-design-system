import type { Preview } from '@storybook/react-vite';
import '../src/globals.css';
import { themeDecorator } from '@sb/configs/decorators';

const preview: Preview = {
  parameters: {
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
