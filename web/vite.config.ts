import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

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
        '@aiready/components': isDev ? resolve(__dirname, '../../components/src') : resolve(__dirname, '../../components/dist'),
      },
    },
  };
});
