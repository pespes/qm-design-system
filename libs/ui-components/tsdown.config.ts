import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: { sourcemap: false },
  sourcemap: true,
  hash: false,
  tsconfig: './tsconfig.lib.json',
  deps: {
    neverBundle: ['react', 'react-dom', '@quartermaster/ui-tokens'],
  },
  clean: true,
});
