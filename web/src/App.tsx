import { useState, useEffect, useMemo, useRef } from 'react';
import { ForceDirectedGraph } from '@aiready/components';
import type { GraphNode, GraphLink, ForceDirectedGraphHandle } from '@aiready/components/charts/ForceDirectedGraph';

type NodeKind = 'file' | 'package';

type NodeMeta = GraphNode & {
  kind: NodeKind;
  severity?: 'critical' | 'major' | 'minor' | 'info';
  issueCount?: number;
  tokenCost?: number;
  duplicates?: number;
  packageGroup?: string;
  dependencyCount?: number;
  filePath?: string;
  filesInPackage?: number;
};

type LinkMeta = GraphLink & { type?: 'dependency' | 'similarity' | 'reference' | 'related' | 'package' };

// Runtime state (will be populated from report-data.json)
const sampleNodes: NodeMeta[] = [];
const sampleLinks: LinkMeta[] = [];

export default function App() {
  const [selectedNode, setSelectedNode] = useState<NodeMeta | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeMeta | null>(null);
  const [nodes, setNodes] = useState<NodeMeta[]>(sampleNodes);
  const [links, setLinks] = useState<LinkMeta[]>(sampleLinks);
  const [metadata, setMetadata] = useState({
    totalFiles: 0,
    totalDependencies: 0,
    totalPackages: 0,
    criticalIssues: 0,
    majorIssues: 0,
    minorIssues: 0,
    infoIssues: 0,
  });
  const [dragEnabled, setDragEnabled] = useState(true);
  const [manualLayoutMode, setManualLayoutMode] = useState(false);
  const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set());
  const graphRef = useRef<ForceDirectedGraphHandle>(null);

  const styledLinks = useMemo(() => {
    const styles: Record<NonNullable<LinkMeta['type']>, { color: string; width: number }> = {
      dependency: { color: '#2563eb', width: 1.4 },
      similarity: { color: '#a855f7', width: 1.2 },
      reference: { color: '#22c55e', width: 1 },
      related: { color: '#cbd5f5', width: 0.8 },
      package: { color: '#94a3b8', width: 0.9 },
    };
    return links.map((link) => {
      const type = link.type || 'reference';
      return { ...link, color: styles[type].color, width: styles[type].width };
    });
  }, [links]);

  useEffect(() => {
    let mounted = true;
    async function fetchWithTimeout(url: string, ms = 2000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    }

    async function loadReport() {
      try {
        const params = new URLSearchParams(window.location.search);
        const qReport = params.get('report');

        const candidates: string[] = [];
        if (qReport) candidates.push(qReport);
        candidates.push(
          '/report-data.json',
          '/aiready-improvement-report.json',
          '/.aiready/aiready-improvement-report.json',
          '/.aiready/report.json',
          '/report.json',
          '../aiready-improvement-report.json',
          '../../aiready-improvement-report.json'
        );

        let report: any = null;
        for (const p of candidates) {
          report = await fetchWithTimeout(p, 1500);
          if (report) {
            console.log('Loaded report from', p);
            break;
          }
        }
        if (!report) return;

        const fileMap = new Map<string, NodeMeta>();
        const packageMap = new Map<string, NodeMeta>();
        const packageColors = new Map<string, string>();
        const severityRank: Record<string, number> = { critical: 4, major: 3, minor: 2, info: 1 };
        const severityColor: Record<string, string> = {
          critical: '#ef4444',
          major: '#f97316',
          minor: '#f59e0b',
          info: '#60a5fa',
        };
        const packagePalette = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#14b8a6', '#f43f5e'];
        const issueTotals = { critical: 0, major: 0, minor: 0, info: 0 };

        const getPackageGroup = (filePath: string) => {
          const parts = filePath.split('/').filter(Boolean);
          const pkgIdx = parts.indexOf('packages');
          if (pkgIdx >= 0 && parts[pkgIdx + 1]) return `packages/${parts[pkgIdx + 1]}`;
          const landingIdx = parts.indexOf('landing');
          if (landingIdx >= 0) return 'landing';
          if (parts.length > 1) return parts[0];
          return parts[0] || 'root';
        };

        const shortLabel = (filePath: string) => {
          const parts = filePath.split('/').filter(Boolean);
          return parts.slice(-2).join('/');
        };

        const resolveRelative = (baseFile: string, rel: string) => {
          if (rel.startsWith('/')) return rel;
          const baseParts = baseFile.split('/').filter(Boolean);
          baseParts.pop();
          const relParts = rel.split('/').filter(Boolean);
          const combined = [...baseParts];
          for (const part of relParts) {
            if (part === '.') continue;
            if (part === '..') combined.pop();
            else combined.push(part);
          }
          return combined.join('/');
        };

        const ensureFileNode = (filePath: string) => {
          const id = String(filePath);
          if (!fileMap.has(id)) {
            const group = getPackageGroup(id);
            const node: NodeMeta = {
              id,
              label: shortLabel(id),
              color: severityColor.info,
              size: 10,
              kind: 'file',
              packageGroup: group,
              filePath: id,
              issueCount: 0,
              tokenCost: 0,
              duplicates: 0,
              dependencyCount: 0,
            };
            fileMap.set(id, node);
          }
          return fileMap.get(id)!;
        };

        const ensurePackageNode = (group: string) => {
          if (!packageColors.has(group)) {
            packageColors.set(group, packagePalette[packageColors.size % packagePalette.length]);
          }
          if (!packageMap.has(group)) {
            packageMap.set(group, {
              id: `pkg:${group}`,
              label: group,
              color: packageColors.get(group)!,
              size: 26,
              kind: 'package',
              packageGroup: group,
              filesInPackage: 0,
            });
          }
          return packageMap.get(group)!;
        };

        const patterns = report.patterns || [];
        for (const p of patterns) {
          const id = String(p.fileName);
          const issues = Array.isArray(p.issues) ? p.issues : [];
          const node = ensureFileNode(id);
          node.issueCount = issues.length;

          let top: 'critical' | 'major' | 'minor' | 'info' = 'info';
          for (const it of issues) {
            const s = String(it.severity || 'info').toLowerCase();
            if (severityRank[s] > severityRank[top]) top = s as typeof top;
          }
          node.severity = top;
          node.color = severityColor[top] || severityColor.info;

          const tokenCost = (p.metrics && p.metrics.tokenCost) || 0;
          node.tokenCost = tokenCost;
          node.size = Math.round(10 + Math.min(42, Math.log(Math.max(1, tokenCost)) * 6 + issues.length * 2));

          issueTotals[top] += issues.length;
        }

        const builtLinks: LinkMeta[] = [];
        const linkKey = new Set<string>();
        const pushLink = (source: string, target: string, type: LinkMeta['type']) => {
          if (!source || !target || source === target) return;
          const key = `${source}=>${target}:${type}`;
          if (linkKey.has(key)) return;
          linkKey.add(key);
          builtLinks.push({ source, target, type });
        };

        const pathRegexAbs = /\/(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
        const pathRegexRel = /(?:\.\/|\.\.\/)(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;

        for (const p of patterns) {
          const source = String(p.fileName);
          const issues = Array.isArray(p.issues) ? p.issues : [];
          for (const it of issues) {
            const msg = String(it.message || '');
            const absRefs = msg.match(pathRegexAbs) || [];
            const relRefs = msg.match(pathRegexRel) || [];
            for (const ref of [...absRefs, ...relRefs]) {
              const targetPath = ref.startsWith('/') ? ref : resolveRelative(source, ref);
              ensureFileNode(targetPath);
              pushLink(source, targetPath, 'reference');
            }
          }
        }

        const duplicates = report.duplicates || [];
        for (const dup of duplicates) {
          const a = String(dup.file1 || '');
          const b = String(dup.file2 || '');
          if (!a || !b) continue;
          ensureFileNode(a).duplicates = (ensureFileNode(a).duplicates || 0) + 1;
          ensureFileNode(b).duplicates = (ensureFileNode(b).duplicates || 0) + 1;
          pushLink(a, b, 'similarity');
        }

        const context = report.context || [];
        const fileExt = /\.(ts|tsx|js|jsx|py|java|go|json|md)$/i;
        for (const ctx of context) {
          const file = String(ctx.file || '');
          if (!file) continue;
          const node = ensureFileNode(file);
          const depList = Array.isArray(ctx.dependencyList) ? ctx.dependencyList : [];
          node.dependencyCount = depList.length;
          const relatedFiles = Array.isArray(ctx.relatedFiles) ? ctx.relatedFiles : [];

          for (const dep of depList) {
            if (typeof dep !== 'string') continue;
            if (!dep.startsWith('.') && !fileExt.test(dep)) continue;
            const targetPath = dep.startsWith('.') ? resolveRelative(file, dep) : dep;
            ensureFileNode(targetPath);
            pushLink(file, targetPath, 'dependency');
          }

          relatedFiles.slice(0, 4).forEach((rel: string) => {
            if (!rel || typeof rel !== 'string') return;
            const targetPath = rel.startsWith('.') ? resolveRelative(file, rel) : rel;
            ensureFileNode(targetPath);
            pushLink(file, targetPath, 'related');
          });
        }

        // Fallback: if no nodes found from patterns, try context or consistency arrays
        if (fileMap.size === 0) {
          const fallbacks = (report.context || []).concat(report.consistency?.results || []);
          for (const item of fallbacks) {
            const id = String(item.file || item.fileName || item.path || 'unknown');
            ensureFileNode(id);
          }
        }

        // Package boundary nodes
        for (const node of fileMap.values()) {
          const group = node.packageGroup || getPackageGroup(node.id);
          const pkgNode = ensurePackageNode(group);
          pkgNode.filesInPackage = (pkgNode.filesInPackage || 0) + 1;
          pushLink(node.id, pkgNode.id, 'package');
        }

        const nodeList = [...fileMap.values(), ...packageMap.values()];
        const linkList = builtLinks;
        const dependencyCount = linkList.filter((l) => l.type === 'dependency').length;

        if (!mounted) return;
        setNodes(nodeList);
        setLinks(linkList);
        setMetadata({
          totalFiles: fileMap.size,
          totalDependencies: dependencyCount,
          totalPackages: packageMap.size,
          criticalIssues: issueTotals.critical,
          majorIssues: issueTotals.major,
          minorIssues: issueTotals.minor,
          infoIssues: issueTotals.info,
        });
      } catch (e) {
        // ignore and keep sample data
      }
    }
    loadReport();
    return () => { mounted = false; };
  }, []);

  // Graph control handlers
  const handleDragToggle = (enabled: boolean) => {
    setDragEnabled(enabled);
  };

  const handleManualLayoutToggle = (enabled: boolean) => {
    setManualLayoutMode(enabled);
  };

  const handlePinAll = () => {
    graphRef.current?.pinAll();
    setPinnedNodeIds(new Set(nodes.map(n => n.id)));
  };

  const handleUnpinAll = () => {
    graphRef.current?.unpinAll();
    setPinnedNodeIds(new Set());
  };

  const handleReset = () => {
    graphRef.current?.resetLayout();
    setPinnedNodeIds(new Set());
  };

  const handleFitView = () => {
    graphRef.current?.fitView();
  };

  const headerStyle: React.CSSProperties = { background: '#111827', color: '#fff', padding: 16, boxShadow: '0 2px 6px rgba(15,23,42,0.2)' };
  const titleStyle: React.CSSProperties = { margin: 0, fontSize: 20 };
  const subStyle: React.CSSProperties = { marginTop: 4, color: '#9CA3AF', fontSize: 13 };

  const layoutStyle: React.CSSProperties = { display: 'flex', flex: 1, overflow: 'hidden' };
  const mainStyle: React.CSSProperties = { flex: 1, position: 'relative' };
  const asideStyle: React.CSSProperties = { width: 320, background: '#ffffff', borderLeft: '1px solid #e6e9ef', padding: 16, overflow: 'auto' };
  const headerContentStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 };
  const headerLeftStyle: React.CSSProperties = { flex: 1 };
  const headerControlsStyle: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' };

  return (
    <div className="app-root">
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={headerLeftStyle}>
            <h1 style={titleStyle}>AIReady Visualizer</h1>
            <p style={subStyle}>Interactive Dependency Graph</p>
          </div>
          
          <div style={headerControlsStyle}>
            <button
              onClick={() => handleDragToggle(!dragEnabled)}
              style={{
                padding: '8px 12px',
                background: dragEnabled ? '#3b82f6' : '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              title={dragEnabled ? 'Drag enabled' : 'Drag disabled'}
            >
              ✋ Drag {dragEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => handleManualLayoutToggle(!manualLayoutMode)}
              style={{
                padding: '8px 12px',
                background: manualLayoutMode ? '#3b82f6' : '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              title={manualLayoutMode ? 'Manual layout: ON' : 'Manual layout: OFF'}
            >
              🔧 Manual {manualLayoutMode ? 'ON' : 'OFF'}
            </button>

            <div style={{ width: '1px', height: '24px', background: '#4b5563' }} />

            <button
              onClick={handlePinAll}
              disabled={nodes.length === 0}
              style={{
                padding: '8px 12px',
                background: '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                transition: 'background 0.2s',
                opacity: nodes.length === 0 ? 0.5 : 1,
              }}
              title={`Pin all nodes (${nodes.length})`}
            >
              📌 Pin All
            </button>

            <button
              onClick={handleUnpinAll}
              disabled={pinnedNodeIds.size === 0}
              style={{
                padding: '8px 12px',
                background: '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: pinnedNodeIds.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                transition: 'background 0.2s',
                opacity: pinnedNodeIds.size === 0 ? 0.5 : 1,
              }}
              title={`Unpin all (${pinnedNodeIds.size} pinned)`}
            >
              📍 Unpin
            </button>

            <div style={{ width: '1px', height: '24px', background: '#4b5563' }} />

            <button
              onClick={handleFitView}
              disabled={nodes.length === 0}
              style={{
                padding: '8px 12px',
                background: '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                transition: 'background 0.2s',
                opacity: nodes.length === 0 ? 0.5 : 1,
              }}
              title="Fit all nodes in view"
            >
              🎯 Fit
            </button>

            <button
              onClick={handleReset}
              disabled={nodes.length === 0}
              style={{
                padding: '8px 12px',
                background: '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                transition: 'background 0.2s',
                opacity: nodes.length === 0 ? 0.5 : 1,
              }}
              title="Reset to auto-layout"
            >
              ↺ Reset
            </button>

            <div style={{ padding: '0 8px', fontSize: '12px', color: '#9ca3af', minWidth: '80px', textAlign: 'right' }}>
              <div>{nodes.length} nodes</div>
              {pinnedNodeIds.size > 0 && <div style={{ fontSize: '10px', color: '#60a5fa' }}>{pinnedNodeIds.size} pinned</div>}
            </div>
          </div>
        </div>
      </header>

      <div style={layoutStyle}>
        <main style={mainStyle}>
            <div className="graph-canvas">
            <ForceDirectedGraph
              ref={graphRef}
              nodes={nodes}
              links={styledLinks}
              width={Math.max(400, window.innerWidth - 360)}
              height={Math.max(300, window.innerHeight - 120)}
              simulationOptions={{ linkDistance: 90, chargeStrength: -260, collisionRadius: 14, centerStrength: 0.08 }}
              enableDrag={dragEnabled}
              onNodeClick={(node) => setSelectedNode(node)}
              onNodeHover={(node) => setHoveredNode(node)}
              selectedNodeId={selectedNode?.id}
              hoveredNodeId={hoveredNode?.id}
              showNodeLabels={true}
              manualLayout={manualLayoutMode}
              onManualLayoutChange={setManualLayoutMode}
            />
          </div>
        </main>

        <aside style={asideStyle}>
          <div className="details">
            <h2>Details</h2>

            {selectedNode ? (
              <div>
                <div>
                  <h3 style={{ margin: '6px 0 4px' }}>Selected Node</h3>
                  <p style={{ margin: 0, color: '#4b5563' }}>{selectedNode.label}</p>
                </div>
                <div style={{ marginTop: 12 }}>
                  <h3 style={{ margin: '6px 0 4px' }}>Node ID</h3>
                  <p style={{ margin: 0, color: '#4b5563', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>{selectedNode.id}</p>
                </div>
                {selectedNode.kind === 'file' && (
                  <div style={{ marginTop: 12 }}>
                    <h3 style={{ margin: '6px 0 4px' }}>Package</h3>
                    <p style={{ margin: 0, color: '#4b5563' }}>{selectedNode.packageGroup || 'root'}</p>
                  </div>
                )}
                {selectedNode.color && (
                  <div style={{ marginTop: 12 }}>
                    <h3 style={{ margin: '6px 0 4px' }}>Color</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #e5e7eb', backgroundColor: selectedNode.color }} />
                      <span style={{ color: '#4b5563', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>{selectedNode.color}</span>
                    </div>
                  </div>
                )}
                {selectedNode.kind === 'file' && (
                  <div style={{ marginTop: 12 }}>
                    <h3 style={{ margin: '6px 0 4px' }}>Metrics</h3>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Severity</span>
                        <span style={{ fontWeight: 600 }}>{selectedNode.severity || 'info'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Issues</span>
                        <span style={{ fontWeight: 600 }}>{selectedNode.issueCount || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Duplicates</span>
                        <span style={{ fontWeight: 600 }}>{selectedNode.duplicates || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Token Cost</span>
                        <span style={{ fontWeight: 600 }}>{selectedNode.tokenCost || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Dependencies</span>
                        <span style={{ fontWeight: 600 }}>{selectedNode.dependencyCount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
                {selectedNode.kind === 'package' && (
                  <div style={{ marginTop: 12 }}>
                    <h3 style={{ margin: '6px 0 4px' }}>Package Scope</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Files</span>
                      <span style={{ fontWeight: 600 }}>{selectedNode.filesInPackage || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : hoveredNode ? (
              <div>
                <div>
                  <h3 style={{ margin: '6px 0 4px' }}>Hovered Node</h3>
                  <p style={{ margin: 0, color: '#4b5563' }}>{hoveredNode.label}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>Click on a node to see details</p>
            )}

            <div className="legend">
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>Legend</h3>
              <div className="legend-section">
                <div className="legend-title">Severity (Node Color)</div>
                <div className="legend-row"><span className="legend-swatch" style={{ background: '#ef4444' }} />Critical</div>
                <div className="legend-row"><span className="legend-swatch" style={{ background: '#f97316' }} />Major</div>
                <div className="legend-row"><span className="legend-swatch" style={{ background: '#f59e0b' }} />Minor</div>
                <div className="legend-row"><span className="legend-swatch" style={{ background: '#60a5fa' }} />Info</div>
              </div>
              <div className="legend-section">
                <div className="legend-title">Edges</div>
                <div className="legend-row"><span className="legend-line" style={{ background: '#2563eb' }} />Dependency</div>
                <div className="legend-row"><span className="legend-line" style={{ background: '#a855f7' }} />Similarity</div>
                <div className="legend-row"><span className="legend-line" style={{ background: '#22c55e' }} />Reference</div>
                <div className="legend-row"><span className="legend-line" style={{ background: '#94a3b8' }} />Package Boundary</div>
                <div className="legend-row"><span className="legend-line" style={{ background: '#cbd5f5' }} />Related</div>
              </div>
              <div className="legend-section">
                <div className="legend-title">Node Size</div>
                <div className="legend-row">Token cost + issue count</div>
              </div>
            </div>

            <div className="stats">
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>Graph Stats</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ color: '#6b7280' }}>Nodes:</div>
                  <div style={{ fontWeight: 600 }}>{nodes.length}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#6b7280' }}>Links:</div>
                  <div style={{ fontWeight: 600 }}>{links.length}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <div style={{ color: '#6b7280' }}>Packages:</div>
                <div style={{ fontWeight: 600 }}>{metadata.totalPackages}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Issues</div>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Critical</span>
                    <span>{metadata.criticalIssues}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Major</span>
                    <span>{metadata.majorIssues}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Minor</span>
                    <span>{metadata.minorIssues}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Info</span>
                    <span>{metadata.infoIssues}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}