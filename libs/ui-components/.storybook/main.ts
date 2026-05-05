import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    
    reactDocgenTypescriptOptions: {
      // This is the specific fix for your 'string' vs 'union' issue
      shouldExtractLiteralValuesFromEnum: true, 
      // This ensures that even if a prop is optional, the union is preserved
      shouldRemoveUndefinedFromOptional: true,
      // Helps with complex types from libraries
      compilerOptions: {
        // allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
      tsconfigPath: './tsconfig.storybook.json',
    },
  },
};

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;
