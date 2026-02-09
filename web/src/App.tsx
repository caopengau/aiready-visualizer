import { useState } from 'react';
import { ForceDirectedGraph } from '@aiready/components/charts/ForceDirectedGraph';
import type { GraphNode, GraphLink } from '@aiready/components/charts/ForceDirectedGraph';

// Sample data for testing
const sampleNodes: GraphNode[] = [
  {
    id: 'file1',
    label: 'Button.tsx',
    color: '#3b82f6',
    size: 15,
  },
  {
    id: 'file2',
    label: 'helpers.ts',
    color: '#10b981',
    size: 12,
  },
  {
    id: 'file3',
    label: 'api.ts',
    color: '#f59e0b',
    size: 18,
  },
  {
    id: 'file4',
    label: 'types.ts',
    color: '#8b5cf6',
    size: 10,
  },
];

const sampleLinks: GraphLink[] = [
  { source: 'file1', target: 'file2' },
  { source: 'file2', target: 'file3' },
  { source: 'file3', target: 'file4' },
  { source: 'file1', target: 'file4' },
];

export default function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  return (
    <div className="flex flex-col h-full">
      <header className="bg-gray-900 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">AIReady Visualizer</h1>
        <p className="text-gray-400 text-sm">Interactive Dependency Graph</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-gray-50">
          <ForceDirectedGraph
            nodes={sampleNodes}
            links={sampleLinks}
            width={window.innerWidth - 320}
            height={window.innerHeight - 80}
            onNodeClick={(node) => setSelectedNode(node)}
            onNodeHover={(node) => setHoveredNode(node)}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNode?.id}
            showNodeLabels={true}
          />
        </main>

        <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Selected Node</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedNode.label}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Node ID</h3>
                <p className="text-sm text-gray-600 mt-1 font-mono">{selectedNode.id}</p>
              </div>
              {selectedNode.color && (
                <div>
                  <h3 className="font-medium text-gray-700">Color</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: selectedNode.color }}
                    />
                    <span className="text-sm text-gray-600 font-mono">{selectedNode.color}</span>
                  </div>
                </div>
              )}
            </div>
          ) : hoveredNode ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Hovered Node</h3>
                <p className="text-sm text-gray-600 mt-1">{hoveredNode.label}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Click on a node to see details</p>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">Graph Stats</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Nodes:</dt>
                <dd className="font-medium">{sampleNodes.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Links:</dt>
                <dd className="font-medium">{sampleLinks.length}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}