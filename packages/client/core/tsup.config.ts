import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'types/index': 'src/types/index.ts',
    'errors/index': 'src/errors/index.ts',
    'utils/index': 'src/utils/index.ts',
    'ports/index': 'src/ports/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [],
  noExternal: [],
  platform: 'neutral',
  target: 'es2020',
  outDir: 'dist',
});

