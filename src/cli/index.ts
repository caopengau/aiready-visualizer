#!/usr/bin/env node

/**
 * CLI for AIReady Visualizer
 * 
 * Usage:
 *   aiready visualise                # Start dev server (default)
 */

import { Command } from 'commander';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GraphBuilder, createSampleGraph } from '../graph/builder';
import type { GraphData } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WEB_PORT = 8000;

const program = new Command();

program
  .name('aiready-visualize')
  .description('Generate interactive visualizations from AIReady analysis results')
  .version('0.1.0')
  .option('-d, --dev', 'Start interactive web application (default)', true)
  .option('-o, --output <file>', 'Output HTML file for static generation')
  .passThroughOptions();

/**
 * Start the interactive web dev server
 */
function startDevServer(rootDir: string): void {
  const webDir = resolve(__dirname, '../web');
  
  console.log('🎯 AIReady Visualizer');
  console.log('🚀 Starting interactive web application...');
  console.log();
  console.log(`📁 Project root: ${rootDir}`);
  console.log(`🌐 Web server: http://localhost:${WEB_PORT}`);
  console.log();
  console.log('💡 The web app requires report data to visualize.');
  console.log('   Run "pnpm aiready scan ." then copy the report to:');
  console.log(`   web/public/report-data.json`);
  console.log();
  console.log('Press Ctrl+C to stop the server.');
  console.log();

  // Start vite dev server
  const vite = spawn('pnpm', ['dev'], {
    cwd: webDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  vite.on('error', (err) => {
    console.error('❌ Failed to start dev server:', err.message);
    process.exit(1);
  });
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
          <div style="margin-top:6px;color:#94a3b8"><strong>Proximity</strong>: nodes that are spatially close are more contextually related.</div>
          <div style="margin-top:6px;color:#94a3b8"><strong>Edge colors</strong>: <span style="color:#fb7e81">Similarity</span>, <span style="color:#84c1ff">Dependency</span>, <span style="color:#ffa500">Reference</span>.</div>
        </div>
      </div>
    </div>
    <script>
      const graphData = ${payload};
      document.getElementById('stat-files').textContent = graphData.metadata.totalFiles;
      document.getElementById('stat-deps').textContent = graphData.metadata.totalDependencies;
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const nodes = graphData.nodes.map((n, i) => ({
        ...n,
        x: canvas.width/2 + Math.cos(i / graphData.nodes.length * Math.PI * 2) * (Math.min(canvas.width, canvas.height)/3),
        y: canvas.height/2 + Math.sin(i / graphData.nodes.length * Math.PI * 2) * (Math.min(canvas.width, canvas.height)/3),
      }));
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        graphData.edges.forEach(edge => {
          const s = nodes.find(n => n.id === edge.source);
          const t = nodes.find(n => n.id === edge.target);
          if (!s || !t || edge.type === 'related') return;
          ctx.strokeStyle = edge.type === 'similarity' ? '#fb7e81' : 
                            edge.type === 'dependency' ? '#84c1ff' : 
                            edge.type === 'reference' ? '#ffa500' : '#334155';
          ctx.lineWidth = edge.type === 'similarity' ? 1.2 : edge.type === 'dependency' ? 1.0 : 0.8;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        });
        nodes.forEach(n => {
          const r = 6 + ((n.size || n.value || 1) / 2);
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

program
  .command('sample')
  .description('Generate a sample visualization for testing')
  .option('-o, --output <file>', 'Output HTML file', 'visualization.html')
  .option('--open', 'Open in browser')
  .action(async (options) => {
    const { writeFileSync } = await import('fs');
    const { exec } = await import('child_process');
    
    console.log('Generating sample visualization...');
    const graph = createSampleGraph();
    
    console.log(`\nSample graph created with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    
    const html = generateHTML(graph);
    const outputPath = resolve(options.output);
    writeFileSync(outputPath, html);
    
    console.log(`✅ HTML saved to: ${outputPath}`);
    
    if (options.open) {
      const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${opener} "${outputPath}"`);
    }
  });

program
  .command('generate')
  .description('Generate visualization from analysis results')
  .argument('<input>', 'Input JSON file with analysis results')
  .option('-o, --output <file>', 'Output HTML file', 'visualization.html')
  .option('--open', 'Open in browser')
  .action(async (input, options) => {
    const { readFileSync, writeFileSync } = await import('fs');
    const { exec } = await import('child_process');
    
    console.log(`Reading analysis results from: ${input}`);
    const report = JSON.parse(readFileSync(input, 'utf-8'));
    
    const rootDir = process.cwd();
    const graph = GraphBuilder.buildFromReport(report, rootDir);
    
    console.log(`Graph built: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
    
    const html = generateHTML(graph);
    const outputPath = resolve(options.output);
    writeFileSync(outputPath, html);
    
    console.log(`✅ HTML saved to: ${outputPath}`);
    
    if (options.open) {
      const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${opener} "${outputPath}"`);
    }
  });

// Handle default case: start dev server when no arguments provided
const args = process.argv.slice(2);
if (args.length === 0 || (args.length === 1 && (args[0] === '--dev' || args[0] === '-d'))) {
  startDevServer(process.cwd());
} else {
  program.parse();
}
