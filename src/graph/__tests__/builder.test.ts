import { describe, it, expect, vi } from 'vitest';
import { GraphBuilder } from '../builder';
import { Severity, ToolName } from '@aiready/core';

describe('GraphBuilder', () => {
  describe('buildFromReport', () => {
    it('should handle a basic report with duplicates at root of tool data', () => {
      const report = {
        summary: {
          totalIssues: 1,
          totalFiles: 1,
          toolsRun: ['pattern-detect'],
        },
        'pattern-detect': {
          results: [],
          duplicates: [
            { file1: 'a.ts', file2: 'b.ts', similarity: 0.9, tokenCost: 100 },
          ],
        },
      };

      const graph = GraphBuilder.buildFromReport(report);
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.some((e) => e.type === 'similarity')).toBe(true);
    });

    it('should handle a unified report with duplicates nested in summary', () => {
      const report = {
        summary: {
          totalIssues: 1,
          totalFiles: 1,
          toolsRun: ['pattern-detect'],
        },
        'pattern-detect': {
          results: [],
          summary: {
            duplicates: [
              { file1: 'a.ts', file2: 'b.ts', similarity: 0.9, tokenCost: 100 },
            ],
          },
        },
      };

      const graph = GraphBuilder.buildFromReport(report);
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.some((e) => e.type === 'similarity')).toBe(true);
    });

    it('should handle reports with missing tool data gracefully', () => {
      const report = {
        summary: { totalIssues: 0, totalFiles: 0, toolsRun: [] },
      };

      const graph = GraphBuilder.buildFromReport(report);
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
    });

    it('should handle malformed duplicates (not an array) gracefully', () => {
      const report = {
        summary: {
          totalIssues: 1,
          totalFiles: 1,
          toolsRun: ['pattern-detect'],
        },
        'pattern-detect': {
          summary: {
            duplicates: { not: 'an array' },
          },
        },
      };

      // This should not throw "duplicates.forEach is not a function"
      const graph = GraphBuilder.buildFromReport(report);
      expect(graph.nodes).toEqual([]);
    });
  });
});
