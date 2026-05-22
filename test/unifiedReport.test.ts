import { test, expect, vi } from 'vitest';
import { GraphBuilder } from '../src/graph/builder';

vi.mock('fs', async () => {
  const actual = (await vi.importActual('fs')) as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn(() => true),
    },
    existsSync: vi.fn(() => true),
  };
});

const UNIFIED_REPORT = {
  summary: {
    totalIssues: 1,
    toolsRun: ['patterns', 'context'],
    executionTime: 100,
  },
  patternDetect: {
    results: [
      {
        fileName: 'src/app.ts',
        issues: [{ severity: 'critical', message: 'Duplicate code' }],
        metrics: { tokenCost: 100 },
      },
    ],
    duplicates: [
      { file1: 'src/app.ts', file2: 'src/utils.ts', similarity: 0.9 },
    ],
  },
  contextAnalyzer: {
    results: [
      {
        file: 'src/app.ts',
        tokenCost: 100,
        linesOfCode: 50,
        dependencyCount: 1,
        dependencyList: ['./other.ts'],
        relatedFiles: [],
        severity: 'critical',
      },
      {
        file: 'src/other.ts',
        tokenCost: 50,
        linesOfCode: 20,
        dependencyCount: 0,
        dependencyList: [],
        relatedFiles: [],
        severity: 'info',
      },
      {
        file: 'src/utils.ts',
        tokenCost: 50,
        linesOfCode: 20,
        dependencyCount: 0,
        dependencyList: [],
        relatedFiles: [],
        severity: 'info',
      },
    ],
  },
};

const LEGACY_REPORT = {
  patterns: [
    {
      fileName: 'src/app.ts',
      issues: [{ severity: 'major', message: 'Legacy issue' }],
      metrics: { tokenCost: 80 },
    },
  ],
  duplicates: [],
  context: [
    {
      file: 'src/app.ts',
      tokenCost: 80,
      linesOfCode: 40,
      dependencyCount: 0,
      dependencyList: [],
      relatedFiles: [],
      severity: 'major',
    },
  ],
};

test('buildFromReport handles unified report format', () => {
  const graph = GraphBuilder.buildFromReport(UNIFIED_REPORT, '/root');
  // 3 nodes: app.ts, other.ts, utils.ts
  expect(graph.nodes.length).toBe(3);
  expect(graph.edges.length).toBe(2); // 1 dependency + 1 similarity
  expect(graph.metadata.totalFiles).toBe(3);
  expect(graph.metadata.criticalIssues).toBeGreaterThan(0);
});

test('buildFromReport handles legacy report format', () => {
  const graph = GraphBuilder.buildFromReport(LEGACY_REPORT, '/root');
  expect(graph.nodes.length).toBe(1);
  expect(graph.metadata.majorIssues).toBeGreaterThan(0);
});

test('buildFromReport handles partially missing tools in unified report', () => {
  const partialReport = {
    summary: { totalIssues: 0, toolsRun: ['context'], executionTime: 10 },
    contextAnalyzer: UNIFIED_REPORT.contextAnalyzer,
  };
  const graph = GraphBuilder.buildFromReport(partialReport, '/root');
  expect(graph.nodes.length).toBe(3);
});

test('buildFromReport handles empty report gracefully', () => {
  const emptyReport = {
    summary: { totalIssues: 0, toolsRun: [], executionTime: 0 },
  };
  const graph = GraphBuilder.buildFromReport(emptyReport, '/root');
  expect(graph.nodes.length).toBe(0);
  expect(graph.edges.length).toBe(0);
});
