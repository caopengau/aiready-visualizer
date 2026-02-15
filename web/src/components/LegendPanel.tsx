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
    <div 
      className="group cursor-default transition-all hover:bg-white/5"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '6px 0',
        borderRadius: '8px'
      }}
    >
      {isLine ? (
        <span 
          className="w-10 h-1 rounded-full transition-transform group-hover:scale-y-150 flex-shrink-0" 
          style={{ backgroundColor: color }} 
        />
      ) : (
        <span 
          className={`w-4 h-4 rounded-full transition-transform group-hover:scale-125 flex-shrink-0 ${isGlow ? 'shadow-lg' : ''}`}
          style={{ 
            backgroundColor: color, 
            boxShadow: isGlow ? `0 0 10px ${color}90` : 'none' 
          }} 
        />
      )}
      <span 
        className="text-sm font-medium transition-colors leading-tight"
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
    <div style={{ padding: '16px 16px', animation: 'fadeIn 0.2s ease-in' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${colors.cardBorder}` }}>
          <h2 
            className="text-base font-bold tracking-wide" 
            style={{ color: colors.text }}
          >
            Legend
          </h2>
        </div>

        {/* Severity Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 
            className="text-xs font-bold uppercase tracking-widest" 
            style={{ color: colors.textMuted, marginBottom: '4px' }}
          >
            Severity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 
            className="text-xs font-bold uppercase tracking-widest" 
            style={{ color: colors.textMuted, marginBottom: '4px' }}
          >
            Connections
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 
            className="text-xs font-bold uppercase tracking-widest" 
            style={{ color: colors.textMuted, marginBottom: '4px' }}
          >
            Node Size
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p 
              className="text-xs leading-relaxed" 
              style={{ color: colors.textMuted }}
            >
              Larger nodes indicate higher <span className="text-cyan-400 font-medium">token cost</span> and more <span className="text-purple-400 font-medium">issues</span>.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 border-2" style={{ borderColor: colors.panel }} />
                <span className="w-5 h-5 rounded-full bg-cyan-400 border-2" style={{ borderColor: colors.panel }} />
                <span className="w-7 h-7 rounded-full bg-cyan-400 border-2" style={{ borderColor: colors.panel }} />
              </div>
              <span className="text-xs" style={{ color: colors.textMuted }}>→</span>
              <span className="text-xs font-medium" style={{ color: colors.text }}>More Impact</span>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div 
          className="p-4 rounded-xl"
          style={{ 
            backgroundColor: `${colors.cardBg}80`
          }}
        >
          <p 
            className="text-xs leading-relaxed" 
            style={{ color: colors.textMuted }}
          >
            <span className="font-semibold text-amber-400">💡 Tip:</span> Click and drag nodes to rearrange. Scroll to zoom.
          </p>
        </div>
      </div>
    </div>
  );
}
