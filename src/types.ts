/**
 * Core types for graph visualization
 */

/**
 * Severity levels for issues
 */
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';

/**
 * Base graph node (compatible with d3-force SimulationNodeDatum)
 */
export interface BaseGraphNode {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

/**
 * Base graph link (compatible with d3-force SimulationLinkDatum)
 */
export interface BaseGraphLink {
  source: string | BaseGraphNode;
  target: string | BaseGraphNode;
  index?: number;
}

/**
 * File node in the dependency graph
 */
export interface FileNode extends BaseGraphNode {
  id: string;
  path: string;
  label: string;
  
  // Metrics
  linesOfCode?: number;
  tokenCost?: number;
  complexity?: number;
  
  // Issue counts
  duplicates?: number;
  inconsistencies?: number;
  
  // Categorization
  domain?: string;
  moduleType?: 'component' | 'util' | 'service' | 'config' | 'test' | 'other';
  
  // Visual properties (from GraphNode)
  color?: string;
  size?: number;
  group?: string;
}

/**
 * Dependency edge between files
 */
export interface DependencyEdge extends BaseGraphLink {
  source: string | FileNode;
  target: string | FileNode;
  
  // Edge properties
  type?: 'import' | 'require' | 'dynamic';
  weight?: number;
  
  // Visual properties (from GraphLink)
  color?: string;
  width?: number;
  label?: string;
}

/**
 * Domain or module cluster
 */
export interface Cluster {
  id: string;
  name: string;
  nodeIds: string[];
  color?: string;
  description?: string;
}

/**
 * Issue overlay on the graph
 */
export interface IssueOverlay {
  id: string;
  type: 'duplicate' | 'circular-dependency' | 'inconsistency' | 'high-cost' | 'complexity';
  severity: IssueSeverity;
  nodeIds: string[];
  edgeIds?: string[];
  message: string;
  details?: string;
}

/**
 * Complete graph data structure
 */
export interface GraphData {
  nodes: FileNode[];
  edges: DependencyEdge[];
  clusters: Cluster[];
  issues: IssueOverlay[];
  metadata: GraphMetadata;
}

/**
 * Metadata about the graph
 */
export interface GraphMetadata {
  projectName?: string;
  timestamp: string;
  totalFiles: number;
  totalDependencies: number;
  analysisTypes: string[];
  
  // Aggregate metrics
  totalLinesOfCode?: number;
  totalTokenCost?: number;
  averageComplexity?: number;
  
  // Issue counts
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  infoIssues: number;
}

/**
 * Filter options for the visualization
 */
export interface FilterOptions {
  severities?: IssueSeverity[];
  issueTypes?: IssueOverlay['type'][];
  domains?: string[];
  moduleTypes?: FileNode['moduleType'][];
  minTokenCost?: number;
  maxTokenCost?: number;
  showOnlyIssues?: boolean;
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  type: 'force' | 'hierarchical' | 'circular' | 'radial';
  chargeStrength?: number;
  linkDistance?: number;
  collisionRadius?: number;
}

/**
 * Visualization configuration
 */
export interface VisualizationConfig {
  layout: LayoutConfig;
  filters: FilterOptions;
  colorBy: 'severity' | 'domain' | 'moduleType' | 'tokenCost';
  sizeBy: 'tokenCost' | 'loc' | 'complexity' | 'duplicates';
  showLabels: boolean;
  showClusters: boolean;
}