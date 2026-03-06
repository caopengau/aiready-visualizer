/**
 * Graph builder for the platform - transforms AIReady analysis results into graph data.
 * Refactored from @aiready/visualizer to be environment-agnostic (no fs/path).
 */

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface FileNode {
  id: string;
  label: string;
  value: number;
  color: string;
  title: string;
  duplicates?: number;
  tokenCost?: number;
  severity?: string;
  group?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: FileNode[];
  edges: GraphEdge[];
  metadata?: {
    timestamp: string;
    totalFiles: number;
    totalDependencies: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    infoIssues: number;
  };
}

export class GraphBuilder {
  private nodesMap: Map<string, FileNode>;
  private edges: GraphEdge[];
  private edgesSet: Set<string>;

  constructor() {
    this.nodesMap = new Map();
    this.edges = [];
    this.edgesSet = new Set();
  }

  private cleanPath(filePath: string): string {
    if (!filePath) return '';
    // Clean up /tmp/repo-.../ prefix more robustly
    return filePath
      .replace(/^\/tmp\/repo-[^\/]+\//, '')
      .replace(/^repo-[^\/]+\//, '');
  }

  private normalizeLabel(filePath: string) {
    if (!filePath) return '';
    const cleaned = this.cleanPath(filePath);
    return cleaned.split('/').pop() || cleaned;
  }

  private extractReferencedPaths(message: string): string[] {
    if (!message || typeof message !== 'string') return [];
    // Basic regex for file paths
    const reRel = /(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
    return (message.match(reRel) || []).map((p) =>
      this.cleanPath(p)
    ) as string[];
  }

  private getPackageGroup(fp?: string | null) {
    if (!fp) return undefined;
    const cleaned = this.cleanPath(fp);
    const parts = cleaned.split('/');
    if (parts.length > 1) {
      if (parts[0] === 'packages' && parts.length > 2)
        return `packages/${parts[1]}`;
      return parts[0];
    }
    return 'root';
  }

  addNode(
    id: string,
    title = '',
    value = 5,
    type = 'file',
    tokenCost?: number
  ) {
    if (!id) return;
    const cleanId = this.cleanPath(id);
    if (!this.nodesMap.has(cleanId)) {
      const node: FileNode = {
        id: cleanId,
        label: this.normalizeLabel(cleanId),
        title,
        value: value || 5,
        tokenCost,
        color: type === 'folder' ? '#6366f1' : '#818cf8', // indigo-500 and indigo-400
        group: this.getPackageGroup(cleanId),
      };
      this.nodesMap.set(cleanId, node);
    } else {
      const node = this.nodesMap.get(cleanId)!;
      if (title && !node.title.includes(title)) {
        node.title = (node.title ? node.title + '\n' : '') + title;
      }
      if (value > node.value) node.value = value;
      if (tokenCost && (!node.tokenCost || tokenCost > node.tokenCost)) {
        node.tokenCost = tokenCost;
      }
    }
  }

  addEdge(from: string, to: string, type: string = 'link') {
    if (!from || !to) return;
    const cleanFrom = this.cleanPath(from);
    const cleanTo = this.cleanPath(to);
    if (cleanFrom === cleanTo) return;
    const key = `${cleanFrom}->${cleanTo}`;
    if (!this.edgesSet.has(key)) {
      this.edges.push({ source: cleanFrom, target: cleanTo, type });
      this.edgesSet.add(key);
    }
  }

  static buildFromReport(report: any): GraphData {
    const builder = new GraphBuilder();

    // Support both normalized and raw formats
    const breakdown = report.breakdown || {};
    const raw = report.rawOutput || report;

    const fileIssues: Map<
      string,
      { count: number; maxSeverity: IssueSeverity | null; duplicates: number }
    > = new Map();

    // Track domains/folders to create structural nodes
    const domains = new Set<string>();

    const rankSeverity = (s?: string | null): IssueSeverity | null => {
      if (!s) return null;
      const ss = String(s).toLowerCase();
      if (ss.includes('critical')) return 'critical';
      if (ss.includes('major')) return 'major';
      if (ss.includes('minor')) return 'minor';
      if (ss.includes('info')) return 'info';
      return null;
    };

    const bumpIssue = (file: string, sev?: IssueSeverity | null) => {
      if (!file) return;
      const cleanFile = builder.cleanPath(file);
      if (!fileIssues.has(cleanFile))
        fileIssues.set(cleanFile, {
          count: 0,
          maxSeverity: null,
          duplicates: 0,
        });
      const rec = fileIssues.get(cleanFile)!;
      rec.count += 1;
      if (sev) {
        const order = { critical: 3, major: 2, minor: 1, info: 0 };
        const currentMax = rec.maxSeverity;
        if (!currentMax || order[sev] > order[currentMax])
          rec.maxSeverity = sev;
      }
    };

    const processFileNode = (
      file: string,
      title: string,
      value: number,
      tokenCost?: number
    ) => {
      const cleanFile = builder.cleanPath(file);
      builder.addNode(cleanFile, title, value, 'file', tokenCost);
      const domain = builder.getPackageGroup(cleanFile);
      if (domain) {
        domains.add(domain);
        builder.addEdge(domain, cleanFile, 'structural');
      }
    };

    const processItemWithIssues = (item: any) => {
      const file = item.file || item.fileName || item.location?.file;
      if (!file) return;

      processFileNode(file, 'Issue Hub', 8);

      // Handle nested issues array (AnalysisResult format)
      if (Array.isArray(item.issues)) {
        item.issues.forEach((issue: any) => {
          const sev = rankSeverity(
            typeof issue === 'string' ? null : issue.severity
          );
          bumpIssue(file, sev);
        });
      } else {
        // Direct issue object format
        const sev = rankSeverity(item.severity);
        bumpIssue(file, sev);
      }
    };

    // 1. Semantic Duplicates
    // Every tool now lives under its camelCase name in 'raw'
    const patternData = raw.patternDetect || raw.patterns || {};
    const dupDetails =
      breakdown.semanticDuplicates?.details ||
      (Array.isArray(patternData.results) ? patternData.results : []) ||
      patternData.duplicates ||
      raw.duplicates ||
      [];
    dupDetails.forEach((dup: any) => {
      // Support both raw DuplicatePattern and AnalysisResult with issues
      const f1 = dup.file1 || dup.fileName || dup.file || dup.location?.file;
      const f2 = dup.file2;

      // Calculate severity for the duplicate itself if it's a raw pattern
      const dupSev: IssueSeverity | null = dup.severity
        ? rankSeverity(dup.severity)
        : dup.similarity
          ? dup.similarity > 0.95
            ? 'critical'
            : dup.similarity > 0.9
              ? 'major'
              : 'minor'
          : null;

      if (f1) {
        processFileNode(f1, 'Semantic Pattern', 8);
        const cleanF1 = builder.cleanPath(f1);
        if (!fileIssues.has(cleanF1))
          fileIssues.set(cleanF1, {
            count: 0,
            maxSeverity: null,
            duplicates: 0,
          });
        fileIssues.get(cleanF1)!.duplicates += 1;

        if (Array.isArray(dup.issues)) {
          dup.issues.forEach((issue: any) =>
            bumpIssue(f1, rankSeverity(issue.severity))
          );
        } else {
          bumpIssue(f1, dupSev);
        }
      }

      if (f2) {
        processFileNode(f2, 'Semantic Pattern', 8);
        const cleanF2 = builder.cleanPath(f2);
        if (!fileIssues.has(cleanF2))
          fileIssues.set(cleanF2, {
            count: 0,
            maxSeverity: null,
            duplicates: 0,
          });
        fileIssues.get(cleanF2)!.duplicates += 1;

        // For f2, we only bump the duplicate issue itself
        bumpIssue(f2, dupSev);

        if (f1) builder.addEdge(f1, f2, 'similarity');
      }
    });

    // 2. Context & Dependencies (The "Knowledge" part)
    // The raw contextAnalyzer output has per-file tokenCost data.
    // The normalized breakdown.contextFragmentation.details only has issue messages (no file/cost).
    // So we always prefer rawOutput.contextAnalyzer.results.
    const rawCtxData = raw.contextAnalyzer || raw.context || {};
    const ctxResults: any[] =
      rawCtxData.results ||
      rawCtxData.issues ||
      (Array.isArray(rawCtxData) ? rawCtxData : []);

    const chains = rawCtxData.summary?.chains || rawCtxData.chains || [];

    // Build comprehensive token cost map from all sources
    const fileTokenCosts = new Map<string, number>();

    // Source 1: chains from context analyzer
    chains.forEach((c: any) => {
      if (c.file && (c.contextCost || c.tokenCost)) {
        fileTokenCosts.set(
          builder.cleanPath(c.file),
          c.contextCost || c.tokenCost
        );
      }
    });

    // Source 2: ctxResults items (primary source - each has file + tokenCost)
    ctxResults.forEach((ctx: any) => {
      const file = ctx.file || ctx.fileName;
      if (!file) return;
      const cleanFile = builder.cleanPath(file);
      const cost = ctx.tokenCost || ctx.contextBudget || ctx.contextCost;
      if (cost != null && !fileTokenCosts.has(cleanFile)) {
        fileTokenCosts.set(cleanFile, cost);
      }
    });

    // Process each file from context results for graph nodes + dependency edges
    ctxResults.forEach((ctx: any) => {
      const file = ctx.file || ctx.fileName;
      if (!file) return;
      const cleanFile = builder.cleanPath(file);
      const contextBudget = fileTokenCosts.get(cleanFile);

      processFileNode(
        file,
        `Knowledge Hub (Deps: ${ctx.dependencyCount || 0})`,
        12,
        contextBudget
      );

      // Reuse unified handler
      processItemWithIssues(ctx);

      (ctx.dependencyList || []).forEach((dep: string) => {
        if (dep.startsWith('.') || dep.startsWith('@aiready')) {
          builder.addNode(dep, 'Internal Dependency', 4);
          builder.addEdge(file, dep, 'dependency');
        }
      });
    });

    // 3. Generic Issues (naming, signal, etc.)
    Object.entries(breakdown).forEach(([key, tool]: [string, any]) => {
      if (key === 'semanticDuplicates' || key === 'contextFragmentation')
        return;

      (tool.details || []).forEach((item: any) => {
        processItemWithIssues(item);
      });
    });

    // Add structural domain nodes
    domains.forEach((domain) => {
      builder.addNode(domain, 'Architectural Domain', 100, 'folder');
    });

    const colorFor = (sev: IssueSeverity | null) => {
      switch (sev) {
        case 'critical':
          return '#ff4d4f';
        case 'major':
          return '#fbbf24'; // Brighter amber
        case 'minor':
          return '#fde047'; // Brighter yellow
        case 'info':
          return '#38bdf8'; // Brighter sky blue
        default:
          return '#818cf8'; // Brighter indigo for healthy
      }
    };

    let criticalIssues = 0,
      majorIssues = 0,
      minorIssues = 0,
      infoIssues = 0;

    const nodes = Array.from((builder as any).nodesMap.values()) as FileNode[];
    for (const node of nodes) {
      // Don't override folder colors with issue colors for now
      const isFolder = builder.edges.some(
        (e) => e.source === node.id && e.type === 'structural'
      );
      if (isFolder) {
        node.color = '#6366f1'; // Indigo-500 for domains
        node.severity = 'healthy';
        continue;
      }

      const rec = fileIssues.get(node.id);
      if (rec) {
        node.duplicates = rec.duplicates;
        node.color = colorFor(rec.maxSeverity);
        node.severity = rec.maxSeverity || 'healthy';

        if (rec.maxSeverity === 'critical') criticalIssues += rec.count;
        else if (rec.maxSeverity === 'major') majorIssues += rec.count;
        else if (rec.maxSeverity === 'minor') minorIssues += rec.count;
        else if (rec.maxSeverity === 'info') infoIssues += rec.count;
      } else {
        node.severity = 'healthy';
        if (!node.color) node.color = '#97c2fc';
      }

      // Backfill tokenCost from our comprehensive map if not already set
      if (node.tokenCost == null && fileTokenCosts.has(node.id)) {
        node.tokenCost = fileTokenCosts.get(node.id);
      }
    }

    return {
      nodes,
      edges: (builder as any).edges,
      metadata: {
        timestamp: new Date().toISOString(),
        totalFiles: nodes.length,
        totalDependencies: (builder as any).edges.filter(
          (e: any) => e.type === 'dependency'
        ).length,
        criticalIssues,
        majorIssues,
        minorIssues,
        infoIssues,
      },
    };
  }
}
