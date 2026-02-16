import { FileNode, GraphEdge, GraphData, ReportData } from './types';
import { severityColors, GRAPH_CONFIG } from './constants';

export function getSeverityColor(severity: string | undefined): string {
  if (!severity) return severityColors.default;
  const s = severity.toLowerCase();
  if (s === 'critical') return severityColors.critical;
  if (s === 'major') return severityColors.major;
  if (s === 'minor') return severityColors.minor;
  if (s === 'info') return severityColors.info;
  return severityColors.default;
}

export function transformReportToGraph(report: ReportData): GraphData {
  const nodes: FileNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, FileNode>();

  const fileIssues = new Map<string, { count: number; severities: Set<string>; maxSeverity: string }>();

  for (const pattern of report.patterns) {
    const issueCount = pattern.issues?.length || 0;
    if (issueCount > 0) {
      let maxSeverity = 'info';
      const severityPriority: Record<string, number> = { critical: 4, major: 3, minor: 2, info: 1 };
      for (const issue of pattern.issues) {
        if ((severityPriority[issue.severity] || 0) > (severityPriority[maxSeverity] || 0)) {
          maxSeverity = issue.severity;
        }
      }
      fileIssues.set(pattern.fileName, { count: issueCount, severities: new Set(), maxSeverity });
    }
  }

  for (const ctx of report.context) {
    const issues = fileIssues.get(ctx.file);
    const severity = issues?.maxSeverity || ctx.severity || 'default';
    const tokenCost = ctx.tokenCost || 0;

    const titleLines = [
      `Token Cost: ${tokenCost}`,
      `Lines of Code: ${ctx.linesOfCode}`,
      `Dependencies: ${ctx.dependencyCount}`,
    ];

    if (issues) {
      titleLines.push(`Issues: ${issues.count}`);
      titleLines.push(`Severity: ${issues.maxSeverity}`);
    }

    if (ctx.issues && ctx.issues.length > 0) {
      titleLines.push('', ...ctx.issues.slice(0, 3));
    }

    const node: FileNode = {
      id: ctx.file,
      label: ctx.file.split('/').pop() || ctx.file,
      value: Math.max(10, Math.sqrt(tokenCost) * 3 + (issues?.count || 0) * 10),
      color: getSeverityColor(severity),
      title: titleLines.join('\n'),
      duplicates: issues?.count,
      tokenCost,
      severity,
    };

    nodes.push(node);
    nodeMap.set(ctx.file, node);
  }

  for (const ctx of report.context) {
    const sourceDir = ctx.file.substring(0, ctx.file.lastIndexOf('/'));
    for (const dep of ctx.dependencyList || []) {
      if (dep.startsWith('.') || dep.startsWith('/')) {
        // Try multiple matching strategies
        let targetFile: string | undefined;
        
        // Strategy 1: Direct resolve from source file's directory
        const normalizedDep = dep.replace(/^\.\/?/, '');
        const possiblePaths = [
          // With extensions
          `${sourceDir}/${normalizedDep}.ts`,
          `${sourceDir}/${normalizedDep}.tsx`,
          `${sourceDir}/${normalizedDep}/index.ts`,
          `${sourceDir}/${normalizedDep}/index.tsx`,
          // Just the path
          `${sourceDir}/${normalizedDep}`,
        ];
        
        for (const p of possiblePaths) {
          if (nodeMap.has(p)) {
            targetFile = p;
            break;
          }
        }
        
        // Strategy 2: Fall back to loose endsWith matching
        if (!targetFile) {
          const depBase = normalizedDep.split('/').pop() || normalizedDep;
          targetFile = [...nodeMap.keys()].find(k => 
            k.endsWith(`/${depBase}.ts`) || k.endsWith(`/${depBase}.tsx`) ||
            k.endsWith(`/${depBase}/index.ts`) || k.endsWith(`/${depBase}/index.tsx`)
          );
        }
        
        if (targetFile && targetFile !== ctx.file) {
          edges.push({ source: ctx.file, target: targetFile, type: 'dependency' });
        }
      }
    }

    for (const related of ctx.relatedFiles || []) {
      if (nodeMap.has(related) && related !== ctx.file) {
        const exists = edges.some(
          e =>
            (e.source === ctx.file && e.target === related) ||
            (e.source === related && e.target === ctx.file)
        );
        if (!exists) edges.push({ source: ctx.file, target: related, type: 'related' });
      }
    }
  }

  for (const dup of report.duplicates || []) {
    if (nodeMap.has(dup.file1) && nodeMap.has(dup.file2)) {
      const exists = edges.some(
        e =>
          (e.source === dup.file1 && e.target === dup.file2) ||
          (e.source === dup.file2 && e.target === dup.file1)
      );
      if (!exists) edges.push({ source: dup.file1, target: dup.file2, type: 'similarity' });
    }
  }

  // Sort edges by priority: similarity and dependency first (most important for visualization)
  const edgePriority: Record<string, number> = {
    similarity: 1,
    dependency: 2,
    reference: 3,
    related: 4,
  };
  const sortedEdges = [...edges].sort((a, b) => {
    const priorityA = edgePriority[a.type] || 99;
    const priorityB = edgePriority[b.type] || 99;
    return priorityA - priorityB;
  });

  return {
    nodes: nodes.slice(0, GRAPH_CONFIG.maxNodes),
    edges: sortedEdges.slice(0, GRAPH_CONFIG.maxEdges),
  };
}

export async function loadReportData(): Promise<ReportData | null> {
  const possiblePaths = ['/report-data.json', '../report-data.json', '../../report-data.json'];

  for (const path of possiblePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function getEdgeDistance(type: string): number {
  return GRAPH_CONFIG.edgeDistances[type as keyof typeof GRAPH_CONFIG.edgeDistances] ?? GRAPH_CONFIG.edgeDistances.dependency;
}

export function getEdgeStrength(type: string): number {
  return GRAPH_CONFIG.edgeStrengths[type as keyof typeof GRAPH_CONFIG.edgeStrengths] ?? GRAPH_CONFIG.edgeStrengths.dependency;
}

export function getEdgeOpacity(type: string): number {
  return GRAPH_CONFIG.edgeOpacities[type as keyof typeof GRAPH_CONFIG.edgeOpacities] ?? GRAPH_CONFIG.edgeOpacities.dependency;
}

export function getEdgeStrokeWidth(type: string): number {
  return type === 'similarity' ? 2 : 1;
}
