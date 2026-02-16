# Visualizer Next Phase Recommendations

## Current Status

The visualizer package has reached a solid foundation with:
- ✅ Core graph building from aiready reports
- ✅ Interactive React web application
- ✅ Force-directed layout with d3-force
- ✅ Flexible node repositioning (drag, pin, manual mode)
- ✅ Theme support (dark/light)
- ✅ Node details and legend panels
- ✅ CLI tool for HTML generation

## Recommended Next Phases

### Phase 5: CLI Integration (High Priority)

**Goal**: Integrate visualizer into the main aiready CLI workflow

**Tasks**:
1. Add `aiready visualise` subcommand to `@aiready/cli`
2. Support `--visualize` flag on `aiready scan` command
3. Auto-launch browser after scan completes
4. Support multiple output formats (html, json)

**Benefits**:
- Seamless user experience
- Single command from scan to visualization
- Better discoverability

### Phase 6: Enhanced Filtering & Search (Medium Priority)

**Goal**: Help users focus on specific issues or areas

**Tasks**:
1. Filter by severity (critical, major, minor, info)
2. Filter by file type (component, util, service, etc.)
3. Filter by domain/cluster
4. Search nodes by name or path
5. Toggle edge types visibility
6. Filter panel UI component

**Benefits**:
- Focus on high-priority issues
- Explore specific areas of the codebase

### Phase 7: Export Capabilities (Medium Priority)

**Goal**: Enable sharing and embedding visualizations

**Tasks**:
1. Export as PNG image (canvas to blob)
2. Export as SVG
3. Export graph data as JSON
4. Generate shareable standalone HTML
5. Print-friendly stylesheet

**Benefits**:
- Share visualizations in reports
- Embed in documentation
- Print for presentations

### Phase 8: Advanced Layouts (Low Priority)

**Goal**: Provide alternative visualization approaches

**Tasks**:
1. Hierarchical/tree layout (d3-hierarchy)
2. Circular layout
3. Radial layout
4. Cluster-based layout (by package/domain)
5. Layout switcher UI

**Benefits**:
- Different perspectives on codebase
- Better for large graphs

### Phase 9: Performance & Scalability (Ongoing)

**Goal**: Handle larger codebases efficiently

**Tasks**:
1. Virtualization for large node counts (>500)
2. Web Worker for force simulation
3. Progressive loading for large datasets
4. Performance benchmarks

**Benefits**:
- Handle enterprise-scale codebases
- Smoother interactions

### Phase 10: Collaboration Features (Future)

**Goal**: Enable team collaboration

**Tasks**:
1. Save/load layout states (localStorage/file)
2. Export layout configuration
3. Node annotations/comments
4. Issue assignment (mock)

**Benefits**:
- Share investigation state
- Track remediation progress

## Quick Wins (Quick Implementation)

### 1. Keyboard Shortcuts
```typescript
// Add to GraphControls
- 'f': Fit view
- 'r': Reset layout
- 'p': Pin all
- 'u': Unpin all
- 'Escape': Close panel
```

### 2. Hover Tooltips
- Show node label on hover
- Show edge type on hover
- Quick info without clicking

### 3. Minimap
- Overview of entire graph
- Click to navigate
- Current viewport indicator

### 4. Statistics Dashboard
- Total files, dependencies
- Issue breakdown by severity
- Top N most complex files

## Implementation Order Suggestion

1. **Week 1-2**: Phase 5 - CLI Integration
2. **Week 3-4**: Phase 6 - Filtering & Search
3. **Week 5-6**: Phase 7 - Export Capabilities
4. **Week 7-8**: Phase 8 - Advanced Layouts
5. **Ongoing**: Phase 9 - Performance

## Technical Considerations

### Type Unification
The current codebase has two type definitions:
- `packages/visualizer/src/types.ts` - Core types
- `packages/visualizer/web/src/types.ts` - Web-specific types (simpler)

**Recommendation**: Unify types, have web layer adapt from core types

### Component Sharing
ForceDirectedGraph is in `@aiready/components`:
- Good: Reusable across projects
- Risk: Version sync between packages
- Mitigation: Keep in sync, document API

### Testing
Current test coverage is minimal:
- Add unit tests for GraphBuilder
- Add integration tests for web app
- Add E2E tests for CLI

## Resources

- [d3-force Documentation](https://d3js.org/d3-force)
- [d3-hierarchy (for tree layouts)](https://d3js.org/d3-hierarchy)
- [React + D3 integration patterns](https://www.pluralsight.com/guides/integrating-d3-js-with-react-js)

---

*Last updated: February 2026*
