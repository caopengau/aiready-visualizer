import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { existsSync } from 'fs';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  // Resolve path to @aiready/components for alias
  // Try monorepo first, then fall back to installed package
  let componentsPath = resolve(__dirname, '../../components/src');
  if (!existsSync(componentsPath)) {
    // Fallback: try installed package
    try {
      componentsPath = require.resolve('@aiready/components');
      componentsPath = resolve(componentsPath, '..');
    } catch (e) {
      // Use build dist as last resort
      componentsPath = resolve(__dirname, '../../components/dist');
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      // Use default port (5173); don't hardcode to avoid conflicts
      open: false,
    },
    resolve: {
      alias: {
        // during dev resolve to source for HMR; during build use the built dist
        '@aiready/components': isDev ? componentsPath : resolve(__dirname, '../../components/dist'),
      },
    },
  };
});
