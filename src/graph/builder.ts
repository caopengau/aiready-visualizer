/**
 * Graph builder - transforms AIReady analysis results into graph data
 */

import fs from 'fs';
import path from 'path';
import { Severity, UnifiedReportSchema, ToolName } from '@aiready/core';
import type { GraphData, FileNode, DependencyEdge } from '../types';

/**
 * GraphBuilder: programmatic builder and report-based builder
 */
export class GraphBuilder {
  rootDir: string;
  private nodesMap: Map<string, FileNode>;
  private edges: DependencyEdge[];
  private edgesSet: Set<string>;

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.nodesMap = new Map();
    this.edges = [];
    this.edgesSet = new Set();
  }

  private normalizeLabel(filePath: string) {
    try {
      return path.relative(this.rootDir, filePath);
    } catch {
      return filePath;
    }
  }

  private extractReferencedPaths(message: string): string[] {
    if (!message || typeof message !== 'string') return [];
    const reAbs = /\/(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
    const reRel =
      /(?:\.\/|\.\.\/)(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
    const abs = (message.match(reAbs) || []) as string[];
    const rel = (message.match(reRel) || []) as string[];
    return abs.concat(rel);
  }

  private getPackageGroup(fp?: string | null) {
    if (!fp) return null;
    const parts = fp.split(path.sep);
    const pkgIdx = parts.indexOf('packages');
    if (pkgIdx >= 0 && parts.length > pkgIdx + 1)
      return `packages/${parts[pkgIdx + 1]}`;
    const landingIdx = parts.indexOf('landing');
    if (landingIdx >= 0) return 'landing';
    const scriptsIdx = parts.indexOf('scripts');
    if (scriptsIdx >= 0) return 'scripts';
    return parts.length > 1 ? parts[1] : parts[0];
  }

  addNode(file: string, title = '', value = 1) {
    if (!file) return;
    const id = path.resolve(this.rootDir, file);
    if (!this.nodesMap.has(id)) {
      const node = {
        id,
        path: id,
        label: this.normalizeLabel(id),
        title,
        size: value || 1,
      } as any;
      this.nodesMap.set(id, node as FileNode);
    } else {
      const node = this.nodesMap.get(id)! as any;
      if (title && (!node.title || !node.title.includes(title))) {
        node.title = (node.title ? node.title + '\n' : '') + title;
      }
      if (value > (node.size || 0)) node.size = value;
    }
  }

  addEdge(from: string, to: string, type: string = 'link') {
    if (!from || !to) return;
    const a = path.resolve(this.rootDir, from);
    const b = path.resolve(this.rootDir, to);
    if (a === b) return;
    const key = `${a}->${b}`;
    if (!this.edgesSet.has(key)) {
      this.edges.push({ source: a, target: b, type: type as any });
      this.edgesSet.add(key);
    }
  }

  /**
   * Build final GraphData
   */
  build(): GraphData {
    const nodes = Array.from(this.nodesMap.values());
    const edges = this.edges.map(
      (e) =>
        ({ source: e.source, target: e.target, type: e.type }) as DependencyEdge
    );
    return {
      nodes,
      edges,
      clusters: [],
      issues: [],
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
   * Static helper to build graph from an aiready report JSON (ports logic from tools/generate_from_report.cjs)
   */
  static buildFromReport(report: any, rootDir = process.cwd()): GraphData {
    // Optional: Validate report with Zod schema if needed, but allow partials for visualizer
    const validation = UnifiedReportSchema.safeParse(report);
    if (!validation.success) {
      console.warn(
        'Visualizer: Report does not fully match UnifiedReportSchema, proceeding with best-effort parsing.'
      );
    }

    const builder = new GraphBuilder(rootDir);

    // Map to collect per-file issue aggregates
    const fileIssues: Map<
      string,
      { count: number; maxSeverity: Severity | null; duplicates: number }
    > = new Map();

    const rankSeverity = (s?: string | null): Severity | null => {
      if (!s) return null;
      const ss = String(s).toLowerCase();
      if (ss.includes('critical')) return Severity.Critical;
      if (ss.includes('major')) return Severity.Major;
      if (ss.includes('minor')) return Severity.Minor;
      if (ss.includes('info')) return Severity.Info;
      return null;
    };

    const bumpIssue = (file: string, sev?: Severity | null) => {
      if (!file) return;
      const id = path.resolve(rootDir, file);
      if (!fileIssues.has(id))
        fileIssues.set(id, { count: 0, maxSeverity: null, duplicates: 0 });
      const rec = fileIssues.get(id)!;
      rec.count += 1;
      if (sev) {
        const order = {
          [Severity.Critical]: 3,
          [Severity.Major]: 2,
          [Severity.Minor]: 1,
          [Severity.Info]: 0,
        } as Record<Severity, number>;
        if (!rec.maxSeverity || order[sev] > order[rec.maxSeverity])
          rec.maxSeverity = sev;
      }
    };

    // Helper to get results array from various possible formats
    const getResults = (toolKey: string, legacyKey?: string) => {
      const camelKey = toolKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const toolData =
        report[toolKey] ||
        report[camelKey] ||
        (legacyKey ? report[legacyKey] : undefined);
      if (!toolData) return [];
      if (Array.isArray(toolData)) return toolData;
      return toolData.results || toolData.issues || [];
    };

    // Pre-scan for basenames
    const basenameMap = new Map<string, Set<string>>();
    const patternResults = getResults(ToolName.PatternDetect, 'patterns');
    patternResults.forEach((p: any) => {
      const fileName = p.fileName || p.file;
      if (fileName) {
        const base = path.basename(fileName);
        if (!basenameMap.has(base)) basenameMap.set(base, new Set());
        basenameMap.get(base)!.add(fileName);
      }
    });

    // 1. Process patterns
    patternResults.forEach((entry: any) => {
      const file = entry.fileName || entry.file;
      if (!file) return;

      builder.addNode(
        file,
        `Issues: ${(entry.issues || []).length}`,
        (entry.metrics && entry.metrics.tokenCost) || 5
      );

      // record aggregate for this file
      if ((entry.issues || []).length > 0) {
        (entry.issues || []).forEach((issue: any) => {
          const sev = rankSeverity(
            issue.severity || issue.severityLevel || null
          );
          bumpIssue(file, sev);
        });
      }

      (entry.issues || []).forEach((issue: any) => {
        const message = issue.message || '';

        // Path extraction
        const refs = builder.extractReferencedPaths(message);
        refs.forEach((ref) => {
          let target = ref;
          if (!path.isAbsolute(ref)) {
            target = path.resolve(path.dirname(file), ref);
          }
          builder.addNode(target, 'Referenced file', 5);
          builder.addEdge(file, target, 'reference');
        });

        // Fuzzy matching heuristics
        const percMatch = (message.match(/(\d+)%/) || [])[1];
        const perc = percMatch ? parseInt(percMatch, 10) : null;
        const wantFuzzy =
          issue.type === 'duplicate-pattern' ||
          /similar/i.test(message) ||
          (perc && perc >= 50);
        if (wantFuzzy) {
          const fileGroup = builder.getPackageGroup(file as any);
          for (const [base, pathsSet] of basenameMap.entries()) {
            if (!message.includes(base) || base === path.basename(file))
              continue;
            for (const target of pathsSet) {
              const targetGroup = builder.getPackageGroup(target as any);
              if (fileGroup !== targetGroup && !(perc && perc >= 80)) continue;
              builder.addNode(target, 'Fuzzy match', 5);
              builder.addEdge(file, target, 'similarity');
            }
          }
        }
      });
    });

    // 2. Duplicates
    const patternData =
      report[ToolName.PatternDetect] ||
      report.patternDetect ||
      report.patterns ||
      {};

    // In unified reports, duplicates are often under summary.
    // We check both root of tool data and summary.
    const duplicates =
      (Array.isArray(patternData.duplicates) ? patternData.duplicates : null) ||
      (patternData.summary && Array.isArray(patternData.summary.duplicates)
        ? patternData.summary.duplicates
        : null) ||
      (Array.isArray(report.duplicates) ? report.duplicates : []);

    duplicates.forEach((dup: any) => {
      builder.addNode(dup.file1, 'Similarity target', 5);
      builder.addNode(dup.file2, 'Similarity target', 5);
      builder.addEdge(dup.file1, dup.file2, 'similarity');
      // count duplicates as issues (no explicit severity available)
      const f1 = path.resolve(rootDir, dup.file1);
      const f2 = path.resolve(rootDir, dup.file2);
      if (!fileIssues.has(f1))
        fileIssues.set(f1, { count: 0, maxSeverity: null, duplicates: 0 });
      if (!fileIssues.has(f2))
        fileIssues.set(f2, { count: 0, maxSeverity: null, duplicates: 0 });
      fileIssues.get(f1)!.duplicates += 1;
      fileIssues.get(f2)!.duplicates += 1;
    });

    // 3. Context: dependencies and related files
    const contextResults = getResults(ToolName.ContextAnalyzer, 'context');
    contextResults.forEach((ctx: any) => {
      // Handle context analyzer results (which use 'file' instead of 'fileName')
      const file = ctx.fileName || ctx.file;
      if (!file) return;

      builder.addNode(file, `Deps: ${ctx.dependencyCount || 0}`, 10);

      // context-level issues
      if (ctx.issues && Array.isArray(ctx.issues)) {
        ctx.issues.forEach((issue: any) => {
          const sev = rankSeverity(
            typeof issue === 'string'
              ? ctx.severity
              : issue.severity || issue.severityLevel || null
          );
          bumpIssue(file, sev);
        });
      }

      // Add related files
      (ctx.relatedFiles || []).forEach((rel: string) => {
        const resolvedRel = path.isAbsolute(rel)
          ? rel
          : path.resolve(path.dirname(file), rel);
        const keyA = `${path.resolve(builder.rootDir, file)}->${path.resolve(builder.rootDir, resolvedRel)}`;
        const keyB = `${path.resolve(builder.rootDir, resolvedRel)}->${path.resolve(builder.rootDir, file)}`;
        if (
          (builder as any).edgesSet.has(keyA) ||
          (builder as any).edgesSet.has(keyB)
        )
          return;
        builder.addNode(resolvedRel, 'Related file', 5);
        // bump size to reflect relatedness
        const n = (builder as any).nodesMap.get(
          path.resolve(builder.rootDir, resolvedRel)
        );
        if (n) n.size = (n.size || 1) + 2;
        try {
          builder.addEdge(file, resolvedRel, 'related');
        } catch {
          // ignore any edge errors
        }
      });

      const absoluteFile = path.resolve(builder.rootDir, file);
      const fileDir = path.dirname(absoluteFile);
      (ctx.dependencyList || []).forEach((dep: string) => {
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
              builder.addNode(p, 'Dependency', 2);
              builder.addEdge(file, p, 'dependency');
              break;
            }
          }
        }
      });
    });

    // 4. Doc Drift
    const docDriftResults = getResults(ToolName.DocDrift, 'docDrift');
    docDriftResults.forEach((issue: any) => {
      const file = issue.fileName || issue.location?.file;
      if (file) {
        builder.addNode(file, 'Doc-Drift Issue', 5);
        const sev = rankSeverity(issue.severity || null);
        bumpIssue(file, sev);
      }
    });

    // 5. Dependencies
    const depsResults = getResults(
      ToolName.DependencyHealth,
      'dependencyHealth'
    );
    depsResults.forEach((issue: any) => {
      const file = issue.fileName || issue.location?.file;
      if (file) {
        builder.addNode(file, 'Dependency Issue', 5);
        const sev = rankSeverity(issue.severity || null);
        bumpIssue(file, sev);
      }
    });

    // Finalize nodes: assign colors and duplicate counts based on collected issue data
    const nodes = Array.from((builder as any).nodesMap.values()) as FileNode[];
    const edges = (builder as any).edges as DependencyEdge[];

    // Color mapping by highest severity
    const colorFor = (sev: Severity | null) => {
      switch (sev) {
        case Severity.Critical:
          return '#ff4d4f'; // red
        case Severity.Major:
          return '#ff9900'; // orange
        case Severity.Minor:
          return '#ffd666'; // yellow
        case Severity.Info:
          return '#91d5ff'; // light blue
        default:
          return '#97c2fc'; // default blue
      }
    };

    // Populate node-level visual props and metadata counters
    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;
    let infoIssues = 0;

    for (const node of nodes) {
      const n = node as any;
      const rec = fileIssues.get(n.id);
      if (rec) {
        n.duplicates = rec.duplicates || 0;
        // choose color by maxSeverity
        n.color = colorFor(rec.maxSeverity);
        // assign package group for boundary drawing
        n.group = builder.getPackageGroup(n.id as any) || undefined;
        // increment metadata counts by severity seen on this file
        if (rec.maxSeverity === Severity.Critical) criticalIssues += rec.count;
        else if (rec.maxSeverity === Severity.Major) majorIssues += rec.count;
        else if (rec.maxSeverity === Severity.Minor) minorIssues += rec.count;
        else if (rec.maxSeverity === Severity.Info) infoIssues += rec.count;
      } else {
        n.color = colorFor(null);
        n.group = builder.getPackageGroup(n.id as any) || undefined;
        n.duplicates = 0;
      }
    }

    const graph: GraphData = {
      nodes,
      edges,
      clusters: [],
      issues: [],
      metadata: {
        timestamp: new Date().toISOString(),
        totalFiles: nodes.length,
        totalDependencies: edges.length,
        analysisTypes: [],
        criticalIssues,
        majorIssues,
        minorIssues,
        infoIssues,
        tokenBudget: report.scoring?.tokenBudget,
      },
    };

    return graph;
  }
}

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
