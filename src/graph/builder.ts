/**
 * Graph builder - transforms analysis results into visualization graph
 */

import { resolve, relative, extname, basename } from 'path';
import type {
  VisualizationGraph,
  GraphNode,
  GraphEdge,
  GraphCluster,
  GraphMetadata,
  NodeMetrics,
  NodeIssues,
  SeverityLevel,
} from '../types.js';

/**
 * Build a visualization graph from file system and analysis data
 */
export class GraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private clusters: Map<string, GraphCluster> = new Map();
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = resolve(rootDir);
  }

  /**
   * Add a file node to the graph
   */
  addFileNode(filePath: string, metrics: Partial<NodeMetrics> = {}): GraphNode {
    const id = relative(this.rootDir, filePath);
    const label = basename(filePath);
    const extension = extname(filePath);

    const node: GraphNode = {
      id,
      label,
      type: this.determineNodeType(filePath),
      metrics: {
        tokenCost: 0,
        linesOfCode: 0,
        dependencies: 0,
        imports: 0,
        exports: 0,
        duplicatePatterns: 0,
        cohesionScore: 1.0,
        fragmentationScore: 0,
        ...metrics,
      },
      extension,
      relativePath: id,
      domain: this.inferDomain(id),
    };

    this.nodes.set(id, node);
    return node;
  }

  /**
   * Add a dependency edge between two nodes
   */
  addDependencyEdge(
    sourceId: string,
    targetId: string,
    weight: number = 1,
    type: 'import' | 'export' | 'type-dependency' = 'import'
  ): GraphEdge {
    const edge: GraphEdge = {
      source: sourceId,
      target: targetId,
      type,
      weight,
    };

    this.edges.push(edge);
    return edge;
  }

  /**
   * Add issues to a node
   */
  addNodeIssues(nodeId: string, issues: NodeIssues): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.issues = issues;
    }
  }

  /**
   * Update node metrics
   */
  updateNodeMetrics(nodeId: string, metrics: Partial<NodeMetrics>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.metrics = {
        ...node.metrics,
        ...metrics,
      };
    }
  }

  /**
   * Detect and mark circular dependencies
   */
  detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const adjacencyList = this.buildAdjacencyList();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycles.push([...cycle, neighbor]);
          
          // Mark edges as circular
          for (let i = 0; i < cycle.length; i++) {
            const source = cycle[i];
            const target = cycle[(i + 1) % cycle.length];
            const edge = this.edges.find(
              (e) => e.source === source && e.target === target
            );
            if (edge) {
              edge.isCircular = true;
            }
          }
          
          return true;
        }
      }

      path.pop();
      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return cycles;
  }

  /**
   * Create clusters based on domains
   */
  createDomainClusters(): void {
    const domainMap = new Map<string, string[]>();

    // Group nodes by domain
    for (const [nodeId, node] of this.nodes) {
      const domain = node.domain || 'uncategorized';
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(nodeId);
    }

    // Create clusters
    for (const [domain, nodeIds] of domainMap) {
      const clusterNodes = nodeIds.map((id) => this.nodes.get(id)!);
      const totalTokens = clusterNodes.reduce(
        (sum, node) => sum + node.metrics.tokenCost,
        0
      );
      const avgCohesion =
        clusterNodes.reduce((sum, node) => sum + node.metrics.cohesionScore, 0) /
        clusterNodes.length;
      const fragmentationScore =
        clusterNodes.reduce(
          (sum, node) => sum + node.metrics.fragmentationScore,
          0
        ) / clusterNodes.length;

      const cluster: GraphCluster = {
        id: `cluster-${domain}`,
        domain,
        nodes: nodeIds,
        metrics: {
          totalTokens,
          avgCohesion,
          fragmentationScore,
        },
      };

      this.clusters.set(cluster.id, cluster);

      // Assign cluster ID to nodes
      nodeIds.forEach((nodeId) => {
        const node = this.nodes.get(nodeId);
        if (node) {
          node.clusterId = cluster.id;
        }
      });
    }
  }

  /**
   * Build the final visualization graph
   */
  build(): VisualizationGraph {
    // Detect circular dependencies
    const circularDependencies = this.detectCircularDependencies();

    // Create domain clusters
    this.createDomainClusters();

    // Calculate graph statistics
    const metadata = this.calculateMetadata(circularDependencies);

    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      clusters: Array.from(this.clusters.values()),
      metadata,
    };
  }

  /**
   * Calculate graph metadata and statistics
   */
  private calculateMetadata(circularDependencies: string[][]): GraphMetadata {
    const totalNodes = this.nodes.size;
    const totalEdges = this.edges.length;
    const avgDegree = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0;
    const maxPossibleEdges = (totalNodes * (totalNodes - 1)) / 2;
    const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;

    // Count connected components using Union-Find
    const connectedComponents = this.countConnectedComponents();

    return {
      totalNodes,
      totalEdges,
      avgDegree,
      density,
      connectedComponents,
      circularDependencies,
      generatedAt: new Date().toISOString(),
      rootDir: this.rootDir,
    };
  }

  /**
   * Build adjacency list for graph traversal
   */
  private buildAdjacencyList(): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>();

    for (const edge of this.edges) {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, []);
      }
      adjacencyList.get(edge.source)!.push(edge.target);
    }

    return adjacencyList;
  }

  /**
   * Count connected components using Union-Find
   */
  private countConnectedComponents(): number {
    const parent = new Map<string, string>();
    const rank = new Map<string, number>();

    // Initialize
    for (const nodeId of this.nodes.keys()) {
      parent.set(nodeId, nodeId);
      rank.set(nodeId, 0);
    }

    const find = (x: string): string => {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!));
      }
      return parent.get(x)!;
    };

    const union = (x: string, y: string): void => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX !== rootY) {
        if (rank.get(rootX)! < rank.get(rootY)!) {
          parent.set(rootX, rootY);
        } else if (rank.get(rootX)! > rank.get(rootY)!) {
          parent.set(rootY, rootX);
        } else {
          parent.set(rootY, rootX);
          rank.set(rootX, rank.get(rootX)! + 1);
        }
      }
    };

    // Union edges (treat as undirected for component counting)
    for (const edge of this.edges) {
      union(edge.source, edge.target);
    }

    // Count unique roots
    const roots = new Set<string>();
    for (const nodeId of this.nodes.keys()) {
      roots.add(find(nodeId));
    }

    return roots.size;
  }

  /**
   * Determine node type based on file path
   */
  private determineNodeType(filePath: string): 'file' | 'directory' | 'external' {
    if (filePath.includes('node_modules') || filePath.startsWith('..')) {
      return 'external';
    }
    return 'file';
  }

  /**
   * Infer domain from file path
   */
  private inferDomain(relativePath: string): string {
    const parts = relativePath.split('/');
    
    // Use first directory as domain
    if (parts.length > 1) {
      return parts[0];
    }
    
    return 'root';
  }
}

/**
 * Helper function to determine severity level from metrics
 */
export function calculateSeverity(metrics: NodeMetrics): SeverityLevel {
  // Critical: High token cost + duplicates + low cohesion
  if (
    metrics.tokenCost > 5000 &&
    metrics.duplicatePatterns > 5 &&
    metrics.cohesionScore < 0.5
  ) {
    return 'critical';
  }

  // Major: High token cost or many duplicates
  if (metrics.tokenCost > 3000 || metrics.duplicatePatterns > 3) {
    return 'major';
  }

  // Minor: Moderate issues
  if (metrics.tokenCost > 1500 || metrics.duplicatePatterns > 1) {
    return 'minor';
  }

  return 'info';
}