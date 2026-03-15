import type { GraphNode, GraphEdge, GraphData, BusinessMetrics } from '@aiready/core/client';

export type { GraphNode as FileNode, GraphEdge, GraphData, BusinessMetrics };

// Filter types
export type SeverityLevel = 'critical' | 'major' | 'minor' | 'info';
export type EdgeType = 'similarity' | 'dependency' | 'reference' | 'related';

export interface FilterState {
  visibleSeverities: Set<SeverityLevel>;
  visibleEdgeTypes: Set<EdgeType>;
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
  scoring?: {
    breakdown?: Array<{
      toolName: string;
      score: number;
      rawMetrics?: Record<string, number>;
    }>;
  };
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
