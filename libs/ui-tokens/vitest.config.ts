import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/build-tree/**/*.test.ts'],
    clearMocks: true,
  },
});
