import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Types for the visualization
interface FileNode {
  id: string;
  label: string;
  value: number;
  color: string;
  title: string;
  duplicates?: number;
  tokenCost?: number;
  severity?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: FileNode[];
  edges: GraphEdge[];
}

interface PatternIssue {
  fileName: string;
  issues: Array<{ type: string; severity: string; message: string }>;
  metrics: { tokenCost: number; consistencyScore: number };
}

interface Duplicate {
  file1: string;
  file2: string;
  severity: string;
  patternType: string;
}

interface ContextFile {
  file: string;
  tokenCost: number;
  linesOfCode: number;
  dependencyCount: number;
  dependencyList: string[];
  relatedFiles: string[];
  severity: string;
  issues: string[];
}

interface ReportData {
  patterns: PatternIssue[];
  duplicates: Duplicate[];
  context: ContextFile[];
  summary: { totalIssues: number };
}

type Theme = 'dark' | 'light' | 'system';

const severityColors: Record<string, string> = {
  critical: '#ff4d4f',
  major: '#ff9900',
  minor: '#ffd666',
  info: '#91d5ff',
  default: '#97c2fc',
};

const edgeColors: Record<string, string> = {
  similarity: '#fb7e81',
  dependency: '#84c1ff',
  reference: '#ffa500',
  related: '#6b7280',
  default: '#848484',
};

const themeConfig = {
  dark: {
    bg: '#000000',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    panel: '#020617',
    panelBorder: '#1e293b',
    cardBg: '#0f172a',
    cardBorder: '#1e293b',
    grid: 'rgba(30,41,59,0.3)',
  },
  light: {
    bg: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    panel: '#ffffff',
    panelBorder: '#e2e8f0',
    cardBg: '#f8fafc',
    cardBorder: '#e2e8f0',
    grid: 'rgba(203,213,225,0.4)',
  },
};

function getSeverityColor(severity: string | undefined): string {
  if (!severity) return severityColors.default;
  const s = severity.toLowerCase();
  if (s === 'critical') return severityColors.critical;
  if (s === 'major') return severityColors.major;
  if (s === 'minor') return severityColors.minor;
  if (s === 'info') return severityColors.info;
  return severityColors.default;
}

function transformReportToGraph(report: ReportData): GraphData {
  const nodes: FileNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, FileNode>();

  const fileIssues = new Map<string, { count: number; severities: Set<string>; maxSeverity: string }>();
  
  for (const pattern of report.patterns) {
    const issueCount = pattern.issues?.length || 0;
    if (issueCount > 0) {
      let maxSeverity = 'info';
      const severityPriority: Record<string, number> = { critical: 4, major: 3, minor: 2, info: 1 };
      for (const issue of pattern.issues) {
        if ((severityPriority[issue.severity] || 0) > (severityPriority[maxSeverity] || 0)) {
          maxSeverity = issue.severity;
        }
      }
      fileIssues.set(pattern.fileName, { count: issueCount, severities: new Set(), maxSeverity });
    }
  }

  for (const ctx of report.context) {
    const issues = fileIssues.get(ctx.file);
    const severity = issues?.maxSeverity || ctx.severity || 'default';
    const tokenCost = ctx.tokenCost || 0;
    
    const titleLines = [
      `Token Cost: ${tokenCost}`,
      `Lines of Code: ${ctx.linesOfCode}`,
      `Dependencies: ${ctx.dependencyCount}`,
    ];
    
    if (issues) {
      titleLines.push(`Issues: ${issues.count}`);
      titleLines.push(`Severity: ${issues.maxSeverity}`);
    }
    
    if (ctx.issues && ctx.issues.length > 0) {
      titleLines.push('', ...ctx.issues.slice(0, 3));
    }

    const node: FileNode = {
      id: ctx.file,
      label: ctx.file.split('/').pop() || ctx.file,
      value: Math.max(10, Math.sqrt(tokenCost) * 3 + (issues?.count || 0) * 10),
      color: getSeverityColor(severity),
      title: titleLines.join('\n'),
      duplicates: issues?.count,
      tokenCost,
      severity,
    };
    
    nodes.push(node);
    nodeMap.set(ctx.file, node);
  }

  for (const ctx of report.context) {
    for (const dep of ctx.dependencyList || []) {
      if (dep.startsWith('.') || dep.startsWith('/')) {
        const targetFile = [...nodeMap.keys()].find(k => k.endsWith(dep.replace(/^\.\/?/, '')));
        if (targetFile && targetFile !== ctx.file) {
          edges.push({ source: ctx.file, target: targetFile, type: 'dependency' });
        }
      }
    }
    
    for (const related of ctx.relatedFiles || []) {
      if (nodeMap.has(related) && related !== ctx.file) {
        const exists = edges.some(e => (e.source === ctx.file && e.target === related) || (e.source === related && e.target === ctx.file));
        if (!exists) edges.push({ source: ctx.file, target: related, type: 'related' });
      }
    }
  }

  for (const dup of report.duplicates || []) {
    if (nodeMap.has(dup.file1) && nodeMap.has(dup.file2)) {
      const exists = edges.some(e => (e.source === dup.file1 && e.target === dup.file2) || (e.source === dup.file2 && e.target === dup.file1));
      if (!exists) edges.push({ source: dup.file1, target: dup.file2, type: 'similarity' });
    }
  }

  return { nodes: nodes.slice(0, 200), edges: edges.slice(0, 300) };
}

function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const colors = themeConfig[effectiveTheme];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const possiblePaths = ['/report-data.json', '../report-data.json', '../../report-data.json'];
      let reportData: ReportData | null = null;
      for (const path of possiblePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) { reportData = await response.json(); break; }
        } catch { continue; }
      }
      if (!reportData) {
        setError('No scan data found. Run "pnpm aiready scan ." then copy to public/report-data.json');
        setLoading(false);
        return;
      }
      setData(transformReportToGraph(reportData));
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || !data.nodes.length) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    svg.selectAll('*').remove();
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]).on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.edges.map(d => ({ ...d }));
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(d => d.type === 'similarity' ? 80 : d.type === 'related' ? 150 : 100).strength(d => d.type === 'similarity' ? 0.5 : d.type === 'related' ? 0.1 : 0.3))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const link = linkGroup.selectAll('line').data(links).enter().append('line')
      .attr('stroke', d => edgeColors[d.type] || edgeColors.default)
      .attr('stroke-opacity', d => d.type === 'similarity' ? 0.8 : d.type === 'related' ? 0.2 : 0.5)
      .attr('stroke-width', d => d.type === 'similarity' ? 2 : 1);

    const node = nodeGroup.selectAll('g').data(nodes).enter().append('g').attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    node.append('circle').attr('r', d => Math.sqrt(d.value || 10) + 3)
      .attr('fill', d => d.color || severityColors.default)
      .attr('stroke', effectiveTheme === 'dark' ? '#fff' : '#000')
      .attr('stroke-width', 1.5);

    node.append('text').text(d => d.label.split('/').pop() || d.label)
      .attr('x', 0).attr('y', d => Math.sqrt(d.value || 10) + 12)
      .attr('text-anchor', 'middle').attr('fill', effectiveTheme === 'dark' ? '#e2e8f0' : '#1e293b')
      .attr('font-size', '9px').attr('font-family', 'system-ui, sans-serif').attr('pointer-events', 'none');

    node.append('title').text(d => d.title);
    node.on('click', (event, d) => { event.stopPropagation(); setSelectedNode(d); });
    svg.on('click', () => setSelectedNode(null));

    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event: any, d: any) { d.fx = event.x; d.fy = event.y; }
    function dragended(event: any, d: any) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }

    return () => simulation.stop();
  }, [data, dimensions, effectiveTheme]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.text }}></div>
          <p>Loading visualization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="text-center max-w-md p-6">
          <svg className="w-16 h-16 mx-auto text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2 text-amber-400">No Scan Data Found</h2>
          <p className="mb-4" style={{ color: colors.textMuted }}>{error}</p>
          <div className="text-left p-4 rounded-lg text-sm font-mono" style={{ backgroundColor: colors.cardBg }}>
            <p className="text-cyan-400"># Step 1: Run aiready scan</p>
            <p className="mb-2" style={{ color: colors.textMuted }}>pnpm aiready scan . --output json</p>
            <p className="text-cyan-400"># Step 2: Copy to visualizer</p>
            <p style={{ color: colors.textMuted }}>cp .aiready/aiready-scan-*.json packages/visualizer/web/public/report-data.json</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {/* Navbar */}
      <nav className="h-16 backdrop-blur-md border-b flex items-center justify-between px-8 z-50" 
        style={{ backgroundColor: `${colors.panel}ee`, borderColor: colors.panelBorder }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-32">
            <img src="/logo-transparent-bg.png" alt="AIReady" className="h-8 w-auto" />
          </div>
          <div className="h-8 w-px" style={{ backgroundColor: colors.panelBorder }}></div>
          <h1 className="text-base font-medium" style={{ color: colors.textMuted }}>Codebase Visualization</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: colors.textMuted }}>Theme:</span>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: colors.panelBorder }}>
              {(['dark', 'light', 'system'] as Theme[]).map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ backgroundColor: theme === t ? colors.cardBg : 'transparent', color: theme === t ? colors.text : colors.textMuted }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full border text-xs" style={{ backgroundColor: colors.cardBg, borderColor: colors.panelBorder }}>
                <span style={{ color: colors.textMuted }}>Files:</span> <span className="font-semibold text-cyan-400">{data.nodes.length}</span>
              </div>
              <div className="px-4 py-1.5 rounded-full border text-xs" style={{ backgroundColor: colors.cardBg, borderColor: colors.panelBorder }}>
                <span style={{ color: colors.textMuted }}>Connections:</span> <span className="font-semibold text-purple-400">{data.edges.length}</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div ref={containerRef} className="flex-1 relative">
          <div className="absolute inset-0 pointer-events-none z-0"
            style={{ backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
          <svg ref={svgRef} width={dimensions.width || '100%'} height={dimensions.height || '100%'}
            style={{ display: 'block', backgroundColor: 'transparent', zIndex: 10, position: 'relative' }} />
          <div className="absolute bottom-6 left-6">
            <div className="px-4 py-2.5 rounded-lg backdrop-blur-sm border text-xs flex items-center gap-2" 
              style={{ backgroundColor: `${colors.panel}ee`, borderColor: colors.panelBorder, color: colors.textMuted }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              <span>Drag to move • Scroll to zoom • Click for details</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-80 border-l flex flex-col gap-5 overflow-auto p-6" style={{ backgroundColor: colors.panel, borderColor: colors.panelBorder }}>
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: colors.textMuted }}>Severity</h3>
            <div className="space-y-4">
              {Object.entries(severityColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: key !== 'default' ? `0 0 12px ${color}80` : 'none' }} />
                  <span className="text-sm font-medium">{key === 'default' ? 'No Issues' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: colors.textMuted }}>Connections</h3>
            <div className="space-y-4">
              {Object.entries(edgeColors).filter(([k]) => k !== 'default' && k !== 'reference').map(([key, color]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-10 h-1 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>Node Size</h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>Based on token cost + issue count</p>
          </div>

          <div className="flex-1 p-6 rounded-2xl border overflow-auto" style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: colors.textMuted }}>Selected</h3>
            {selectedNode ? (
              <div>
                <div className="mb-5">
                  <h4 className="font-semibold text-base mb-1">{selectedNode.label}</h4>
                  <p className="text-xs break-all" style={{ color: colors.textMuted }}>{selectedNode.id}</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span style={{ color: colors.textMuted }}>Severity:</span>
                    <span className="font-semibold capitalize px-4 py-1.5 rounded-full text-xs" style={{ color: selectedNode.color, backgroundColor: `${selectedNode.color}20` }}>{selectedNode.severity || 'none'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: colors.textMuted }}>Token Cost:</span>
                    <span className="font-semibold text-cyan-400">{selectedNode.tokenCost || 0}</span>
                  </div>
                  {selectedNode.duplicates !== undefined && (
                    <div className="flex justify-between items-center">
                      <span style={{ color: colors.textMuted }}>Issues:</span>
                      <span className="font-semibold text-purple-400">{selectedNode.duplicates}</span>
                    </div>
                  )}
                </div>
                {selectedNode.title && (
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: colors.cardBorder }}>
                    <h5 className="text-sm font-bold mb-3" style={{ color: colors.textMuted }}>Details</h5>
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed" style={{ color: colors.textMuted }}>{selectedNode.title}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: colors.textMuted }}>Click a node to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
