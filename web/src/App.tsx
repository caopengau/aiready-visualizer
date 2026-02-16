import { useEffect, useState, useMemo } from 'react';
import { GraphData, FileNode, SeverityLevel, EdgeType } from './types';
import { themeConfig } from './constants';
import { transformReportToGraph, loadReportData } from './utils';
import { useDimensions } from './hooks/useDimensions';
import { useTheme } from './hooks/useTheme';
import {
  LoadingSpinner,
  ErrorDisplay,
  Navbar,
  LegendPanel,
  NodeDetails,
  GraphCanvas,
} from './components';

// All available severity levels
const ALL_SEVERITIES: SeverityLevel[] = ['critical', 'major', 'minor', 'info'];

// All available edge types (excluding 'default' and 'reference' as they're filtered out in UI)
const ALL_EDGE_TYPES: EdgeType[] = ['similarity', 'dependency', 'related'];

function App() {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state - start with all visible
  const [visibleSeverities, setVisibleSeverities] = useState<Set<SeverityLevel>>(
    new Set(ALL_SEVERITIES)
  );
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState<Set<EdgeType>>(
    new Set(ALL_EDGE_TYPES)
  );

  const { containerRef, dimensions } = useDimensions();
  const { theme, setTheme, effectiveTheme } = useTheme();

  const colors = themeConfig[effectiveTheme];

  // Load report data
  useEffect(() => {
    const loadData = async () => {
      const reportData = await loadReportData();

      if (!reportData) {
        setError(
          'No scan data found. Run "pnpm aiready scan ." then copy to public/report-data.json'
        );
        setLoading(false);
        return;
      }

      setData(transformReportToGraph(reportData));
      setLoading(false);
    };

    loadData();
  }, []);

  // Toggle severity visibility
  const handleToggleSeverity = (severity: SeverityLevel) => {
    setVisibleSeverities(prev => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  };

  // Toggle edge type visibility
  const handleToggleEdgeType = (edgeType: EdgeType) => {
    setVisibleEdgeTypes(prev => {
      const next = new Set(prev);
      if (next.has(edgeType)) {
        next.delete(edgeType);
      } else {
        next.add(edgeType);
      }
      return next;
    });
  };

  // Filter data based on visible severities and edge types
  // Also hides edges connected to hidden nodes
  const filteredData = useMemo(() => {
    if (!data) return null;

    // Get set of visible node IDs
    const visibleNodeIds = new Set(
      data.nodes
        .filter(node => {
          const severity = (node.severity || 'default') as SeverityLevel;
          return visibleSeverities.has(severity);
        })
        .map(node => node.id)
    );

    // Filter nodes: keep if severity is visible
    const filteredNodes = data.nodes.filter(node => {
      const severity = (node.severity || 'default') as SeverityLevel;
      return visibleSeverities.has(severity);
    });

    // Filter edges: keep if:
    // 1. Edge type is visible AND
    // 2. Both source and target nodes are visible
    const filteredEdges = data.edges.filter(edge => {
      // Check edge type visibility
      const edgeType = (edge.type || 'default') as EdgeType;
      if (!visibleEdgeTypes.has(edgeType)) {
        return false;
      }
      // Check that both connected nodes are visible
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [data, visibleSeverities, visibleEdgeTypes]);

  // Handle loading state
  if (loading) {
    return <LoadingSpinner colors={colors} />;
  }

  // Handle error state
  if (error) {
    return <ErrorDisplay colors={colors} error={error} />;
  }

  return (
    <div
      className="flex flex-col h-screen font-sans"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <Navbar
        colors={colors}
        theme={theme}
        setTheme={setTheme}
        data={filteredData}
      />

      <div className="flex flex-1 overflow-hidden">
        <div ref={containerRef} className="flex-1 relative">
          {filteredData && (
            <GraphCanvas
              data={filteredData}
              dimensions={dimensions}
              colors={colors}
              effectiveTheme={effectiveTheme}
              onNodeClick={setSelectedNode}
            />
          )}
        </div>

        {/* Right panel: Legend OR NodeDetails */}
        <div 
          className="w-64 border-l flex flex-col" 
          style={{ backgroundColor: colors.panel, borderColor: colors.panelBorder }}
        >
          {selectedNode ? (
            <div className="flex-1 overflow-y-auto">
              <NodeDetails 
                colors={colors} 
                selectedNode={selectedNode} 
                onClose={() => setSelectedNode(null)} 
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <LegendPanel 
                colors={colors}
                visibleSeverities={visibleSeverities}
                visibleEdgeTypes={visibleEdgeTypes}
                onToggleSeverity={handleToggleSeverity}
                onToggleEdgeType={handleToggleEdgeType}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
