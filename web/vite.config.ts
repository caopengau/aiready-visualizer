import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { existsSync } from 'fs';

export default defineConfig(async ({ command }) => {
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

  const plugins: any[] = [react()];
  // Try to dynamically import Tailwind Vite plugin. If it's not installed,
  // continue without it so consumers who don't use Tailwind won't error.
  try {
    // import may return a module with a default export or the function itself
    const mod = await import('@tailwindcss/vite');
    const fn = mod?.default ?? mod;
    if (typeof fn === 'function') {
      plugins.push(fn());
    }
  } catch (e) {
    // plugin not available; proceed without Tailwind integration
  }

  return {
    plugins,
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
