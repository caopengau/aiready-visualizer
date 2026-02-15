import { ThemeColors, GraphData, Theme } from '../types';

interface NavbarProps {
  colors: ThemeColors;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  data: GraphData | null;
}

export function Navbar({ colors, theme, setTheme, data }: NavbarProps) {
  return (
    <nav 
      className="h-16 backdrop-blur-md border-b flex items-center justify-between px-8 z-50"
      style={{ 
        backgroundColor: `${colors.panel}ee`, 
        borderColor: colors.panelBorder 
      }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center justify-center w-32">
          <img 
            src="/logo-transparent-bg.png" 
            alt="AIReady" 
            className="h-8 w-auto" 
          />
        </div>
        <div 
          className="h-8 w-px" 
          style={{ backgroundColor: colors.panelBorder }} 
        />
        <h1 
          className="text-base font-medium" 
          style={{ color: colors.textMuted }}
        >
          Codebase Visualization
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span 
            className="text-xs" 
            style={{ color: colors.textMuted }}
          >
            Theme:
          </span>
          <div 
            className="flex rounded-lg overflow-hidden border" 
            style={{ borderColor: colors.panelBorder }}
          >
            {(['dark', 'light', 'system'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: theme === t ? colors.cardBg : 'transparent',
                  color: theme === t ? colors.text : colors.textMuted,
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {data && (
          <div className="flex items-center gap-3">
            <div 
              className="px-4 py-1.5 rounded-full border text-xs" 
              style={{ 
                backgroundColor: colors.cardBg, 
                borderColor: colors.panelBorder 
              }}
            >
              <span style={{ color: colors.textMuted }}>Files:</span>{' '}
              <span className="font-semibold text-cyan-400">{data.nodes.length}</span>
            </div>
            <div 
              className="px-4 py-1.5 rounded-full border text-xs" 
              style={{ 
                backgroundColor: colors.cardBg, 
                borderColor: colors.panelBorder 
              }}
            >
              <span style={{ color: colors.textMuted }}>Connections:</span>{' '}
              <span className="font-semibold text-purple-400">{data.edges.length}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
