// Types for the visualization

export interface FileNode {
  id: string;
  label: string;
  value: number;
  color: string;
  title: string;
  duplicates?: number;
  tokenCost?: number;
  severity?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: FileNode[];
  edges: GraphEdge[];
}

export interface PatternIssue {
  fileName: string;
  issues: Array<{ type: string; severity: string; message: string }>;
  metrics: { tokenCost: number; consistencyScore: number };
}

export interface Duplicate {
  file1: string;
  file2: string;
  severity: string;
  patternType: string;
}

export interface ContextFile {
  file: string;
  tokenCost: number;
  linesOfCode: number;
  dependencyCount: number;
  dependencyList: string[];
  relatedFiles: string[];
  severity: string;
  issues: string[];
}

export interface ReportData {
  patterns: PatternIssue[];
  duplicates: Duplicate[];
  context: ContextFile[];
  summary: { totalIssues: number };
}

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeColors {
  bg: string;
  text: string;
  textMuted: string;
  panel: string;
  panelBorder: string;
  cardBg: string;
  cardBorder: string;
  grid: string;
}

export type EffectiveTheme = 'dark' | 'light';
