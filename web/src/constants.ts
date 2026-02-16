import { ThemeColors } from './types';

export const severityColors: Record<string, string> = {
  critical: '#ff4d4f',
  major: '#ff9900',
  minor: '#ffd666',
  info: '#91d5ff',
  default: '#97c2fc',
};

export const edgeColors: Record<string, string> = {
  similarity: '#fb7e81',
  dependency: '#84c1ff',
  reference: '#ffa500',
  related: '#6b7280',
  default: '#848484',
};

export const themeConfig: Record<'dark' | 'light', ThemeColors> = {
  dark: {
    bg: '#000000',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    panel: '#020617',
    panelBorder: '#1e293b',
    cardBg: '#0f172a',
    cardBorder: '#1e293b',
    grid: 'rgba(30,41,59,0.3)',
  },
  light: {
    bg: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    panel: '#ffffff',
    panelBorder: '#e2e8f0',
    cardBg: '#f8fafc',
    cardBorder: '#e2e8f0',
    grid: 'rgba(203,213,225,0.4)',
  },
};

export const GRAPH_CONFIG = {
  maxNodes: 200,
  maxEdges: 300,
  nodeBaseRadius: 3,
  collisionRadius: 25,
  zoomMin: 0.1,
  zoomMax: 4,
  edgeDistances: {
    similarity: 80,
    related: 150,
    dependency: 100,
  },
  edgeStrengths: {
    similarity: 0.5,
    related: 0.1,
    dependency: 0.3,
  },
  edgeOpacities: {
    similarity: 0.8,
    related: 0.2,
    dependency: 0.5,
  },
  simulation: {
    chargeStrength: -200,
    centerStrength: 0.1,
  },
};
