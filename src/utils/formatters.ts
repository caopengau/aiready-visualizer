/**
 * Number formatting utilities for data visualization
 */

/**
 * Format a number with commas for thousands
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a number with K/M/B abbreviations
 * @example formatCompactNumber(1234) => "1.2K"
 * @example formatCompactNumber(1234567) => "1.2M"
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a percentage with optional decimal places
 * @example formatPercentage(0.1234) => "12.3%"
 * @example formatPercentage(0.1234, 0) => "12%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size in bytes to human-readable format
 * @example formatFileSize(1024) => "1.0 KB"
 * @example formatFileSize(1048576) => "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @example formatRelativeTime(new Date(Date.now() - 3600000)) => "1 hour ago"
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) {
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  }
  if (diffMonth > 0) {
    return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  }
  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

/**
 * Format a date in short format (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date with time (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format duration in milliseconds to human-readable format
 * @example formatDuration(3661000) => "1h 1m 1s"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format a metric value with appropriate unit and precision
 * Useful for displaying various metrics in charts
 */
export function formatMetric(
  value: number,
  unit: 'number' | 'bytes' | 'percentage' | 'duration' = 'number'
): string {
  switch (unit) {
    case 'bytes':
      return formatFileSize(value);
    case 'percentage':
      return formatPercentage(value);
    case 'duration':
      return formatDuration(value);
    default:
      return formatCompactNumber(value);
  }
}

/**
 * Format a range of values
 * @example formatRange(100, 200) => "100 - 200"
 */
export function formatRange(min: number, max: number): string {
  return `${formatCompactNumber(min)} - ${formatCompactNumber(max)}`;
}

/**
 * Format a number with a specific number of decimal places
 * @example formatDecimal(3.14159, 2) => "3.14"
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}