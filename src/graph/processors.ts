import fs from 'fs';
import path from 'path';
import {
  Severity,
  ToolName,
  normalizeAnalysisResult,
  type Issue,
} from '@aiready/core';
import type { GraphData, FileNode } from '../types';
import {
  GRAPH_CONSTANTS,
  extractReferencedPaths,
  getPackageGroup,
  rankSeverity,
  getColorForSeverity,
} from './utils';
import type { GraphBuilder } from './builder';

/**
 * Metadata for tracking file-level issue aggregates during graph building.
 */
export interface FileIssueRecord {
  count: number;
  maxSeverity: Severity | null;
  duplicates: number;
}

export class GraphProcessors {
  static processPatterns(
    builder: GraphBuilder,
    results: any[],
    rootDir: string,
    bumpIssue: (file: string, sev?: Severity | null) => void
  ): void {
    const basenameMap = new Map<string, Set<string>>();
    results.forEach((p: any) => {
      const fileName = p.fileName ?? p.file;
      if (fileName) {
        const base = path.basename(fileName);
        if (!basenameMap.has(base)) basenameMap.set(base, new Set());
        basenameMap.get(base)!.add(fileName);
      }
    });

    results.forEach((entry: any) => {
      const normalized = normalizeAnalysisResult(entry);
      const file = normalized.fileName;
      if (!file) return;

      builder.addNode(
        file,
        `Issues: ${normalized.issues.length}`,
        normalized.metrics.tokenCost || GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE
      );

      const rawIssues = Array.isArray(entry.issues) ? entry.issues : [];
      if (rawIssues.length > 0) {
        rawIssues.forEach((issue: any) => {
          bumpIssue(file, rankSeverity(issue.severity));
        });
      } else {
        normalized.issues.forEach((issue: Issue) => {
          bumpIssue(file, issue.severity);
        });
      }

      normalized.issues.forEach((issue: Issue) => {
        const refs = extractReferencedPaths(issue.message);
        refs.forEach((ref) => {
          const target = path.isAbsolute(ref)
            ? ref
            : path.resolve(path.dirname(file), ref);
          builder.addNode(
            target,
            'Referenced file',
            GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE
          );
          builder.addEdge(file, target, 'reference');
        });

        const percMatch = (issue.message.match(/(\d+)%/) || [])[1];
        const perc = percMatch ? parseInt(percMatch, 10) : null;
        const wantFuzzy =
          issue.type === 'duplicate-pattern' ||
          /similar/i.test(issue.message) ||
          (perc !== null && perc >= GRAPH_CONSTANTS.FUZZY_MATCH_THRESHOLD);

        if (wantFuzzy) {
          const fileGroup = getPackageGroup(file);
          for (const [base, pathsSet] of basenameMap.entries()) {
            if (!issue.message.includes(base) || base === path.basename(file))
              continue;
            for (const target of pathsSet) {
              const targetGroup = getPackageGroup(target);
              if (
                fileGroup !== targetGroup &&
                !(
                  perc !== null &&
                  perc >= GRAPH_CONSTANTS.FUZZY_MATCH_HIGH_THRESHOLD
                )
              )
                continue;
              builder.addNode(
                target,
                'Fuzzy match',
                GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE
              );
              builder.addEdge(file, target, 'similarity');
            }
          }
        }
      });
    });
  }

  static processDuplicates(
    builder: GraphBuilder,
    report: any,
    rootDir: string,
    fileIssues: Map<string, FileIssueRecord>
  ): void {
    const patternData =
      report[ToolName.PatternDetect] ||
      report.patternDetect ||
      report.patterns ||
      {};
    const duplicates =
      (Array.isArray(patternData.duplicates) ? patternData.duplicates : null) ||
      (patternData.summary && Array.isArray(patternData.summary.duplicates)
        ? patternData.summary.duplicates
        : null) ||
      (Array.isArray(report.duplicates) ? report.duplicates : []);

    duplicates.forEach((dup: any) => {
      builder.addNode(
        dup.file1,
        'Similarity target',
        GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE
      );
      builder.addNode(
        dup.file2,
        'Similarity target',
        GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE
      );
      builder.addEdge(dup.file1, dup.file2, 'similarity');

      [dup.file1, dup.file2].forEach((file) => {
        const id = path.resolve(rootDir, file);
        if (!fileIssues.has(id)) {
          fileIssues.set(id, { count: 0, maxSeverity: null, duplicates: 0 });
        }
        fileIssues.get(id)!.duplicates += 1;
      });
    });
  }

  static processContext(
    builder: GraphBuilder,
    results: any[],
    rootDir: string,
    bumpIssue: (file: string, sev?: Severity | null) => void
  ): void {
    results.forEach((ctx: any) => {
      const normalized = normalizeAnalysisResult(ctx);
      const file = normalized.fileName;
      if (!file) return;

      builder.addNode(
        file,
        `Deps: ${ctx.dependencyCount || 0}`,
        GRAPH_CONSTANTS.DEFAULT_CONTEXT_SIZE
      );

      normalized.issues.forEach((issue: Issue) => {
        bumpIssue(file, issue.severity);
      });

      (ctx.relatedFiles ?? []).forEach((rel: string) => {
        const resolvedRel = path.isAbsolute(rel)
          ? rel
          : path.resolve(path.dirname(file), rel);
        const resolvedFile = path.resolve(builder.getRootDir(), file);
        const resolvedTarget = path.resolve(builder.getRootDir(), resolvedRel);

        const keyA = `${resolvedFile}->${resolvedTarget}`;
        const keyB = `${resolvedTarget}->${resolvedFile}`;

        if (builder.hasEdge(keyA) || builder.hasEdge(keyB)) return;

        builder.addNode(
          resolvedRel,
          'Related file',
          GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE
        );

        const node = builder.getNode(resolvedTarget);
        if (node) {
          node.size = (node.size || 1) + 2;
        }
        builder.addEdge(file, resolvedRel, 'related');
      });

      const fileDir = path.dirname(path.resolve(builder.getRootDir(), file));
      (ctx.dependencyList ?? []).forEach((dep: string) => {
        if (dep.startsWith('.') || dep.startsWith('/')) {
          const possiblePaths = [
            path.resolve(fileDir, dep),
            path.resolve(fileDir, dep + '.ts'),
            path.resolve(fileDir, dep + '.tsx'),
            path.resolve(fileDir, dep + '.js'),
            path.resolve(fileDir, dep, 'index.ts'),
            path.resolve(fileDir, dep, 'index.tsx'),
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              builder.addNode(
                p,
                'Dependency',
                GRAPH_CONSTANTS.DEFAULT_DEPENDENCY_SIZE
              );
              builder.addEdge(file, p, 'dependency');
              break;
            }
          }
        }
      });
    });
  }

  static processToolResults(
    builder: GraphBuilder,
    toolName: ToolName,
    legacyKey: string,
    report: any,
    bumpIssue: (file: string, sev?: Severity | null) => void,
    title: string
  ): void {
    const camelKey = toolName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const toolData = report[toolName] ?? report[camelKey] ?? report[legacyKey];
    if (!toolData) return;

    const results = Array.isArray(toolData)
      ? toolData
      : (toolData.results ?? toolData.issues ?? []);
    results.forEach((item: any) => {
      if (!Array.isArray(item.issues) && (item.severity || item.message)) {
        const file = item.fileName ?? item.file ?? item.location?.file;
        if (file) {
          builder.addNode(file, title, GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE);
          bumpIssue(file, rankSeverity(item.severity));
        }
        return;
      }

      const normalized = normalizeAnalysisResult(item);
      const file = normalized.fileName;
      if (file) {
        builder.addNode(file, title, GRAPH_CONSTANTS.DEFAULT_REFERENCE_SIZE);
        normalized.issues.forEach((issue) => {
          bumpIssue(file, issue.severity);
        });
      }
    });
  }

  static finalizeGraph(
    builder: GraphBuilder,
    fileIssues: Map<string, FileIssueRecord>,
    report: any
  ): GraphData {
    const graph = builder.build();

    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;
    let infoIssues = 0;

    graph.nodes.forEach((node: FileNode) => {
      const record = fileIssues.get(node.id);
      if (record) {
        node.duplicates = record.duplicates || 0;
        node.color = getColorForSeverity(record.maxSeverity);
        node.group = getPackageGroup(node.id);

        if (record.maxSeverity === Severity.Critical)
          criticalIssues += record.count;
        else if (record.maxSeverity === Severity.Major)
          majorIssues += record.count;
        else if (record.maxSeverity === Severity.Minor)
          minorIssues += record.count;
        else if (record.maxSeverity === Severity.Info)
          infoIssues += record.count;
      } else {
        node.color = getColorForSeverity(null);
        node.group = getPackageGroup(node.id);
        node.duplicates = 0;
      }
    });

    graph.metadata = {
      ...graph.metadata,
      criticalIssues,
      majorIssues,
      minorIssues,
      infoIssues,
      tokenBudget: report.scoring?.tokenBudget,
    };

    return graph;
  }
}
