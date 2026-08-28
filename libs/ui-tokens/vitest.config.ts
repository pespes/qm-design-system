import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/build-tree/**/*.test.ts',
      'src/dictionary/tests/dictionary-helpers.test.ts',
    ],
    clearMocks: true,
  },
});
