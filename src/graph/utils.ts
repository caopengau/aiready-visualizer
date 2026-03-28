/**
 * Graph builder utilities
 */

import path from 'path';
import { Severity, normalizeSeverity } from '@aiready/core';

/**
 * Constants for graph building
 */
export const GRAPH_CONSTANTS = {
  DEFAULT_NODE_SIZE: 1,
  DEFAULT_REFERENCE_SIZE: 5,
  DEFAULT_DEPENDENCY_SIZE: 2,
  DEFAULT_CONTEXT_SIZE: 10,
  FUZZY_MATCH_THRESHOLD: 50,
  FUZZY_MATCH_HIGH_THRESHOLD: 80,
  COLORS: {
    CRITICAL: '#ff4d4f',
    MAJOR: '#ff9900',
    MINOR: '#ffd666',
    INFO: '#91d5ff',
    DEFAULT: '#97c2fc',
  },
  SEVERITY_ORDER: {
    [Severity.Critical]: 3,
    [Severity.Major]: 2,
    [Severity.Minor]: 1,
    [Severity.Info]: 0,
  } as Record<Severity, number>,
};

/**
 * Normalizes a file path relative to a root directory for labels.
 */
export function normalizeLabel(filePath: string, rootDir: string): string {
  try {
    return path.relative(rootDir, filePath);
  } catch {
    return filePath;
  }
}

/**
 * Extracts absolute and relative file paths from a message string.
 */
export function extractReferencedPaths(message: string): string[] {
  if (!message || typeof message !== 'string') return [];
  const reAbs = /\/(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
  const reRel =
    /(?:\.\/|\.\.\/)(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
  const abs = (message.match(reAbs) ?? []) as string[];
  const rel = (message.match(reRel) ?? []) as string[];
  return abs.concat(rel);
}

/**
 * Determines the package or module group for a given file path.
 */
export function getPackageGroup(
  fp: string | null | undefined
): string | undefined {
  if (!fp) return undefined;
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

/**
 * Ranks severity from a string or null.
 */
export function rankSeverity(s: string | null | undefined): Severity | null {
  return normalizeSeverity(s || undefined);
}

/**
 * Returns a color string for a given severity.
 */
export function getColorForSeverity(sev: Severity | null): string {
  switch (sev) {
    case Severity.Critical:
      return GRAPH_CONSTANTS.COLORS.CRITICAL;
    case Severity.Major:
      return GRAPH_CONSTANTS.COLORS.MAJOR;
    case Severity.Minor:
      return GRAPH_CONSTANTS.COLORS.MINOR;
    case Severity.Info:
      return GRAPH_CONSTANTS.COLORS.INFO;
    default:
      return GRAPH_CONSTANTS.COLORS.DEFAULT;
  }
}
