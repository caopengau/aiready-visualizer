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
            🎛️  CLI (orchestrator)
                      │
    ┌─────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌────────┐                        ┌────────┐
│🎨 VIS- │                        │ ANALY- │
│UALIZER │                        │  SIS   │
│✅ Ready│                        │ SPOKES │
└────────┘                        └───┬────┘
    │      ▲                          │
    │      └──────── YOU ARE HERE ────┤
    │                                 │
    │   ┌───────────────┬─────────────┴─────────────┬───────────────┐
    ▼   ▼               ▼                           ▼               ▼
┌────────┐        ┌────────┐                  ┌────────┐        ┌────────┐
│📊 PAT- │        │📦 CON- │                  │🔧 CON- │        │💥 CHN- │
│TERN    │        │TEXT    │                  │SISTENCY│        │ AMP    │
│DETECT  │        │ANALYZER│                  │        │        │        │
│✅ Ready│        │✅ Ready│                  │✅ Ready│        │✅ Ready│
└────────┘        └────────┘                  └────────┘        └────────┘
    │   ┌───────────────┘       ┌───────────┐       └──────────────┐   │
    │   ▼                       ▼           ▼                      ▼   │
┌────────┐                 ┌────────┐   ┌────────┐            ┌────────┐
│📡 SIG- │                 │🤖 AGT- │   │🧪 TEST-│            │📅 DEPS-│
│ CLARITY│                 │ GROUND │   │ ABILITY│            │ HEALTH │
│✅ Ready│                 │✅ Ready│   │✅ Ready│            │✅ Ready│
└────────┘                 └────────┘   └────────┘            └────────┘
    │              ┌────────────┴───────────┴────────────┐             │
    │              ▼                                     ▼             │
    │        ┌───────────┐                         ┌───────────┐       │
    │        │📝 DOC-    │                         │🛠️  SKILLS  │       │
    │        │ DRIFT     │                         │           │       │
    │        │✅ Ready   │                         │✅ Ready   │       │
    │        └───────────┘                         └───────────┘       │
    │              │                                     │             │
    └──────────────┴────────────┬────────────────────────┴─────────────┘
                                │
                                ▼
                      🏢 HUB (@aiready/core)
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
