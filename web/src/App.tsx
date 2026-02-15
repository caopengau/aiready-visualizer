import { useEffect, useState } from 'react';
import { GraphData, FileNode } from './types';
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

function App() {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        data={data}
      />

      <div className="flex flex-1 overflow-hidden">
        <div ref={containerRef} className="flex-1 relative">
          {data && (
            <GraphCanvas
              data={data}
              dimensions={dimensions}
              colors={colors}
              effectiveTheme={effectiveTheme}
              onNodeClick={setSelectedNode}
            />
          )}
        </div>

        {/* Right panel: Legend OR NodeDetails */}
        <div className="w-64 border-l flex flex-col overflow-hidden" style={{ backgroundColor: colors.panel, borderColor: colors.panelBorder }}>
          <div className="flex-1 overflow-y-auto">
            {selectedNode ? (
              <NodeDetails colors={colors} selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />
            ) : (
              <LegendPanel colors={colors} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
