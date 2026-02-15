import { ThemeColors } from '../types';

interface ErrorDisplayProps {
  colors: ThemeColors;
  error: string;
}

export function ErrorDisplay({ colors, error }: ErrorDisplayProps) {
  return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="text-center max-w-md p-6">
        <svg 
          className="w-16 h-16 mx-auto text-amber-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h2 className="text-xl font-semibold mb-2 text-amber-400">No Scan Data Found</h2>
        <p className="mb-4" style={{ color: colors.textMuted }}>{error}</p>
        <div 
          className="text-left p-4 rounded-lg text-sm font-mono" 
          style={{ backgroundColor: colors.cardBg }}
        >
          <p className="text-cyan-400"># Step 1: Run aiready scan</p>
          <p className="mb-2" style={{ color: colors.textMuted }}>pnpm aiready scan . --output json</p>
          <p className="text-cyan-400"># Step 2: Copy to visualizer</p>
          <p style={{ color: colors.textMuted }}>cp .aiready/aiready-scan-*.json packages/visualizer/web/public/report-data.json</p>
        </div>
      </div>
    </div>
  );
}
