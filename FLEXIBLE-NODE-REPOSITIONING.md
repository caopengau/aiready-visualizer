# Flexible Node Repositioning for AIReady Visualizer

## Overview

The AIReady visualizer now includes comprehensive node repositioning controls, allowing users to flexibly manipulate the force-directed graph visualization. This feature set enables both manual repositioning and automatic layout management.

## Features Added

### 1. **GraphControls Toolbar Component** (`packages/components/src/charts/GraphControls.tsx`)

A floating toolbar providing interactive controls for graph manipulation:

#### Controls:
- **✋ Drag Mode Toggle**: Enable/disable the ability to drag individual nodes
- **🔧 Manual Layout Mode**: Toggle between force-directed simulation (automatic physics) and manual free-dragging
- **📌 Pin All Nodes**: Lock all nodes in their current positions
- **📍 Unpin All**: Release all pinned nodes to resume physics simulation
- **🎯 Fit View**: Automatically zoom and pan to show all nodes in view
- **↺ Reset Layout**: Clear all pins and restart the force simulation from scratch

#### Features:
- Real-time node and pinned count statistics
- Interactive tooltips via CSS hover
- Responsive positioning (top-left, top-right, bottom-left, bottom-right)
- Dark mode support
- Built-in usage tips

### 2. **Enhanced ForceDirectedGraph Component** (`packages/components/src/charts/ForceDirectedGraph.tsx`)

Updated with imperative handle capabilities for parent components to control layout programmatically.

#### New Ref Handle Methods:
```typescript
interface ForceDirectedGraphHandle {
  pinAll: () => void;              // Pin all nodes in place
  unpinAll: () => void;           // Release all nodes
  resetLayout: () => void;        // Reset to automatic layout
  fitView: () => void;            // Fit all nodes in viewport
  getPinnedNodes: () => string[]; // Get list of pinned node IDs
  setDragMode: (enabled: boolean) => void; // Toggle drag mode
}
```

#### Key Improvements:
- **Dragging**: Smooth node dragging with global event listeners for better UX
- **Pinning**: Nodes can be individually pinned by double-clicking or programmatically via toolbar
- **Manual Layout Mode**: Disables force simulation for completely manual positioning
- **Fit View**: Smooth animated transition to fit all nodes with padding
- **Pin Visual Feedback**: Pinned nodes display a red circular outline

### 3. **App Integration** (`packages/visualizer/web/src/App.tsx`)

Integrated GraphControls with the visualization App:

#### Features:
- Connected all toolbar controls to graph manipulation functions
- Tracks drag mode and manual layout state
- Maintains pinned nodes set for accurate UI feedback
- Passes ref to ForceDirectedGraph for imperative control

## How to Use

### User Interactions:

1. **Move Individual Nodes**
   - Click and drag any node to reposition it
   - The node will follow your cursor during drag

2. **Pin/Unpin Nodes**
   - Double-click a node to pin it in place (shows red outline)
   - Double-click again to unpin
   - Use "Pin All" / "Unpin All" buttons for bulk operations

3. **Reset Layout**
   - Click "Reset to auto-layout" to clear all pins and restart simulation
   - Click "Fit View" to zoom to all nodes

4. **Manual Layout Mode**
   - Toggle "Manual Layout" to disable physics forces
   - In this mode, nodes won't be repelled by forces
   - Useful for precise manual arrangement

5. **View Control**
   - Scroll to zoom in/out
   - Click and drag canvas to pan
   - Use "Fit View" button to auto-fit all nodes

### Keyboard Shortcuts (Built-in):
- **Double-click canvas**: Unpin all nodes and return to auto-layout
- **Scroll wheel**: Zoom in/out
- **Middle mouse drag**: Pan the view

## Technical Architecture

### Component Hierarchy:
```
App.tsx (React component)
├── ForceDirectedGraph (ref: ForceDirectedGraphHandle)
│   ├── D3 Force Simulation Hook
│   ├── SVG Canvas
│   ├── Nodes (draggable, pinnable)
│   └── Links (colored by type)
└── GraphControls (floating toolbar)
    ├── Control buttons
    ├── Statistics display
    └── Usage tips
```

### State Management:
- **Parent App**: Manages `dragEnabled`, `manualLayoutMode`, `pinnedNodeIds`
- **ForceDirectedGraph**: Internal state for transform, drag tracking
- **GraphControls**: Read-only, receives props, emits callbacks

### Libraries Used:
- **D3.js**: Force simulation, zoom, drag behavior
- **React**: Component framework with hooks
- **Ref Forwarding**: Enables parent control via `forwardRef` and `useImperativeHandle`

## Code Examples

### Using the visualizer with controls:

```typescript
// In App.tsx or any parent component
const graphRef = useRef<ForceDirectedGraphHandle>(null);

const handleFitView = () => {
  graphRef.current?.fitView();
};

const handlePinAll = () => {
  graphRef.current?.pinAll();
};

return (
  <>
    <ForceDirectedGraph
      ref={graphRef}
      nodes={nodes}
      links={links}
      width={800}
      height={600}
      enableDrag={dragEnabled}
      manualLayout={manualLayoutMode}
    />
    <GraphControls
      onFitView={handleFitView}
      onPinAll={handlePinAll}
      totalNodes={nodes.length}
      pinnedCount={pinnedNodeIds.size}
    />
  </>
);
```

## Performance Considerations

- **Node Dragging**: Global event listeners for smooth dragging outside canvas
- **Force Simulation**: Automatically disabled in manual layout mode for better performance
- **Ref Updates**: Dependencies carefully managed to prevent unnecessary re-renders
- **Fit View**: Smooth CSS transitions for better UX

## Browser Compatibility

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support

## Future Enhancements

Potential improvements:
- [ ] Multi-select nodes with shift-click
- [ ] Drag multiple selected nodes together
- [ ] Save/load layout states
- [ ] Keyboard shortcuts configuration
- [ ] Custom force simulation parameters UI
- [ ] Export graph layout as image/SVG
- [ ] Node grouping and collapsing

## Testing

To test the visualizer:

```bash
# Start development server
cd packages/visualizer/web
pnpm dev

# Build for production
pnpm build

# Run the visualizer CLI
aiready visualise --dev
```

## Files Modified/Created

### Created:
- `packages/components/src/charts/GraphControls.tsx` - Control toolbar component
- `packages/visualizer/FLEXIBLE-NODE-REPOSITIONING.md` - This documentation

### Modified:
- `packages/components/src/charts/ForceDirectedGraph.tsx` - Added ref handle and imperative methods
- `packages/components/src/index.ts` - Exported GraphControls
- `packages/visualizer/web/src/App.tsx` - Integrated controls and state management

## Version Updates

- **@aiready/components**: Added GraphControls export
- **@aiready/visualizer**: Updated to use enhanced ForceDirectedGraph
