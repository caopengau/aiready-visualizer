import { GraphBuilder } from '../../src/graph/builder';

// Minimal smoke test for GraphBuilder.buildFromReport
const sampleReport: any = {
  files: [
    {
      file: 'packages/visualizer/src/index.ts',
      tokens: 120,
      imports: [],
    },
  ],
  duplicates: [],
  patterns: [],
};

function run() {
  const graph = GraphBuilder.buildFromReport(sampleReport, process.cwd());
  if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    console.error('GraphBuilder.buildFromReport produced no nodes');
    process.exitCode = 1;
    return;
  }
  console.log('OK: GraphBuilder.buildFromReport produced', graph.nodes.length, 'node(s)');
}

if (require.main === module) run();

export {}; // keep this file module-scoped
