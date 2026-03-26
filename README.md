# @aiready/visualizer

> AIReady Spoke: Interactive graph visualization for AIReady analysis results.

[![npm version](https://img.shields.io/npm/v/@aiready/visualizer.svg)](https://npmjs.com/package/@aiready/visualizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This package provides tools to transform AIReady analysis results into interactive force-directed graph visualizations. It helps teams see architectural bottlenecks and context fragmentation visually.

## 🏛️ Architecture

```
                    🎯 USER
                      │
                      ▼
         🎛️  @aiready/cli (orchestrator)
          │     │     │     │     │     │     │     │     │     │
          ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼
        [PAT] [CTX] [CON] [AMP] [DEP] [DOC] [SIG] [AGT] [TST] [CTR]
          │     │     │     │     │     │     │     │     │     │
          └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
                               │
                               ▼
                      🏢 @aiready/core

Legend:
  PAT = pattern-detect        CTX = context-analyzer
  CON = consistency           AMP = change-amplification
  DEP = deps-health           DOC = doc-drift
  SIG = ai-signal-clarity     AGT = agent-grounding
  TST = testability           CTR = contract-enforcement
  VIZ = @aiready/visualizer ★  (support package — renders analysis results, not a scorer)
  ★   = YOU ARE HERE
```

## Features

- **Graph Builder**: Transforms analysis data into graph structures.
- **Force-Directed Layout**: Physics-based graph layout using d3-force.
- **Node Details**: Click nodes to see detailed metrics (LOC, token cost, etc.).
- **Issue Overlay**: Visualize detected issues directly on the dependency graph.

## Installation

```bash
pnpm add @aiready/visualizer
```

## Usage

```bash
aiready visualise
```

## License

MIT
