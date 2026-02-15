import { ThemeColors } from '../types';
import { severityColors, edgeColors } from '../constants';

interface LegendPanelProps {
  colors: ThemeColors;
}

export function LegendPanel({ colors }: LegendPanelProps) {
  return (
    <div className="w-80 border-l flex flex-col gap-5 overflow-auto p-6" style={{ backgroundColor: colors.panel, borderColor: colors.panelBorder }}>
      {/* Severity Legend */}
      <div 
        className="p-6 rounded-2xl border" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      >
        <h3 
          className="text-sm font-bold uppercase tracking-widest mb-6" 
          style={{ color: colors.textMuted }}
        >
          Severity
        </h3>
        <div className="space-y-4">
          {Object.entries(severityColors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-4">
              <span 
                className="w-5 h-5 rounded-full shadow-lg" 
                style={{ 
                  backgroundColor: color, 
                  boxShadow: key !== 'default' ? `0 0 12px ${color}80` : 'none' 
                }} 
              />
              <span className="text-sm font-medium">
                {key === 'default' ? 'No Issues' : key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Legend */}
      <div 
        className="p-6 rounded-2xl border" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      >
        <h3 
          className="text-sm font-bold uppercase tracking-widest mb-6" 
          style={{ color: colors.textMuted }}
        >
          Connections
        </h3>
        <div className="space-y-4">
          {Object.entries(edgeColors)
            .filter(([k]) => k !== 'default' && k !== 'reference')
            .map(([key, color]) => (
              <div key={key} className="flex items-center gap-4">
                <span 
                  className="w-10 h-1 rounded-full" 
                  style={{ backgroundColor: color }} 
                />
                <span className="text-sm font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Node Size Info */}
      <div 
        className="p-6 rounded-2xl border" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      >
        <h3 
          className="text-sm font-bold uppercase tracking-widest mb-3" 
          style={{ color: colors.textMuted }}
        >
          Node Size
        </h3>
        <p 
          className="text-sm" 
          style={{ color: colors.textMuted }}
        >
          Based on token cost + issue count
        </p>
      </div>
    </div>
  );
}
