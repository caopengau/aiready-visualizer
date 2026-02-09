/**
 * Color utilities for charts and visualizations
 */

// Severity colors for issue highlighting
export const severityColors = {
  critical: '#ef4444', // red-500
  major: '#f59e0b', // amber-500
  minor: '#eab308', // yellow-500
  info: '#60a5fa', // blue-400
} as const;

// Domain colors for clustering and categorization
export const domainColors = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
] as const;

// Chart colors
export const chartColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
} as const;

/**
 * Get a color for a domain/category by index
 */
export function getDomainColor(index: number): string {
  return domainColors[index % domainColors.length];
}

/**
 * Get severity color by level
 */
export function getSeverityColor(
  severity: keyof typeof severityColors
): string {
  return severityColors[severity];
}

/**
 * Convert hex color to RGBA
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}