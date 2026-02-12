import { defineConfig } from 'tsup';
export default defineConfig({
    entry: {
        index: 'src/index.ts',
        cli: 'src/cli/index.ts',
        'graph/index': 'src/graph/index.ts',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['@aiready/core'],
    target: 'es2020',
    splitting: false,
    treeshake: true,
});
