/**
 * Graph builder - transforms AIReady analysis results into graph data
 */

import type {
  GraphData,
  FileNode,
  DependencyEdge,
  Cluster,
  IssueOverlay,
  IssueSeverity,
} from '../types';

/**
 * Build graph data from AIReady analysis results
 * This is a placeholder that will be expanded to handle real analysis data
 */
export function buildGraph(analysisResults: any): GraphData {
  const nodes: FileNode[] = [];
  const edges: DependencyEdge[] = [];
  const clusters: Cluster[] = [];
  const issues: IssueOverlay[] = [];

  // TODO: Parse analysis results and build graph
  // For now, return empty graph structure
  
  return {
    nodes,
    edges,
    clusters,
    issues,
    metadata: {
      timestamp: new Date().toISOString(),
      totalFiles: nodes.length,
      totalDependencies: edges.length,
      analysisTypes: [],
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
      infoIssues: 0,
    },
  };
}

/**
 * Create a sample graph for testing
 */
export function createSampleGraph(): GraphData {
  const nodes: FileNode[] = [
    {
      id: 'file1',
      path: 'src/components/Button.tsx',
      label: 'Button',
      linesOfCode: 120,
      tokenCost: 450,
      domain: 'components',
      moduleType: 'component',
      color: '#3b82f6',
      size: 15,
    },
    {
      id: 'file2',
      path: 'src/utils/helpers.ts',
      label: 'helpers',
      linesOfCode: 80,
      tokenCost: 300,
      domain: 'utils',
      moduleType: 'util',
      color: '#10b981',
      size: 12,
    },
    {
      id: 'file3',
      path: 'src/services/api.ts',
      label: 'api',
      linesOfCode: 200,
      tokenCost: 750,
      domain: 'services',
      moduleType: 'service',
      color: '#f59e0b',
      size: 18,
    },
  ];

  const edges: DependencyEdge[] = [
    {
      source: 'file1',
      target: 'file2',
      type: 'import',
      weight: 1,
    },
    {
      source: 'file2',
      target: 'file3',
      type: 'import',
      weight: 1,
    },
  ];

  const clusters: Cluster[] = [
    {
      id: 'cluster1',
      name: 'Components',
      nodeIds: ['file1'],
      color: '#3b82f6',
    },
    {
      id: 'cluster2',
      name: 'Utils',
      nodeIds: ['file2'],
      color: '#10b981',
    },
    {
      id: 'cluster3',
      name: 'Services',
      nodeIds: ['file3'],
      color: '#f59e0b',
    },
  ];

  const issues: IssueOverlay[] = [
    {
      id: 'issue1',
      type: 'high-cost',
      severity: 'minor',
      nodeIds: ['file3'],
      message: 'High token cost detected',
      details: 'This file has a token cost of 750, consider refactoring',
    },
  ];

  return {
    nodes,
    edges,
    clusters,
    issues,
    metadata: {
      projectName: 'Sample Project',
      timestamp: new Date().toISOString(),
      totalFiles: nodes.length,
      totalDependencies: edges.length,
      analysisTypes: ['sample'],
      totalLinesOfCode: 400,
      totalTokenCost: 1500,
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 1,
      infoIssues: 0,
    },
  };
}