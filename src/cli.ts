#!/usr/bin/env node

/**
 * CLI for generating visualizations
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { GraphBuilder } from './graph/builder';
import type { GraphData } from './types';

interface CLIOptions {
  rootDir: string;
  output: string;
  open?: boolean;
}

/**
 * Generate a sample graph for testing
 */
function generateSampleGraph(rootDir: string): GraphData {
  const builder = new GraphBuilder(rootDir);

  // Add some sample nodes
  builder.addNode('src/index.ts', 'entry', 20);
  builder.addNode('src/utils/helper.ts', 'helpers', 12);
  builder.addNode('src/components/App.tsx', 'app', 28);

  // Add some edges
  builder.addEdge('src/index.ts', 'src/components/App.tsx', 'dependency');
  builder.addEdge('src/index.ts', 'src/utils/helper.ts', 'dependency');
  builder.addEdge('src/components/App.tsx', 'src/utils/helper.ts', 'dependency');

  return builder.build();
}

/**
 * Generate HTML with embedded visualization
 */
function generateHTML(graph: GraphData): string {
  const payload = JSON.stringify(graph, null, 2);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AIReady Visualization</title>
    <style>
      html,body { height: 100%; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0 }
      #container { display:flex; height:100vh }
      #panel { width: 320px; padding: 16px; background: #071130; box-shadow: -2px 0 8px rgba(0,0,0,0.3); overflow:auto }
      #canvasWrap { flex:1; display:flex; align-items:center; justify-content:center }
      canvas { background: #0b1220; border-radius:8px }
      .stat { margin-bottom:12px }
    </style>
  </head>
  <body>
    <div id="container">
      <div id="canvasWrap"><canvas id="canvas" width="1200" height="800"></canvas></div>
      <div id="panel">
        <h2>AIReady Visualization</h2>
        <div class="stat"><strong>Files:</strong> <span id="stat-files"></span></div>
        <div class="stat"><strong>Dependencies:</strong> <span id="stat-deps"></span></div>
        <div class="stat"><strong>Legend</strong></div>
        <div style="font-size:13px;line-height:1.3;color:#cbd5e1;margin-top:8px">
          <div style="margin-bottom:8px"><span style="display:inline-block;width:12px;height:12px;background:#ff4d4f;margin-right:8px;border:1px solid rgba(255,255,255,0.06)"></span><strong>Critical</strong>: highest severity issues.</div>
          <div style="margin-bottom:8px"><span style="display:inline-block;width:12px;height:12px;background:#ff9900;margin-right:8px;border:1px solid rgba(255,255,255,0.06)"></span><strong>Major</strong>: important issues.</div>
          <div style="margin-bottom:8px"><span style="display:inline-block;width:12px;height:12px;background:#ffd666;margin-right:8px;border:1px solid rgba(255,255,255,0.06)"></span><strong>Minor</strong>: low priority issues.</div>
          <div style="margin-bottom:8px"><span style="display:inline-block;width:12px;height:12px;background:#91d5ff;margin-right:8px;border:1px solid rgba(255,255,255,0.06)"></span><strong>Info</strong>: informational notes.</div>
          <div style="margin-top:10px;color:#94a3b8"><strong>Node size</strong>: larger = higher token cost, more issues or dependency weight.</div>
          <div style="margin-top:6px;color:#94a3b8"><strong>Proximity</strong>: nodes that are spatially close are more contextually related; relatedness is represented by distance and size rather than explicit edges.</div>
          <div style="margin-top:6px;color:#94a3b8"><strong>Edge colors</strong>: <span style="color:#fb7e81">Similarity</span>, <span style="color:#84c1ff">Dependency</span>, <span style="color:#ffa500">Reference</span>, default <span style="color:#334155">Other</span>.</div>
        </div>
      </div>
    </div>

    <script>
      const graphData = ${payload};
      document.getElementById('stat-files').textContent = graphData.metadata.totalFiles;
      document.getElementById('stat-deps').textContent = graphData.metadata.totalDependencies;

      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      // Simple layout: circle layout
      const nodes = graphData.nodes.map((n, i) => ({
        ...n,
        x: canvas.width/2 + Math.cos(i / graphData.nodes.length * Math.PI * 2) * (Math.min(canvas.width, canvas.height)/3),
        y: canvas.height/2 + Math.sin(i / graphData.nodes.length * Math.PI * 2) * (Math.min(canvas.width, canvas.height)/3),
      }));

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges with type-based styling; related edges are faint and thin
          graphData.edges.forEach(edge => {
          const s = nodes.find(n => n.id === edge.source);
          const t = nodes.find(n => n.id === edge.target);
          if (!s || !t) return;
            // skip rendering 'related' edges as lines to reduce clutter
            if (edge.type === 'related') return;
          if (edge.type === 'similarity') {
            ctx.strokeStyle = '#fb7e81';
            ctx.lineWidth = 1.2;
          } else if (edge.type === 'dependency') {
            ctx.strokeStyle = '#84c1ff';
            ctx.lineWidth = 1.0;
          } else if (edge.type === 'reference') {
            ctx.strokeStyle = '#ffa500';
            ctx.lineWidth = 0.9;
          } else {
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 0.8;
          }
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        });
        // Draw package boundaries (group boxes)
        const groups = {};
        nodes.forEach(n => {
          const g = n.group || '__default';
          if (!groups[g]) groups[g] = { minX: n.x, minY: n.y, maxX: n.x, maxY: n.y };
          groups[g].minX = Math.min(groups[g].minX, n.x);
          groups[g].minY = Math.min(groups[g].minY, n.y);
          groups[g].maxX = Math.max(groups[g].maxX, n.x);
          groups[g].maxY = Math.max(groups[g].maxY, n.y);
        });

        Object.keys(groups).forEach(g => {
          if (g === '__default') return;
          const box = groups[g];
          const pad = 16;
          const x = box.minX - pad;
          const y = box.minY - pad;
          const w = (box.maxX - box.minX) + pad * 2;
          const h = (box.maxY - box.minY) + pad * 2;
          ctx.save();
          ctx.fillStyle = 'rgba(30,64,175,0.04)';
          ctx.strokeStyle = 'rgba(30,64,175,0.12)';
          ctx.lineWidth = 1.2;
          const r = 8;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px sans-serif';
          ctx.fillText(g, x + 8, y + 14);
        });

        // Draw nodes
        nodes.forEach(n => {
            const sizeVal = (n.size || n.value || 1);
            const r = 6 + (sizeVal / 2);
            ctx.beginPath();
            ctx.fillStyle = n.color || '#60a5fa';
            ctx.arc(n.x, n.y, r, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(n.label || n.id.split('/').slice(-1)[0], n.x, n.y + r + 12);
          });
      }

      draw();
    </script>
  </body>
</html>`;
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  
  const options: CLIOptions = {
    rootDir: args[0] || process.cwd(),
    output: args[1] || 'visualization.html',
    open: args.includes('--open'),
  };

  console.log('🎯 AIReady Visualizer');
  console.log(`📁 Root directory: ${options.rootDir}`);
  console.log(`📄 Output file: ${options.output}`);
  console.log();

  // Generate sample graph (TODO: integrate with real analysis)
  console.log('🔨 Building graph...');
  const graph = generateSampleGraph(options.rootDir);

  console.log(`✅ Graph built: ${graph.metadata.totalNodes} nodes, ${graph.metadata.totalEdges} edges`);
  console.log();

  // Generate HTML
  console.log('🎨 Generating visualization...');
  const html = generateHTML(graph);

  // Write to file
  const outputPath = resolve(options.output);
  writeFileSync(outputPath, html);

  console.log(`✅ Visualization saved to: ${outputPath}`);
  console.log();

  if (options.open) {
    console.log('🌐 Opening in browser...');
    const { exec } = await import('child_process');
    const opener = process.platform === 'darwin' ? 'open' :
                   process.platform === 'win32' ? 'start' :
                   'xdg-open';
    exec(`${opener} "${outputPath}"`);
  } else {
    console.log(`💡 Open ${outputPath} in your browser to view the visualization`);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});