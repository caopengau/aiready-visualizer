# Getting Started with @aiready/visualizer

## What We've Built

✅ **Phase 1-4: Foundation to Flexible Repositioning - COMPLETE**

We've successfully built a comprehensive visualization system for AIReady analysis results:

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
- **Build from Reports**: `GraphBuilder.buildFromReport()` for processing aiready reports

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

### 3. Web Application (`web/`)
- **React + Vite Frontend**: Modern interactive UI
- **d3-force Layout Engine**: Physics-based force-directed graphs
- **ForceDirectedGraph Component**: Reusable graph visualization from `@aiready/components`
- **GraphControls**: Floating toolbar with repositioning controls
- **Theme Support**: Dark/Light mode with system preference detection

### 4. Interactive Features

#### Node Repositioning
- Drag individual nodes to reposition
- Pin/unpin nodes (double-click)
- Pin all / Unpin all controls
- Manual layout mode (disable physics)
- Reset layout to auto
- Fit view to show all nodes

#### Visual Features
- Zoom & pan (scroll/drag)
- Node details panel (click nodes)
- Legend panel (severity colors, edge types)
- Severity-based coloring (critical, major, minor, info)

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

### Run Web Application

```bash
# Start development server
pnpm dev:web

# Or build and preview
pnpm build:web
pnpm preview
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
builder.addNode('src/index.ts', 'Main entry', 100);
builder.addNode('src/utils/helper.ts', 'Utilities', 50);

// Add edges
builder.addEdge('src/index.ts', 'src/utils/helper.ts', 'dependency');

// Build graph
const graph = builder.build();

console.log('Graph Statistics:');
console.log(`- Nodes: ${graph.nodes.length}`);
console.log(`- Edges: ${graph.edges.length}`);
```

### Building from aiready Reports

```typescript
import { GraphBuilder } from '@aiready/visualizer';
import fs from 'fs';

const report = JSON.parse(fs.readFileSync('aiready-report.json', 'utf-8'));
const graph = GraphBuilder.buildFromReport(report, '/path/to/project');

console.log('Graph Statistics:');
console.log(`- Files: ${graph.metadata.totalFiles}`);
console.log(`- Dependencies: ${graph.metadata.totalDependencies}`);
console.log(`- Critical Issues: ${graph.metadata.criticalIssues}`);
console.log(`- Major Issues: ${graph.metadata.majorIssues}`);
```

## Current Capabilities

✅ Create graph from file data
✅ Add nodes with metrics
✅ Add dependency edges
✅ Detect circular dependencies
✅ Calculate graph statistics
✅ Generate standalone HTML
✅ Interactive React UI with d3-force
✅ Drag nodes to reposition
✅ Pin/unpin nodes
✅ Pin all/Unpin all controls
✅ Manual layout mode
✅ Fit view & Reset layout
✅ Theme support (dark/light)
✅ Node details panel
✅ Legend panel
✅ Zoom & pan
✅ CLI interface
✅ Build from aiready reports

## Next Phase Recommendations

### Priority 1: CLI Integration
- Integrate with `@aiready/cli` for unified analysis workflow
- Add `aiready visualise` command to the main CLI
- Auto-generate visualization after scan completes

### Priority 2: Enhanced Filtering & Search
- Filter by severity level
- Filter by file type/module type
- Filter by domain/cluster
- Search nodes by name/path
- Show/hide edge types

### Priority 3: Export Capabilities
- Export graph as PNG image
- Export graph as SVG
- Export as JSON (graph data)
- Print-friendly layout

### Priority 4: Advanced Layouts
- Hierarchical/tree layout
- Circular layout
- Radial layout
- Cluster-based layout

### Priority 5: Collaboration Features
- Shareable visualization URLs
- Save/load layout states
- Annotations on nodes

## Architecture

The visualizer follows the hub-and-spoke pattern used by the project:

```
@aiready/core (HUB)
    ↓
@aiready/visualizer (SPOKE)
    ├── Graph Builder
    ├── Type Definitions
    ├── CLI Tool
    └── Web App
        ↓
@aiready/components (HUB - shared UI)
    ├── ForceDirectedGraph
    └── GraphControls
    ↓
@aiready/cli (HUB - integration)
```

## Development Commands

```bash
# Watch mode for CLI
pnpm dev

# Start web dev server
pnpm dev:web

# Build CLI + Web
pnpm build

# Build CLI only
pnpm build:cli

# Build web only
pnpm build:web

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## Contributing

See the main AIReady repository for contribution guidelines.

## License

MIT
