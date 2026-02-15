import { ThemeColors, FileNode } from '../types';

// Info Row Component for consistent styling
function InfoRow({ 
  label, 
  value, 
  valueColor = 'inherit',
  highlight = false,
  colors
}: { 
  label: string; 
  value: string | number;
  valueColor?: string;
  highlight?: boolean;
  colors: ThemeColors;
}) {
  return (
    <div 
      className="flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors hover:bg-white/5"
    >
      <span 
        className="text-xs font-medium"
        style={{ color: colors.textMuted }}
      >
        {label}
      </span>
      <span 
        className={`text-xs font-semibold ${highlight ? 'px-3 py-1 rounded-full' : ''}`}
        style={{ 
          color: valueColor,
          backgroundColor: highlight ? `${valueColor}25` : 'transparent'
        }}
      >
        {value}
      </span>
    </div>
  );
}

interface NodeDetailsProps {
  colors: ThemeColors;
  selectedNode: FileNode | null;
  onClose?: () => void;
}

export function NodeDetails({ colors, selectedNode, onClose }: NodeDetailsProps) {
  return (
    <div 
      style={{ 
        padding: '16px 16px',
        height: '100%',
        overflow: 'auto',
        animation: 'fadeIn 0.2s ease-in'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" 
          />
          <h3 
            className="text-xs font-bold uppercase tracking-widest" 
            style={{ color: colors.textMuted }}
          >
            Selected Node
          </h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: colors.textMuted }}
            title="Close details"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {selectedNode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* File Name - No border, just padding */}
          <div className="p-4 rounded-xl" 
            style={{ 
              backgroundColor: `${colors.cardBg}80`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <h4 className="font-semibold text-sm truncate" style={{ color: colors.text }}>
                {selectedNode.label}
              </h4>
            </div>
            <p 
              className="text-xs break-all truncate" 
              style={{ color: colors.textMuted }}
              title={selectedNode.id}
            >
              {selectedNode.id}
            </p>
          </div>
          
          {/* Metrics - No border */}
          <div className="rounded-xl p-1">
            <div className="px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Metrics
              </span>
            </div>
            <div className="p-1">
              <InfoRow 
                label="Severity" 
                value={selectedNode.severity || 'none'} 
                valueColor={selectedNode.color}
                highlight
                colors={colors}
              />
              <InfoRow 
                label="Token Cost" 
                value={selectedNode.tokenCost?.toLocaleString() || '0'} 
                valueColor="#22d3ee"
                colors={colors}
              />
              {selectedNode.duplicates !== undefined && (
                <InfoRow 
                  label="Issues Found" 
                  value={selectedNode.duplicates} 
                  valueColor="#c084fc"
                  colors={colors}
                />
              )}
            </div>
          </div>
          
          {/* Description/Details - No border */}
          {selectedNode.title && (
            <div 
              className="rounded-xl p-4"
              style={{ 
                backgroundColor: `${colors.cardBg}80`
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.textMuted }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <h5 
                  className="text-xs font-semibold uppercase tracking-wider" 
                  style={{ color: colors.textMuted }}
                >
                  Details
                </h5>
              </div>
              <pre 
                className="text-xs whitespace-pre-wrap font-mono leading-relaxed p-3 rounded-lg"
                style={{ 
                  color: colors.textMuted,
                  backgroundColor: colors.panel,
                  maxHeight: '150px',
                  overflow: 'auto'
                }}
              >
                {selectedNode.title}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center py-10 text-center rounded-xl"
          style={{ 
            backgroundColor: `${colors.cardBg}50`
          }}
        >
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            className="mb-3 opacity-40"
            style={{ color: colors.textMuted }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p 
            className="text-sm font-medium" 
            style={{ color: colors.textMuted }}
          >
            Click a node to view details
          </p>
        </div>
      )}
    </div>
  );
}

// Keep the old component for backwards compatibility
export function NodeDetailsOld({ colors, selectedNode }: NodeDetailsProps) {
  return <NodeDetails colors={colors} selectedNode={selectedNode} />;
}
