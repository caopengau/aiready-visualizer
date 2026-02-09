# @aiready/visualizer

Interactive graph visualization for analysis results produced by `aiready-cli`.

## Overview

This package provides tools to transform AIReady analysis results into interactive force-directed graph visualizations. It consists of:

- **Graph Builder**: Transforms analysis data into graph structures
- **CLI Tool**: Generates standalone HTML visualizations
- **Type Definitions**: Comprehensive TypeScript types for graph data

## Installation

```bash
pnpm add @aiready/visualizer
```

## Usage

### As a Library

```typescript
import { buildGraph, createSampleGraph } from '@aiready/visualizer';

// Build graph from analysis results
const graph = buildGraph(analysisResults);

// Or create a sample graph for testing
const sampleGraph = createSampleGraph();

console.log(`Graph has ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
```

### As a CLI Tool

```bash
# Generate a sample visualization
aiready-visualize sample -o visualization.html

# Generate from analysis results (Phase 4B)
aiready-visualize generate results.json -o visualization.html
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

**Phase 4A (Current)**: CLI package foundation
- ✅ Type definitions
- ✅ Graph builder with sample data
- ✅ Basic CLI structure
- ⏳ HTML generation (Phase 4B)

**Phase 4B (Next)**: Interactive frontend
- Vite + React setup
- ForceDirectedGraph integration
- Controls and filters
- Standalone HTML output

## Architecture

This package follows the hub-and-spoke pattern:

- **Hub**: `@aiready/core` (HUB) and the public CLI `aiready-cli`
- **Spoke**: Independent repo at `aiready-visualizer`
- **Integration**: With `@aiready/components` for UI

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT