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
import { generateHTML } from '@aiready/core';
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
