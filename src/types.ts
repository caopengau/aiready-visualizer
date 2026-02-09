/**
 * Core types for graph visualization
 */

export type SeverityLevel = 'critical' | 'major' | 'minor' | 'info';
export type NodeType = 'file' | 'directory' | 'external';
export type EdgeType = 'import' | 'export' | 'type-dependency';
export type LayoutType = 'force' | 'hierarchical' | 'radial' | 'circular';
export type ColorByOption = 'severity' | 'tokenCost' | 'duplicates' | 'domain' | 'fileType';
export type SizeByOption = 'linesOfCode' | 'tokenCost' | 'dependencies' | 'exports' | 'issues';

/**
 * Node metrics from analysis tools
 */
export interface NodeMetrics {
  tokenCost: number;
  linesOfCode: number;
  dependencies: number;
  imports: number;
  exports: number;
  duplicatePatterns: number;
  cohesionScore: number;
  fragmentationScore: number;
}

/**
 * Issue information for a node
 */
export interface NodeIssues {
  severity: SeverityLevel;
  count: number;
  types: string[]; // ['duplicate-pattern', 'circular-dep', 'high-token-cost', etc.]
}

/**
 * Graph node representing a file/directory
 */
export interface GraphNode {
  id: string; // Unique identifier (file path)
  label: string; // Display name
  type: NodeType;
  
  // Analysis data
  metrics: NodeMetrics;
  issues?: NodeIssues;
  
  // Visual properties (computed by layout or user preferences)
  position?: { x: number; y: number };
  size?: number;
  color?: string;
  
  // Grouping
  domain?: string;
  clusterId?: string;
  
  // Additional metadata
  extension?: string;
  relativePath?: string;
}

/**
 * Graph edge representing a dependency
 */
export interface GraphEdge {
  source: string; // Node ID
  target: string; // Node ID
  type: EdgeType;
  weight: number; // Strength of dependency (e.g., number of imports)
  
  // Visual properties
  color?: string;
  width?: number;
  
  // Flags
  isCircular?: boolean;
  isCriticalPath?: boolean;
}

/**
 * Cluster/domain grouping
 */
export interface GraphCluster {
  id: string;
  domain: string;
  nodes: string[]; // Node IDs
  metrics: {
    totalTokens: number;
    avgCohesion: number;
    fragmentationScore: number;
  };
  
  // Visual properties
  color?: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Graph metadata and statistics
 */
export interface GraphMetadata {
  totalNodes: number;
  totalEdges: number;
  avgDegree: number;
  density: number;
  connectedComponents: number;
  circularDependencies: string[][]; // Array of circular dependency chains
  generatedAt: string;
  rootDir: string;
}

/**
 * Complete visualization graph structure
 */
export interface VisualizationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
  metadata: GraphMetadata;
}

/**
 * Visualization configuration
 */
export interface VisualizationConfig {
  layout: LayoutType;
  colorBy: ColorByOption;
  sizeBy: SizeByOption;
  showLabels: boolean;
  showClusters: boolean;
  showCircularDeps: boolean;
  filters: GraphFilters;
}

/**
 * Filter options for graph display
 */
export interface GraphFilters {
  minTokenCost?: number;
  maxTokenCost?: number;
  severity?: SeverityLevel[];
  nodeTypes?: NodeType[];
  fileExtensions?: string[];
  domains?: string[];
  excludeExternal?: boolean;
  excludeTests?: boolean;
  showOnlyIssues?: boolean;
}

/**
 * Options for generating visualizations
 */
export interface VisualizeOptions {
  rootDir: string;
  output: string;
  analysis?: any; // Pre-computed analysis results (from @aiready/cli)
  layout?: LayoutType;
  colorBy?: ColorByOption;
  sizeBy?: SizeByOption;
  filters?: Partial<GraphFilters>;
  showIssues?: boolean;
  openInBrowser?: boolean;
}

/**
 * Layout configuration for d3-force
 */
export interface ForceLayoutConfig {
  chargeStrength: number;
  linkDistance: number;
  linkStrength: number;
  centerStrength: number;
  collisionRadius: number;
  alphaDecay: number;
  velocityDecay: number;
}

/**
 * Interactive state for the visualization
 */
export interface VisualizationState {
  selectedNode?: string;
  hoveredNode?: string;
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  filters: GraphFilters;
  config: VisualizationConfig;
  searchQuery: string;
  zoom: number;
  pan: { x: number; y: number };
}

/**
 * Color scheme definition
 */
export interface ColorScheme {
  critical: string;
  major: string;
  minor: string;
  info: string;
  default: string;
  domain: string[];
  background: string;
  text: string;
}