import { ThemeColors, FileNode } from '../types';

interface NodeDetailsProps {
  colors: ThemeColors;
  selectedNode: FileNode | null;
}

export function NodeDetails({ colors, selectedNode }: NodeDetailsProps) {
  return (
    <div 
      className="flex-1 p-6 rounded-2xl border overflow-auto" 
      style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
    >
      <h3 
        className="text-sm font-bold uppercase tracking-widest mb-5" 
        style={{ color: colors.textMuted }}
      >
        Selected
      </h3>
      
      {selectedNode ? (
        <div>
          <div className="mb-5">
            <h4 className="font-semibold text-base mb-1">{selectedNode.label}</h4>
            <p 
              className="text-xs break-all" 
              style={{ color: colors.textMuted }}
            >
              {selectedNode.id}
            </p>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span style={{ color: colors.textMuted }}>Severity:</span>
              <span 
                className="font-semibold capitalize px-4 py-1.5 rounded-full text-xs"
                style={{ 
                  color: selectedNode.color, 
                  backgroundColor: `${selectedNode.color}20` 
                }}
              >
                {selectedNode.severity || 'none'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span style={{ color: colors.textMuted }}>Token Cost:</span>
              <span className="font-semibold text-cyan-400">
                {selectedNode.tokenCost || 0}
              </span>
            </div>
            
            {selectedNode.duplicates !== undefined && (
              <div className="flex justify-between items-center">
                <span style={{ color: colors.textMuted }}>Issues:</span>
                <span className="font-semibold text-purple-400">
                  {selectedNode.duplicates}
                </span>
              </div>
            )}
          </div>
          
          {selectedNode.title && (
            <div 
              className="mt-6 pt-5 border-t" 
              style={{ borderColor: colors.cardBorder }}
            >
              <h5 
                className="text-sm font-bold mb-3" 
                style={{ color: colors.textMuted }}
              >
                Details
              </h5>
              <pre 
                className="text-xs whitespace-pre-wrap font-mono leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {selectedNode.title}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <p 
          className="text-sm" 
          style={{ color: colors.textMuted }}
        >
          Click a node to view details
        </p>
      )}
    </div>
  );
}
