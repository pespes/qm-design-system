import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    tailwindcss(),
    storybookTest({
      configDir: path.join(dirname, '.storybook'),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@sb': path.resolve(dirname, './.storybook'),
    },
  },
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    testTimeout: 10_000,
  },
});
