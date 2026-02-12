import 'regenerator-runtime/runtime';
import './style.css';
async function loadReport() {
    try {
        const res = await fetch('/report-data.json');
        if (!res.ok)
            throw new Error('Report not found');
        return await res.json();
    }
    catch (e) {
        console.error('Failed to load report', e);
        return null;
    }
}
function renderPlaceholder() {
    const root = document.getElementById('app');
    root.innerHTML = `<div style="padding:24px;color:#333">Loading visualization...</div>`;
}
function renderGraph(graph) {
    const root = document.getElementById('app');
    root.innerHTML = '';
    const container = document.createElement('div');
    container.style.height = '100vh';
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    const graphWrap = document.createElement('div');
    graphWrap.style.flex = '1';
    graphWrap.style.position = 'relative';
    const networkDiv = document.createElement('div');
    networkDiv.id = 'network';
    networkDiv.style.width = '100%';
    networkDiv.style.height = '100%';
    graphWrap.appendChild(networkDiv);
    const panel = document.createElement('div');
    panel.style.width = '320px';
    panel.style.background = '#f7f7f8';
    panel.style.padding = '12px';
    panel.innerHTML = `<h3>Visualizer (dev)</h3><div id="stats"></div>`;
    container.appendChild(graphWrap);
    container.appendChild(panel);
    root.appendChild(container);
    // load vis-network dynamically from CDN to keep deps minimal
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
    script.onload = () => {
        // @ts-ignore
        const vis = window['vis'];
        const nodes = new vis.DataSet(graph.nodes.map(n => ({ id: n.id, label: n.label, title: n.title, value: n.value || n.size, color: n.color, group: n.group })));
        const edges = new vis.DataSet(graph.edges.map((e, i) => {
            let color = '#848484';
            const item = { id: i, from: e.source, to: e.target, metaType: e.type };
            if (e.type === 'similarity') {
                color = '#fb7e81';
                item.length = 100;
                item.color = { color };
            }
            else if (e.type === 'dependency') {
                color = '#84c1ff';
                item.length = 300;
                item.color = { color };
            }
            else if (e.type === 'reference') {
                color = '#ffa500';
                item.length = 300;
                item.color = { color };
            }
            else {
                item.length = 300;
                item.color = { color };
            }
            return item;
        }));
        const containerEl = document.getElementById('network');
        const network = new vis.Network(containerEl, { nodes, edges }, {
            physics: { solver: 'forceAtlas2Based', stabilization: { iterations: 500 } },
            nodes: { shape: 'dot' }
        });
        document.getElementById('stats').innerHTML = `<div><strong>Files:</strong> ${graph.metadata.totalFiles}</div><div><strong>Deps:</strong> ${graph.metadata.totalDependencies}</div>`;
    };
    document.head.appendChild(script);
}
renderPlaceholder();
async function boot() {
    const report = await loadReport();
    if (!report) {
        return;
    }
    // If GraphBuilder exists in window (not in dev), otherwise use report as graph
    renderGraph(report);
}
boot();
// Simple hot-reload on file change via Vite HMR (full reload)
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        boot();
    });
}
