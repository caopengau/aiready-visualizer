import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

/**
 * Find the latest aiready report from .aiready directory
 */
function findLatestReport(basePath: string): string | null {
  const aireadyDir = path.resolve(basePath, '.aiready');
  if (!fs.existsSync(aireadyDir)) return null;
  
  const files = fs.readdirSync(aireadyDir)
    .filter(f => f.startsWith('aiready-report-') && f.endsWith('.json'));
  
  if (files.length === 0) return null;
  
  const sorted = files
    .map(f => ({
      name: f,
      path: path.resolve(aireadyDir, f),
      mtime: fs.statSync(path.resolve(aireadyDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  return sorted[0].path;
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const basePath = resolve(__dirname, '../../..');
  
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
      port: 8000,
      open: false,
      middlewares: [
        (req: any, res: any, next: any) => {
          // Serve the latest aiready report as report-data.json
          if (req.url === '/report-data.json') {
            const reportPath = findLatestReport(basePath);
            if (reportPath && fs.existsSync(reportPath)) {
              try {
                const data = fs.readFileSync(reportPath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              } catch (e) {
                console.error('Error reading report:', e);
              }
            }
          }
          next();
        }
      ],
    },
    resolve: {
      alias: {
        // during dev resolve to source for HMR; during build use the built dist
        '@aiready/components': isDev ? resolve(__dirname, '../../components/src') : resolve(__dirname, '../../components/dist'),
      },
    },
  };
});
