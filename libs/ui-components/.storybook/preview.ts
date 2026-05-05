import type { Preview } from '@storybook/react-vite';
import '../src/globals.css';
import { docPageMarkup, themeDecorator } from '../src/utils/storybook-configs';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      exclude: /^(className|style)$/g
    },
    docs: {
      page: docPageMarkup,
      codePanel: true,
      toc: {
        headingSelector: 'h1, h2, h3',
        disable: false,
        unsafeTocbotOptions: {
          orderedList: false,
        },
      }
    },
    customBlock: {
      accessibility: '',
      usage: '',
    }
  },
  tags: ['autodocs'],
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
    theme: 'homeowner',
  },
  decorators: [themeDecorator],
};

export default preview;
