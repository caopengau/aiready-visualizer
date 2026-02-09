#!/usr/bin/env node

/**
 * CLI for generating visualizations
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { GraphBuilder } from './graph/builder.js';
import type { VisualizationGraph } from './types.js';

interface CLIOptions {
  rootDir: string;
  output: string;
  open?: boolean;
}

/**
 * Generate a sample graph for testing
 */
function generateSampleGraph(rootDir: string): VisualizationGraph {
  const builder = new GraphBuilder(rootDir);

  // Add some sample nodes
  builder.addFileNode('src/index.ts', {
    tokenCost: 2000,
    linesOfCode: 150,
    dependencies: 3,
    imports: 5,
    exports: 2,
  });

  builder.addFileNode('src/utils/helper.ts', {
    tokenCost: 1000,
    linesOfCode: 80,
    dependencies: 1,
    imports: 2,
    exports: 4,
  });

  builder.addFileNode('src/components/App.tsx', {
    tokenCost: 3000,
    linesOfCode: 200,
    dependencies: 5,
    imports: 8,
    exports: 1,
    duplicatePatterns: 2,
  });

  // Add some edges
  builder.addDependencyEdge('src/index.ts', 'src/components/App.tsx', 1);
  builder.addDependencyEdge('src/index.ts', 'src/utils/helper.ts', 2);
  builder.addDependencyEdge('src/components/App.tsx', 'src/utils/helper.ts', 3);

  return builder.build();
}

/**
 * Generate HTML with embedded visualization
 */
function generateHTML(graph: VisualizationGraph): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIReady Visualization</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
    }
    #root {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 2rem;
    }
    h1 {
      font-size: 2rem;
      background: linear-gradient(to right, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stats {
      display: flex;
      gap: 2rem;
      font-size: 1rem;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #60a5fa;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #94a3b8;
    }
    .message {
      text-align: center;
      max-width: 600px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    canvas {
      border: 1px solid #1e293b;
      border-radius: 8px;
      background: #1e293b;
    }
  </style>
</head>
<body>
  <div id="root">
    <h1>🎯 AIReady Visualization</h1>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${graph.metadata.totalNodes}</div>
        <div class="stat-label">Files</div>
      </div>
      <div class="stat">
        <div class="stat-value">${graph.metadata.totalEdges}</div>
        <div class="stat-label">Dependencies</div>
      </div>
      <div class="stat">
        <div class="stat-value">${graph.metadata.connectedComponents}</div>
        <div class="stat-label">Components</div>
      </div>
      <div class="stat">
        <div class="stat-value">${graph.metadata.circularDependencies.length}</div>
        <div class="stat-label">Circular Deps</div>
      </div>
    </div>
    <canvas id="canvas" width="1200" height="700"></canvas>
    <div class="message">
      <p><strong>Interactive visualization coming soon!</strong></p>
      <p>This is a placeholder. The React + d3-force frontend will be integrated next.</p>
    </div>
  </div>
  
  <script>
    // Embedded graph data
    const graphData = ${JSON.stringify(graph, null, 2)};
    
    // Simple canvas rendering for now
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Simple force simulation (placeholder)
    const nodes = graphData.nodes.map((node, i) => ({
      ...node,
      x: 600 + Math.cos(i / graphData.nodes.length * Math.PI * 2) * 200,
      y: 350 + Math.sin(i / graphData.nodes.length * Math.PI * 2) * 200,
      vx: 0,
      vy: 0
    }));
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw edges
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      graphData.edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const radius = 8 + (node.metrics.tokenCost / 500);
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.issues?.severity === 'critical' ? '#ef4444' :
                         node.issues?.severity === 'major' ? '#f59e0b' :
                         node.issues?.severity === 'minor' ? '#eab308' :
                         '#60a5fa';
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + radius + 12);
      });
    }
    
    draw();
    
    console.log('Graph data:', graphData);
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