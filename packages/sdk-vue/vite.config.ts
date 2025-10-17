import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OrgaAIVue',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', '@orga-ai/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@orga-ai/core': 'OrgaAICore'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.vue')) {
            return 'components/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    outDir: 'lib',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
