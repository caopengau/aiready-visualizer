/**
 * Graph builder - transforms AIReady analysis results into graph data
 */

import path from 'path';
import {
  Severity,
  UnifiedReportSchema,
  ToolName,
  type AnalysisResult,
} from '@aiready/core';
import type { GraphData, FileNode, DependencyEdge } from '../types';
import { GRAPH_CONSTANTS, normalizeLabel } from './utils';
import { GraphProcessors, type FileIssueRecord } from './processors';

/**
 * GraphBuilder: programmatic builder and report-based builder.
 * @lastUpdated 2026-03-31
 */
export class GraphBuilder {
  private readonly rootDir: string;
  private readonly nodesMap: Map<string, FileNode>;
  private readonly edges: DependencyEdge[];
  private readonly edgesSet: Set<string>;

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.nodesMap = new Map();
    this.edges = [];
    this.edgesSet = new Set();
  }

  // --- External accessors for processors ---
  getRootDir(): string {
    return this.rootDir;
  }
  hasEdge(key: string): boolean {
    return this.edgesSet.has(key);
  }
  getNode(id: string): FileNode | undefined {
    return this.nodesMap.get(id);
  }

  /**
   * Add a new node to the graph or update an existing one.
   */
  addNode(
    file: string,
    title = '',
    size = GRAPH_CONSTANTS.DEFAULT_NODE_SIZE
  ): void {
    if (!file) return;
    const id = path.resolve(this.rootDir, file);
    const existingNode = this.nodesMap.get(id);

    if (!existingNode) {
      const node: FileNode = {
        id,
        path: id,
        label: normalizeLabel(id, this.rootDir),
        title,
        size: size,
      };
      this.nodesMap.set(id, node);
    } else {
      if (
        title &&
        (!existingNode.title || !existingNode.title.includes(title))
      ) {
        existingNode.title =
          (existingNode.title ? existingNode.title + '\n' : '') + title;
      }
      if (size > (existingNode.size ?? 0)) {
        existingNode.size = size;
      }
    }
  }

  /**
   * Add a directed edge between two nodes in the graph.
   */
  addEdge(from: string, to: string, type: string = 'link'): void {
    if (!from || !to) return;
    const source = path.resolve(this.rootDir, from);
    const target = path.resolve(this.rootDir, to);
    if (source === target) return;

    const key = `${source}->${target}`;
    if (!this.edgesSet.has(key)) {
      this.edges.push({
        source,
        target,
        type: type as 'dependency' | 'similar' | 'shared',
      });
      this.edgesSet.add(key);
    }
  }

  /**
   * Build the final GraphData object from collected nodes and edges.
   */
  build(): GraphData {
    const nodes = Array.from(this.nodesMap.values());
    return {
      nodes,
      edges: [...this.edges],
      clusters: [],
      issues: [],
      metadata: {
        timestamp: new Date().toISOString(),
        totalFiles: nodes.length,
        totalDependencies: this.edges.length,
        analysisTypes: [],
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        infoIssues: 0,
      },
      truncated: {
        nodes: false,
        edges: false,
      },
    };
  }

  /**
   * Static helper to build graph from an AIReady report JSON.
   */
  static buildFromReport(report: any, rootDir = process.cwd()): GraphData {
    const validation = UnifiedReportSchema.safeParse(report);
    if (!validation.success) {
      console.warn(
        'Visualizer: Report does not fully match UnifiedReportSchema, proceeding with best-effort parsing.'
      );
    }

    const builder = new GraphBuilder(rootDir);
    const fileIssues = new Map<string, FileIssueRecord>();

    const bumpIssue = (file: string, severity?: Severity | null) => {
      if (!file) return;
      const id = path.resolve(rootDir, file);
      if (!fileIssues.has(id)) {
        fileIssues.set(id, { count: 0, maxSeverity: null, duplicates: 0 });
      }
      const record = fileIssues.get(id)!;
      record.count += 1;

      if (severity) {
        if (
          !record.maxSeverity ||
          GRAPH_CONSTANTS.SEVERITY_ORDER[severity] >
            GRAPH_CONSTANTS.SEVERITY_ORDER[record.maxSeverity]
        ) {
          record.maxSeverity = severity;
        }
      }
    };

    const getResults = (
      toolKey: string,
      legacyKey?: string
    ): AnalysisResult[] => {
      const camelKey = toolKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const toolData =
        (report as any)[toolKey] ??
        (report as any)[camelKey] ??
        (legacyKey ? (report as any)[legacyKey] : undefined);
      if (!toolData) return [];
      if (Array.isArray(toolData)) return toolData;
      return toolData.results ?? toolData.issues ?? [];
    };

    // 1. Process Pattern Detect
    GraphProcessors.processPatterns(
      builder,
      getResults(ToolName.PatternDetect, 'patterns'),
      rootDir,
      bumpIssue
    );

    // 2. Process Duplicates
    GraphProcessors.processDuplicates(builder, report, rootDir, fileIssues);

    // 3. Process Context Analyzer
    GraphProcessors.processContext(
      builder,
      getResults(ToolName.ContextAnalyzer, 'context'),
      rootDir,
      bumpIssue
    );

    // 4. Process Other Tools
    GraphProcessors.processToolResults(
      builder,
      ToolName.DocDrift,
      'docDrift',
      report,
      bumpIssue,
      'Doc-Drift Issue'
    );
    GraphProcessors.processToolResults(
      builder,
      ToolName.DependencyHealth,
      'dependencyHealth',
      report,
      bumpIssue,
      'Dependency Issue'
    );
    GraphProcessors.processToolResults(
      builder,
      ToolName.ContractEnforcement,
      'contractEnforcement',
      report,
      bumpIssue,
      'Contract Gap'
    );

    return GraphProcessors.finalizeGraph(builder, fileIssues, report);
  }
}

/**
 * Create a small sample graph for demonstration or testing purposes.
 */
export function createSampleGraph(): GraphData {
  const builder = new GraphBuilder(process.cwd());
  builder.addNode('src/components/Button.tsx', 'Button', 15);
  builder.addNode('src/utils/helpers.ts', 'helpers', 12);
  builder.addNode('src/services/api.ts', 'api', 18);
  builder.addEdge(
    'src/components/Button.tsx',
    'src/utils/helpers.ts',
    'dependency'
  );
  builder.addEdge('src/utils/helpers.ts', 'src/services/api.ts', 'dependency');
  return builder.build();
}
