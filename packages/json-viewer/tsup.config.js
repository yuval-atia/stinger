import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.jsx',
    diff: 'src/diff/index.js',
    utils: 'src/utils/index.js',
  },
  format: ['esm', 'cjs'],
  dts: false,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-dom'],
  jsx: 'automatic',
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
