#!/usr/bin/env node

/**
 * CLI for generating visualizations
 * 
 * Usage:
 *   aiready-visualize                    # Start dev server (default)
 *   aiready-visualize --dev              # Start dev server  
 *   aiready-visualize -o file.html       # Generate static HTML
 *   aiready-visualize sample -o file.html # Generate sample visualization
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { GraphBuilder } from './graph/builder';
import { generateHTML } from '@aiready/core';
import type { GraphData } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CLIOptions {
  dev: boolean;
  output?: string;
  open?: boolean;
  rootDir?: string;
  report?: string;
}

const WEB_PORT = 8000;

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

/**
 * Parse CLI arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    dev: true, // Default to dev mode
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dev' || arg === '-d') {
      options.dev = true;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--open') {
      options.open = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      // First non-flag argument could be rootDir
      if (!options.rootDir) {
        options.rootDir = arg;
      }
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
🎯 AIReady Visualizer CLI

Usage:
  aiready-visualize                    # Start interactive web app (default)
  aiready-visualize --dev               # Start interactive web app
  aiready-visualize -o file.html        # Generate static HTML
  aiready-visualize sample -o file.html # Generate sample visualization

Options:
  -d, --dev          Start interactive web app (default)
  -o, --output FILE  Output file for static HTML generation
  --open             Open output in browser (for static HTML)
  -h, --help         Show this help message

Examples:
  # Start interactive visualization
  aiready-visualize

  # Start with custom project root
  aiready-visualize /path/to/project

  # Generate static HTML
  aiready-visualize -o my-visualization.html
  `);
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const options = parseArgs(args);
  const rootDir = options.rootDir || process.cwd();

  // Default to dev mode (interactive web app)
  if (options.dev) {
    startDevServer(rootDir);
    return;
  }

  // Static HTML generation mode
  const outputPath = options.output || 'visualization.html';

  console.log('🎯 AIReady Visualizer');
  console.log(`📁 Root directory: ${rootDir}`);
  console.log(`📄 Output file: ${outputPath}`);
  console.log();

  // Generate sample graph
  console.log('🔨 Building graph...');
  const graph = generateSampleGraph(rootDir);

  console.log(`✅ Graph built: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
  console.log();

  // Generate HTML
  console.log('🎨 Generating visualization...');
  const html = generateHTML(graph);

  // Write to file
  const resolvedPath = resolve(outputPath);
  writeFileSync(resolvedPath, html);

  console.log(`✅ Visualization saved to: ${resolvedPath}`);
  console.log();

  if (options.open) {
    console.log('🌐 Opening in browser...');
    const opener = process.platform === 'darwin' ? 'open' :
                   process.platform === 'win32' ? 'start' :
                   'xdg-open';
    exec(`${opener} "${resolvedPath}"`);
  } else {
    console.log(`💡 Open ${resolvedPath} in your browser to view the visualization`);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
