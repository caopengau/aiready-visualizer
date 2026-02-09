# Getting Started with @aiready/visualizer

## What We've Built

✅ **Phase 1 Foundation - COMPLETE**

We've successfully created the foundation of the AIReady visualizer package:

### 1. Package Structure
- **TypeScript Configuration**: Standalone tsconfig with ES2020 target
- **Build System**: tsup for fast TypeScript bundling
- **Package Configuration**: ESM-first with proper exports

### 2. Core Components

#### Graph Builder (`src/graph/builder.ts`)
- Create visualization graphs from file analysis data
- Add nodes (files) with metrics
- Add edges (dependencies) between files
- Detect circular dependencies automatically
- Create domain-based clusters
- Calculate graph statistics (components, density, etc.)

#### Type System (`src/types.ts`)
- Comprehensive TypeScript types for all graph elements
- Node metrics (token cost, LOC, dependencies, etc.)
- Edge types (import, export, type-dependency)
- Visualization configuration options
- Filter and layout types

#### CLI Tool (`src/cli.ts`)
- Generate standalone HTML visualizations
- Simple command-line interface
- Auto-open in browser with `--open` flag
- Embedded graph data in HTML (no external dependencies)

### 3. Output Format

The CLI generates a **standalone HTML file** with:
- Embedded graph data (JSON)
- Simple canvas-based rendering (placeholder)
- Statistics dashboard
- Dark theme UI
- No external dependencies required

## Quick Start

### Installation

```bash
cd packages/visualizer
pnpm install
```

### Build

```bash
pnpm build
```

### Test the CLI

```bash
# Generate visualization of current directory
node dist/cli.js . output.html --open

# Or use the bin command (after linking)
pnpm link --global
aiready-visualize . my-graph.html --open
```

### Programmatic Usage

```typescript
import { GraphBuilder } from '@aiready/visualizer';

// Create a graph builder
const builder = new GraphBuilder('./src');

// Add nodes
builder.addFileNode('src/index.ts', {
  tokenCost: 2000,
  linesOfCode: 150,
  dependencies: 3,
  imports: 5,
  exports: 2,
});

builder.addFileNode('src/utils/helper.ts', {
  tokenCost: 1000,
  linesOfCode: 80,
});

// Add edges
builder.addDependencyEdge('src/index.ts', 'src/utils/helper.ts', 2);

// Build graph with automatic analysis
const graph = builder.build();

console.log('Graph Statistics:');
console.log(`- Nodes: ${graph.metadata.totalNodes}`);
console.log(`- Edges: ${graph.metadata.totalEdges}`);
console.log(`- Circular Dependencies: ${graph.metadata.circularDependencies.length}`);
console.log(`- Connected Components: ${graph.metadata.connectedComponents}`);
```

## What's Next?

### Phase 2: Interactive Frontend (Coming Soon)

The current HTML output is a simple placeholder. Phase 2 will add:

- **React + Vite Frontend**: Modern interactive UI
- **d3-force Layout Engine**: Physics-based force-directed graphs
- **Interactive Controls**:
  - Zoom and pan
  - Node selection
  - Search and filter
  - Layout switching
- **Details Panel**: Show node/edge information on click
- **Filters**: Filter by severity, file type, metrics, etc.
- **Multiple Layouts**: Force-directed, hierarchical, radial, circular

### Phase 3: Integration with AIReady CLI

- Integrate with `@aiready/cli` for unified analysis
- Generate visualizations from real analysis data
- Support for pattern-detect, context-analyzer, and consistency results
- Overlay analysis issues on the graph

## Architecture

The visualizer follows AIReady's hub-and-spoke pattern:

```
@aiready/core (HUB)
    ↓
@aiready/visualizer (SPOKE)
    ├── Graph Builder
    ├── Type Definitions
    ├── CLI Tool
    └── [Future] React Frontend
    ↓
@aiready/cli (HUB - integration)
```

## Development Commands

```bash
# Watch mode
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Clean
pnpm clean

# Test (when tests are added)
pnpm test
```

## Current Capabilities

✅ Create graph from file data
✅ Add nodes with metrics
✅ Add dependency edges
✅ Detect circular dependencies
✅ Calculate graph statistics
✅ Generate standalone HTML
✅ Simple canvas visualization
✅ CLI interface

## Limitations (To Be Addressed)

⏳ Interactive UI (React + d3-force)
⏳ Multiple layout algorithms
⏳ Filters and search
⏳ Integration with real analysis data
⏳ Export to PNG/SVG
⏳ Advanced interactions (drag, select, etc.)

## Contributing

See the main AIReady repository for contribution guidelines.

## License

MIT