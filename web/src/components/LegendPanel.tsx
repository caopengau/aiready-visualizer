import { ThemeColors } from '../types';
import { severityColors, edgeColors } from '../constants';

interface LegendPanelProps {
  colors: ThemeColors;
}

export function LegendPanel({ colors }: LegendPanelProps) {
  return (
    <div className="w-56 border-l flex flex-col gap-4 overflow-auto p-4" style={{ backgroundColor: colors.panel, borderColor: colors.panelBorder }}>
      {/* Severity Legend */}
      <div 
        className="p-4 rounded-2xl border" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      >
        <h3 
          className="text-xs font-bold uppercase tracking-widest mb-4" 
          style={{ color: colors.textMuted }}
        >
          Severity
        </h3>
        <div className="space-y-2">
          {Object.entries(severityColors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-3">
              <span 
                className="w-4 h-4 rounded-full shadow-lg" 
                style={{ 
                  backgroundColor: color, 
                  boxShadow: key !== 'default' ? `0 0 8px ${color}80` : 'none' 
                }} 
              />
              <span className="text-xs font-medium">
                {key === 'default' ? 'No Issues' : key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Legend */}
      <div 
        className="p-4 rounded-2xl border" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      >
        <h3 
          className="text-xs font-bold uppercase tracking-widest mb-4" 
          style={{ color: colors.textMuted }}
        >
          Connections
        </h3>
        <div className="space-y-2">
          {Object.entries(edgeColors)
            .filter(([k]) => k !== 'default' && k !== 'reference')
            .map(([key, color]) => (
              <div key={key} className="flex items-center gap-3">
                <span 
                  className="w-8 h-0.5 rounded-full" 
                  style={{ backgroundColor: color }} 
                />
                <span className="text-xs font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Node Size Info */}
      <div 
        className="p-4 rounded-2xl border" 
        style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      >
        <h3 
          className="text-xs font-bold uppercase tracking-widest mb-2" 
          style={{ color: colors.textMuted }}
        >
          Node Size
        </h3>
        <p 
          className="text-xs" 
          style={{ color: colors.textMuted }}
        >
          Token cost + issue count
        </p>
      </div>
    </div>
  );
}
