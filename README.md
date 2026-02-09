# @aiready/visualizer

Interactive visualization tool for AIReady codebase analysis.

## Features

- 🎯 **Dependency Graph Visualization**: See your codebase structure at a glance
- 🔥 **Hotspot Detection**: Identify problematic files with high token costs and duplicates
- 🔄 **Circular Dependencies**: Detect and highlight circular dependency chains
- 🎨 **Interactive**: Zoom, pan, filter, and explore your codebase
- 📊 **Multiple Views**: Force-directed, hierarchical, radial, and cluster layouts
- 🚀 **Performance**: Handles large codebases (1000+ files) smoothly
- 💾 **Standalone HTML**: Single file output with embedded data

## Installation

```bash
pnpm add @aiready/visualizer
```

## Usage

### CLI

```bash
# Generate visualization from current directory
aiready-visualize . output.html --open

# From specific directory
aiready-visualize ./src my-graph.html
```

### Programmatic API

```typescript
import { GraphBuilder } from '@aiready/visualizer';

// Create a graph
const builder = new GraphBuilder('./src');

// Add nodes
builder.addFileNode('src/index.ts', {
  tokenCost: 2000,
  linesOfCode: 150,
  dependencies: 3,
});

// Add edges
builder.addDependencyEdge('src/index.ts', 'src/utils/helper.ts', 2);

// Build graph
const graph = builder.build();

console.log(`Graph: ${graph.metadata.totalNodes} nodes, ${graph.metadata.totalEdges} edges`);
```

## Architecture

The visualizer follows AIReady's hub-and-spoke pattern:

- **Hub**: `@aiready/core` (shared utilities)
- **Spoke**: `@aiready/visualizer` (graph visualization)
- **Integration**: Via `@aiready/cli`

## Technology Stack

- **Layout Engine**: d3-force (physics-based force-directed layouts)
- **Rendering**: Canvas (high-performance) + SVG (static exports)
- **Frontend**: React + Vite (coming soon)
- **Output**: Standalone HTML with embedded data

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Watch mode
pnpm dev

# Test CLI
pnpm build && node dist/cli.js . test.html --open
```

## Roadmap

- [x] Graph builder with circular dependency detection
- [x] Basic CLI with HTML generation
- [x] Simple canvas rendering
- [ ] React + d3-force interactive frontend
- [ ] Multiple layout algorithms (hierarchical, radial, circular)
- [ ] Filters (severity, type, metrics)
- [ ] Search and highlight
- [ ] Node details panel
- [ ] Export to PNG/SVG
- [ ] Integration with @aiready/cli

## License

MIT