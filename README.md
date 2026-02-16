# @aiready/visualizer

Interactive graph visualization for analysis results produced by `aiready-cli`.

## Overview

This package provides tools to transform AIReady analysis results into interactive force-directed graph visualizations. It consists of:

- **Graph Builder**: Transforms analysis data into graph structures
- **CLI Tool**: Generates standalone HTML visualizations
- **Web App**: React-based interactive visualization (Vite-powered)
- **Type Definitions**: Comprehensive TypeScript types for graph data

## Features

### Core Capabilities
- ✅ **Graph Building**: Transform aiready analysis reports into graph structures
- ✅ **Node Management**: File nodes with metrics (token cost, LOC, duplicates, complexity)
- ✅ **Edge Management**: Dependency edges with types (import, dependency, similarity, reference)
- ✅ **Issue Tracking**: Overlay detected issues on the graph with severity levels
- ✅ **Circular Dependency Detection**: Automatic detection of circular dependencies

### Interactive Visualization
- ✅ **Force-Directed Layout**: Physics-based graph layout using d3-force
- ✅ **Flexible Node Repositioning**: 
  - Drag individual nodes to reposition
  - Pin/unpin nodes (double-click or programmatically)
  - Pin all / Unpin all controls
  - Manual layout mode (disable physics)
  - Reset layout to auto
  - Fit view to show all nodes
- ✅ **Theme Support**: Dark/Light mode with system preference detection
- ✅ **Node Details Panel**: Click nodes to see detailed metrics
- ✅ **Legend Panel**: Color coding by severity and edge types
- ✅ **Zoom & Pan**: Scroll to zoom, drag to pan

### CLI & Integration
- ✅ **Standalone HTML Generation**: Generate shareable visualizations
- ✅ **Programmatic API**: Use GraphBuilder in your own code
- ✅ **Sample Data Generation**: Test with sample graphs

## Installation

```bash
pnpm add @aiready/visualizer
```

## Usage

### As a Library

```typescript
import { GraphBuilder, createSampleGraph } from '@aiready/visualizer';

// Build graph from analysis results
const builder = new GraphBuilder('./src');
builder.addNode('src/index.ts', 'Main entry', 100);
builder.addNode('src/utils.ts', 'Utilities', 50);
builder.addEdge('src/index.ts', 'src/utils.ts', 'dependency');
const graph = builder.build();

// Or create a sample graph for testing
const sampleGraph = createSampleGraph();

console.log(`Graph has ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
```

### Building from aiready Reports

```typescript
import { GraphBuilder } from '@aiready/visualizer';
import fs from 'fs';

const report = JSON.parse(fs.readFileSync('aiready-report.json', 'utf-8'));
const graph = GraphBuilder.buildFromReport(report, '/path/to/project');

console.log(`Graph: ${graph.metadata.totalFiles} files, ${graph.metadata.totalDependencies} dependencies`);
console.log(`Issues: ${graph.metadata.criticalIssues} critical, ${graph.metadata.majorIssues} major`);
```

### As a CLI Tool

```bash
# Generate a sample visualization
aiready-visualize sample -o visualization.html

# Generate from analysis results
aiready-visualize generate results.json -o visualization.html
```

### Web Application

```bash
# Start development server
cd packages/visualizer/web
pnpm dev

# Build for production
pnpm build
```

## Data Structure

The visualizer uses a comprehensive graph data structure:

```typescript
interface GraphData {
  nodes: FileNode[];        // Files in the codebase
  edges: DependencyEdge[];  // Import/dependency relationships
  clusters: Cluster[];      // Domain/module groupings
  issues: IssueOverlay[];   // Detected issues
  metadata: GraphMetadata;  // Aggregate information
}
```

### Node Properties

- **Metrics**: Lines of code, token cost, complexity
- **Issues**: Duplicates, inconsistencies count
- **Categorization**: Domain, module type
- **Visual**: Color, size, group

### Edge Properties

- **Type**: import, require, dynamic
- **Weight**: Dependency strength
- **Visual**: Color, width, label

## Development Status

### ✅ Phase 1-2: Core Foundation - COMPLETE
- Type definitions
- Graph builder with sample data
- Basic CLI structure

### ✅ Phase 3: Interactive Frontend - COMPLETE
- Vite + React setup
- ForceDirectedGraph integration
- Controls and filters
- Node details panel

### ✅ Phase 4: Flexible Node Repositioning - COMPLETE
- Drag nodes individually
- Pin/unpin nodes (double-click)
- Pin all/Unpin all controls
- Manual layout mode
- Fit view & Reset layout

## Architecture

This package follows the hub-and-spoke pattern:

```
@aiready/core (HUB)
    ↓
@aiready/visualizer (SPOKE)
    ├── Graph Builder (src/graph/)
    ├── Type Definitions (src/types.ts)
    ├── CLI Tool (src/cli.ts)
    └── Web App (web/)
        └── @aiready/components
            ├── ForceDirectedGraph
            └── GraphControls
    ↓
@aiready/cli (HUB - integration)
```

## Directory Structure

```
packages/visualizer/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── index.ts            # Package exports
│   ├── types.ts            # Core TypeScript types
│   └── graph/
│       └── builder.ts      # Graph building logic
├── web/                    # React web application
│   ├── src/
│   │   ├── App.tsx         # Main app component
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils.ts        # Utilities
│   └── vite.config.ts      # Vite configuration
├── scripts/               # Development scripts
├── test/                  # Unit tests
└── README.md              # This file
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

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
