import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';

const externalDeps = ['react', 'react-dom', '@level/ui-tokens', '@base-ui/react', 'lucide-react'];
const isExternal = (id) =>
  externalDeps.some((name) => id === name || id.startsWith(`${name}/`));

const bundle = {
  input: 'src/index.ts',
  external: isExternal,
  output: [
    { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' },
  ],
  plugins: [
    resolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.lib.json',
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.*', 'node_modules/**'],
      compilerOptions: { module: 'NodeNext' },
    }),
  ],
};

const types = {
  input: 'src/index.ts',
  external: isExternal,
  output: [
    { file: 'dist/index.d.ts', format: 'esm' },
    { file: 'dist/index.d.cts', format: 'cjs' },
  ],
  plugins: [
    resolve({ extensions: ['.ts', '.tsx', '.d.ts'] }),
    dts({ tsconfig: './tsconfig.lib.json' }),
  ],
};

export default [bundle, types];