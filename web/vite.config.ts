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
  // Dev-time middleware: if the CLI sets AIREADY_REPORT_PATH when spawning Vite,
  // serve that file at /report-data.json so the client can fetch the report
  // directly from the consumer working directory without copying into node_modules.
  const reportProxyPlugin = {
    name: 'aiready-report-proxy',
    configureServer(server: any) {
      const reportPath = process.env.AIREADY_REPORT_PATH;
      const visualizerConfigStr = process.env.AIREADY_VISUALIZER_CONFIG;
      if (!reportPath) return;
      server.middlewares.use(async (req: any, res: any, next: any) => {
        try {
          const url = req.url || '';
          if (url === '/report-data.json' || url.startsWith('/report-data.json?')) {
            const { promises: fsp } = await import('fs');
            if (!existsSync(reportPath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.end('Report not found');
              return;
            }
            let data = await fsp.readFile(reportPath, 'utf8');
            const report = JSON.parse(data);
            
            // Inject visualizer config from env if available
            if (visualizerConfigStr) {
              try {
                const visualizerConfig = JSON.parse(visualizerConfigStr);
                report.visualizerConfig = visualizerConfig;
              } catch (e) {
                // Silently ignore parse errors
              }
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(report));
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Error reading report');
          return;
        }
        next();
      });
    },
  };
  plugins.push(reportProxyPlugin);
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
