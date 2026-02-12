import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
export default defineConfig(({ command }) => {
    const isDev = command === 'serve';
    return {
        plugins: [react()],
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
            port: 3000,
            open: true,
        },
        resolve: {
            alias: {
                // during dev resolve to source for HMR; during build use the built dist
                '@aiready/components': isDev ? resolve(__dirname, '../../components/src') : resolve(__dirname, '../../components/dist'),
            },
        },
    };
});
