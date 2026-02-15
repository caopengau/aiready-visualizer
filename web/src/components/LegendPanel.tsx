import { ThemeColors } from '../types';
import { severityColors, edgeColors } from '../constants';

// Legend Item Component with improved visibility
function LegendItem({ 
  color, 
  label, 
  isGlow = false,
  isLine = false,
  colors
}: { 
  color: string; 
  label: string;
  isGlow?: boolean;
  isLine?: boolean;
  colors: ThemeColors;
}) {
  return (
    <div className="flex items-center gap-3 group cursor-default py-1.5 px-2 rounded-lg transition-colors hover:bg-white/10">
      {isLine ? (
        <span 
          className="w-10 h-1 rounded-full transition-transform group-hover:scale-y-150" 
          style={{ backgroundColor: color }} 
        />
      ) : (
        <span 
          className={`w-4 h-4 rounded-full transition-transform group-hover:scale-125 ${isGlow ? 'shadow-lg' : ''}`}
          style={{ 
            backgroundColor: color, 
            boxShadow: isGlow ? `0 0 10px ${color}90` : 'none' 
          }} 
        />
      )}
      <span 
        className="text-xs font-medium transition-colors"
        style={{ color: colors.textMuted }}
      >
        {label}
      </span>
    </div>
  );
}

interface LegendPanelProps {
  colors: ThemeColors;
}

export function LegendPanel({ colors }: LegendPanelProps) {
  return (
    <div 
      className="w-64 border-l flex flex-col gap-6 overflow-auto p-6" 
      style={{ 
        backgroundColor: colors.panel, 
        borderColor: colors.panelBorder 
      }}
    >
      {/* Header */}
      <div className="mb-2">
        <h2 
          className="text-base font-bold tracking-wide" 
          style={{ color: colors.text }}
        >
          Legend
        </h2>
        <div 
          className="h-0.5 w-12 mt-2 rounded-full" 
          style={{ backgroundColor: colors.cardBorder }}
        />
      </div>

      {/* Severity Legend - No border, just sections */}
      <div className="space-y-5">
        <h3 
          className="text-xs font-bold uppercase tracking-widest pl-2" 
          style={{ color: colors.textMuted }}
        >
          Severity
        </h3>
        <div className="grid grid-cols-1 gap-1 pl-2 pr-1">
          {Object.entries(severityColors).map(([key, color]) => (
            <LegendItem 
              key={key}
              color={color}
              label={key === 'default' ? 'No Issues' : key.charAt(0).toUpperCase() + key.slice(1)}
              isGlow={key !== 'default'}
              colors={colors}
            />
          ))}
        </div>
      </div>

      {/* Connections Legend */}
      <div className="space-y-5">
        <h3 
          className="text-xs font-bold uppercase tracking-widest pl-2" 
          style={{ color: colors.textMuted }}
        >
          Connections
        </h3>
        <div className="grid grid-cols-1 gap-1 pl-2 pr-1">
          {Object.entries(edgeColors)
            .filter(([k]) => k !== 'default' && k !== 'reference')
            .map(([key, color]) => (
              <LegendItem 
                key={key}
                color={color}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                isLine
                colors={colors}
              />
            ))}
        </div>
      </div>

      {/* Node Size Info */}
      <div className="space-y-5">
        <h3 
          className="text-xs font-bold uppercase tracking-widest pl-1" 
          style={{ color: colors.textMuted }}
        >
          Node Size
        </h3>
        <p 
          className="text-xs leading-relaxed" 
          style={{ color: colors.textMuted }}
        >
          Larger nodes indicate higher <span className="text-cyan-400 font-medium">token cost</span> and more <span className="text-purple-400 font-medium">issues</span>.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <div className="flex -space-x-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 border-2" style={{ borderColor: colors.panel }} />
            <span className="w-5 h-5 rounded-full bg-cyan-400 border-2" style={{ borderColor: colors.panel }} />
            <span className="w-7 h-7 rounded-full bg-cyan-400 border-2" style={{ borderColor: colors.panel }} />
          </div>
          <span className="text-xs" style={{ color: colors.textMuted }}>→</span>
          <span className="text-xs font-medium" style={{ color: colors.text }}>More Impact</span>
        </div>
      </div>

      {/* Quick Tips */}
      <div 
        className="p-4 rounded-xl mt-2"
        style={{ 
          backgroundColor: `${colors.panel}50`
        }}
      >
        <p 
          className="text-xs leading-relaxed" 
          style={{ color: colors.textMuted }}
        >
          <span className="font-semibold text-amber-400">Tip:</span> Click and drag nodes to rearrange. Scroll to zoom.
        </p>
      </div>
    </div>
  );
}
