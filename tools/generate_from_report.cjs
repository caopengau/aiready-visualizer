const fs = require('fs');
const path = require('path');

// Allow overriding report and output via CLI: --report <path> --output <path>
const defaultReport = path.resolve(__dirname, '..', '..', '..', 'aiready-improvement-report.json');
const defaultOut = path.resolve(__dirname, '..', 'visualization.html');

let reportPath = defaultReport;
let outPath = defaultOut;

// Simple argument parsing
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--report' && process.argv[i + 1]) {
    reportPath = path.resolve(process.cwd(), process.argv[i + 1]);
    i++;
  } else if ((a === '--output' || a === '-o') && process.argv[i + 1]) {
    outPath = path.resolve(process.cwd(), process.argv[i + 1]);
    i++;
  }
}

function normalizeLabel(filePath) {
  return path.relative(process.cwd(), filePath);
}

function extractReferencedPaths(message) {
  // Capture absolute paths (starting with /) and relative paths
  const reAbs = /\/(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
  const reRel = /(?:\.\/|\.\.\/)(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
  const abs = message.match(reAbs) || [];
  const rel = message.match(reRel) || [];
  return abs.concat(rel);
}

function buildGraph(report) {
  const nodesMap = new Map();
  const edges = [];
  const edgesSet = new Set();
  const fileIssues = new Map(); // id -> { count, maxSeverity, duplicates }

  function rankSeverity(s) {
    if (!s) return null;
    const ss = String(s).toLowerCase();
    if (ss.includes('critical')) return 'critical';
    if (ss.includes('major')) return 'major';
    if (ss.includes('minor')) return 'minor';
    if (ss.includes('info')) return 'info';
    return null;
  }

  function bumpIssue(file, sev) {
    if (!file) return;
    const id = path.resolve(process.cwd(), file);
    if (!fileIssues.has(id)) fileIssues.set(id, { count: 0, maxSeverity: null, duplicates: 0 });
    const rec = fileIssues.get(id);
    rec.count += 1;
    if (sev) {
      const order = { critical: 3, major: 2, minor: 1, info: 0 };
      if (!rec.maxSeverity || order[sev] > order[rec.maxSeverity]) rec.maxSeverity = sev;
    }
  }

  function getPackageGroup(fp) {
    if (!fp) return null;
    const parts = fp.split(path.sep);
    const pkgIdx = parts.indexOf('packages');
    if (pkgIdx >= 0 && parts.length > pkgIdx + 1) return `packages/${parts[pkgIdx+1]}`;
    const landingIdx = parts.indexOf('landing');
    if (landingIdx >= 0) return 'landing';
    const scriptsIdx = parts.indexOf('scripts');
    if (scriptsIdx >= 0) return 'scripts';
    return parts.length > 1 ? parts[1] : parts[0];
  }

  function addNode(file, title = '', value = 1) {
    if (!file) return;
    if (!nodesMap.has(file)) {
      nodesMap.set(file, {
        id: file,
        label: normalizeLabel(file),
        title,
        value: value || 1
      });
    } else {
      const node = nodesMap.get(file);
      if (title && !node.title.includes(title)) {
        node.title = (node.title ? node.title + '\n' : '') + title;
      }
      if (value > node.value) node.value = value;
    }
  }

  function addEdge(from, to, type = 'link') {
    if (!from || !to || from === to) return;
    const key = from + '->' + to;
    if (!edgesSet.has(key)) {
      edges.push({ from, to, type });
      edgesSet.add(key);
    }
  }

  // Pre-scan for common basenames for fuzzy matching
  const basenameMap = new Map();
  (report.patterns || []).forEach((p) => {
    const base = path.basename(p.fileName);
    if (!basenameMap.has(base)) basenameMap.set(base, new Set());
    basenameMap.get(base).add(p.fileName);
  });

  // 1. Process patterns (nodes and issues)
  (report.patterns || []).forEach((entry) => {
    const file = entry.fileName;
    addNode(file, `Issues: ${entry.issues.length}`, (entry.metrics && entry.metrics.tokenCost) || 5);

    (entry.issues || []).forEach((issue) => {
      const message = issue.message || '';
      // record issue severity/count for coloring
      const sev = rankSeverity(issue.severity || issue.severityLevel || null);
      bumpIssue(file, sev);
      
      // Path extraction
      const refs = extractReferencedPaths(message);
      refs.forEach((ref) => {
        let target = ref;
        if (!path.isAbsolute(ref)) {
          target = path.resolve(path.dirname(file), ref);
        }
        addNode(target, 'Referenced file', 5);
        addEdge(file, target, 'reference');
      });

      // Fuzzy matching
      const percMatch = (message.match(/(\d+)%/) || [])[1];
      const perc = percMatch ? parseInt(percMatch, 10) : null;
      const wantFuzzy = issue.type === 'duplicate-pattern' || /similar/i.test(message) || (perc && perc >= 50);
      if (wantFuzzy) {
        const fileGroup = getPackageGroup(file);
        for (const [base, pathsSet] of basenameMap.entries()) {
          if (!message.includes(base) || base === path.basename(file)) continue;
          for (const target of pathsSet) {
            const targetGroup = getPackageGroup(target);
            if (fileGroup !== targetGroup && !(perc && perc >= 80)) continue;
            addNode(target, 'Fuzzy match', 5);
            addEdge(file, target, 'similarity');
          }
        }
      }
    });
  });

  // 2. Process duplicates (explicit links)
  (report.duplicates || []).forEach((dup) => {
    addNode(dup.file1, 'Similarity target', 5);
    addNode(dup.file2, 'Similarity target', 5);
    addEdge(dup.file1, dup.file2, 'similarity');
    const f1 = path.resolve(process.cwd(), dup.file1);
    const f2 = path.resolve(process.cwd(), dup.file2);
    if (!fileIssues.has(f1)) fileIssues.set(f1, { count: 0, maxSeverity: null, duplicates: 0 });
    if (!fileIssues.has(f2)) fileIssues.set(f2, { count: 0, maxSeverity: null, duplicates: 0 });
    fileIssues.get(f1).duplicates += 1;
    fileIssues.get(f2).duplicates += 1;
  });

  // 3. Process context (dependencies and related files)
  (report.context || []).forEach((ctx) => {
    const file = ctx.file;
    addNode(file, `Deps: ${ctx.dependencyCount}`, 10);

    // Link related files (no hard cap; skip duplicate edges)
    (ctx.relatedFiles || []).forEach((rel) => {
      const resolvedRel = path.isAbsolute(rel) ? rel : path.resolve(path.dirname(file), rel);
      if (edgesSet.has(file + '->' + resolvedRel) || edgesSet.has(resolvedRel + '->' + file)) return;
      // Don't add visual edges for 'related' files to reduce clutter and keep the
      // network interactive. Instead, make the related node slightly more
      // prominent so the layout reflects the contextual proximity.
      addNode(resolvedRel, 'Related file', 5);
      const relNode = nodesMap.get(resolvedRel);
      if (relNode) relNode.value = (relNode.value || 1) + 2;
    });

    // context-level issues
    if (ctx.issues && Array.isArray(ctx.issues)) {
      ctx.issues.forEach((issue) => {
        const sev = rankSeverity(issue.severity || issue.severityLevel || null);
        bumpIssue(file, sev);
      });
    }

    // Link dependencies if they resolve to local files
    const fileDir = path.dirname(file);
    (ctx.dependencyList || []).forEach((dep) => {
      if (dep.startsWith('.')) {
        const possiblePaths = [
          path.resolve(fileDir, dep),
          path.resolve(fileDir, dep + '.ts'),
          path.resolve(fileDir, dep + '.tsx'),
          path.resolve(fileDir, dep + '.js'),
          path.resolve(fileDir, dep + '/index.ts'),
          path.resolve(fileDir, dep + '/index.tsx'),
        ];
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            addNode(p, 'Dependency', 2);
            addEdge(file, p, 'dependency');
            break;
          }
        }
      }
    });
  });

  // finalize node colors based on collected fileIssues
  const colorFor = (sev) => {
    switch (sev) {
      case 'critical': return '#ff4d4f';
      case 'major': return '#ff9900';
      case 'minor': return '#ffd666';
      case 'info': return '#91d5ff';
      default: return '#97c2fc';
    }
  };

  const nodes = Array.from(nodesMap.values()).map(n => {
    const id = path.resolve(process.cwd(), n.id || n.label);
    const rec = fileIssues.get(id);
    return Object.assign({}, n, { color: rec ? colorFor(rec.maxSeverity) : colorFor(null), duplicates: rec ? rec.duplicates : 0 });
  });

  return { nodes, edges };
}

function renderHtml(graph) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AIReady Visualization</title>
    <style>
      html,body,#network { height: 100%; margin: 0; padding: 0 }
      #sidebar { position: absolute; right: 0; top: 0; width: 320px; height: 100%; background: #fff; border-left: 1px solid #ddd; overflow:auto; }
      #graph { position: absolute; left: 0; top: 0; right: 320px; bottom: 0; }
      pre { white-space: pre-wrap; word-break: break-word }
    </style>
    <link href="https://unpkg.com/vis-network/styles/vis-network.min.css" rel="stylesheet" />
    <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  </head>
  <body>
    <div id="graph"><div id="network"></div></div>
    <div id="sidebar">
      <h3 style="margin:12px">Details</h3>
      <div id="legend" style="padding:12px">
        <h4 style="margin:8px 0">Legend</h4>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:#222">
          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#ff4d4f;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Critical</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Files with critical issues (highest severity). These are high-priority hotspots that may block AI-assisted work or cause incorrect outputs.</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#ff9900;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Major</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Files with major issues requiring attention; likely to affect model performance or developer productivity.</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#ffd666;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Minor</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Files with minor issues or informational findings—worth fixing but lower priority.</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#91d5ff;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Info</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Informational notes or low-severity findings.</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#97c2fc;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Default</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Files with no recorded issues (default color).</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#fb7e81;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Similarity (edge)</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Semantic similarity or duplicate links between files.</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#84c1ff;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Dependency (edge)</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Static import relationships (actual code imports).</div>
          </div>

          <div>
            <span style="display:inline-block;width:12px;height:12px;background:#ffa500;margin-right:8px;border:1px solid #ccc;vertical-align:middle"></span>
            <strong>Reference (edge)</strong>
            <div style="margin-left:20px;color:#555;font-size:12px">Explicit references discovered inside issue messages.</div>
          </div>
        </div>

        <div style="margin-top:10px;font-size:12px;color:#444">
          <div><strong>Node color</strong>: shows the highest-severity issue present on the file (Critical → Major → Minor → Info → Default).</div>
          <div style="margin-top:6px"><strong>Node size</strong>: larger nodes indicate higher importance (token cost, number of issues, or dependency weight).</div>
          <div style="margin-top:6px"><strong>Node distance / proximity</strong>: spatial closeness reflects contextual relatedness — similar or related files will be pulled closer during layout; we do not draw explicit 'related' edges to avoid clutter.</div>
          <div style="margin-top:6px"><strong>Edge color & length</strong>: edge color shows relationship type (similarity/dependency/reference). Similarity edges are shorter to pull nodes together; dependency/reference edges are longer to show coupling.</div>
          <div style="margin-top:6px;color:#666;font-size:11px">Interaction: click a node to view details; use the color and size cues to prioritize what to inspect first.</div>
        </div>
      </div>
      <div id="details" style="padding:12px">Click a node to see details</div>
    </div>

    <script>
      const data = ${JSON.stringify(graph)};
      const nodes = new vis.DataSet(data.nodes.map(n => ({ id: n.id, label: n.label, title: n.title, value: n.value || n.size, color: n.color })));

      // Build edge items with ids and meta type
      const edgeItems = data.edges.map((e, i) => {
        let color = '#848484';
        let item = { id: i, from: e.from, to: e.to, metaType: e.type };
        if (e.type === 'similarity') { color = '#fb7e81'; item.length = 100; item.color = { color }; }
        else if (e.type === 'dependency') { color = '#84c1ff'; item.length = 300; item.color = { color }; }
        else if (e.type === 'reference') { color = '#ffa500'; item.length = 300; item.color = { color }; }
        else { item.length = 300; item.color = { color }; }
        return item;
      });

      const edges = new vis.DataSet(edgeItems);

      const container = document.getElementById('network');
      const network = new vis.Network(container, { nodes, edges }, {
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -150,
            centralGravity: 0.01,
            springLength: 100,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 1
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 100,
            onlyDynamicEdges: false,
            fit: true
          },
          adaptiveTimestep: true
        },
        manipulation: false,
        nodes: { shape: 'dot', scaling: { min: 5, max: 50 }, font: { size: 12 } },
        edges: { 
          smooth: { type: 'continuous', roundness: 0.5 },
          arrows: { to: { enabled: true, scaleFactor: 0.5 } }
        }
      });

      // Stop physics after stabilization to handle large graphs
      network.on("stabilizationIterationsDone", function () {
        network.setOptions({ physics: false });
      });

      network.on('click', function(params) {
        if (params.nodes && params.nodes.length) {
          const id = params.nodes[0];
          const node = nodes.get(id);
          document.getElementById('details').innerHTML = '<strong>' + node.label + '</strong><br/><pre>' + node.title + '</pre><br/><code>' + id + '</code>';
        }
      });

      // basic stats
      const stats = document.createElement('div');
      stats.style.padding = '12px';
      stats.innerHTML = '<hr><b>Nodes:</b> ' + nodes.length + '<br><b>Edges:</b> ' + edges.length;
      document.getElementById('sidebar').appendChild(stats);
    </script>
  </body>
</html>`;
}

function main() {
  if (!fs.existsSync(reportPath)) {
    console.error('Report not found at', reportPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(reportPath, 'utf8');
  const report = JSON.parse(raw);
  const graph = buildGraph(report);
  const html = renderHtml(graph);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Wrote visualization to', outPath);
}

main();
