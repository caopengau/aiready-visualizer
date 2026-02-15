import { ThemeColors, GraphData, Theme } from '../types';

// Icons as inline SVG components for the theme toggle
const SunIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const SystemIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

interface NavbarProps {
  colors: ThemeColors;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  data: GraphData | null;
}

export function Navbar({ colors, theme, setTheme, data }: NavbarProps) {
  return (
    <nav 
      className="h-16 backdrop-blur-md border-b flex items-center justify-between px-6 z-50 relative"
      style={{ 
        backgroundColor: `${colors.panel}f5`, 
        borderColor: colors.panelBorder 
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${colors.panel}80 0%, transparent 50%, ${colors.panel}80 100%)`,
        }}
      />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="flex items-center justify-center">
          <img 
            src="/logo-transparent-bg.png" 
            alt="AIReady" 
            className="h-9 w-auto" 
          />
        </div>
        <div 
          className="h-7 w-px" 
          style={{ backgroundColor: colors.panelBorder }} 
        />
        <h1 
          className="text-sm font-semibold tracking-wide uppercase" 
          style={{ color: colors.textMuted }}
        >
          Codebase
        </h1>
      </div>

      <div className="flex items-center gap-5 relative z-10">
        {/* Modern Theme Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: colors.panelBorder, backgroundColor: `${colors.panel}80` }}>
          {[
            { key: 'dark', icon: MoonIcon, label: 'Dark' },
            { key: 'light', icon: SunIcon, label: 'Light' },
            { key: 'system', icon: SystemIcon, label: 'System' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTheme(key as Theme)}
              className={`
                group flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium
                transition-all duration-200 ease-out
                ${theme === key 
                  ? 'shadow-sm' 
                  : 'hover:bg-white/5'
                }
              `}
              style={{
                backgroundColor: theme === key ? colors.cardBg : 'transparent',
                color: theme === key ? colors.text : colors.textMuted,
                border: `1px solid ${theme === key ? colors.cardBorder : 'transparent'}`,
              }}
              title={`Switch to ${label} theme`}
            >
              <Icon 
                className={`
                  transition-transform duration-200
                  ${theme === key ? 'scale-110' : 'scale-100 group-hover:scale-110'}
                `}
              />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {data && (
          <div className="flex items-center gap-2">
            <div 
              className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2" 
              style={{ 
                backgroundColor: `${colors.cardBg}cc`, 
                borderColor: colors.cardBorder 
              }}
            >
              <span 
                className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" 
              />
              <span style={{ color: colors.textMuted }}>Files</span>
              <span style={{ color: colors.text }}>{data.nodes.length}</span>
            </div>
            <div 
              className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2" 
              style={{ 
                backgroundColor: `${colors.cardBg}cc`, 
                borderColor: colors.cardBorder 
              }}
            >
              <span 
                className="w-2 h-2 rounded-full bg-purple-400" 
              />
              <span style={{ color: colors.textMuted }}>Links</span>
              <span style={{ color: colors.text }}>{data.edges.length}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
