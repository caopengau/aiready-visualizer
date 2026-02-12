import React from 'react';
import type { GraphNode } from './ForceDirectedGraph';

export interface NodeItemProps {
  node: GraphNode;
  isSelected: boolean;
  isHovered: boolean;
  pinned: boolean;
  defaultNodeSize: number;
  defaultNodeColor: string;
  showLabel?: boolean;
  onClick?: (n: GraphNode) => void;
  onDoubleClick?: (e: React.MouseEvent, n: GraphNode) => void;
  onMouseEnter?: (n: GraphNode) => void;
  onMouseLeave?: () => void;
  onMouseDown?: (e: React.MouseEvent, n: GraphNode) => void;
}

export const NodeItem: React.FC<NodeItemProps> = ({
  node,
  isSelected,
  isHovered,
  pinned,
  defaultNodeSize,
  defaultNodeColor,
  showLabel = true,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
}) => {
  const nodeSize = node.size || defaultNodeSize;
  const nodeColor = node.color || defaultNodeColor;

  const x = node.x ?? 0;
  const y = node.y ?? 0;

  return (
    <g
      key={node.id}
      className="cursor-pointer node"
      data-id={node.id}
      transform={`translate(${x},${y})`}
      onClick={() => onClick?.(node)}
      onDoubleClick={(e) => onDoubleClick?.(e, node)}
      onMouseEnter={() => onMouseEnter?.(node)}
      onMouseLeave={() => onMouseLeave?.()}
      onMouseDown={(e) => onMouseDown?.(e, node)}
    >
      <circle
        r={nodeSize}
        fill={nodeColor}
        stroke={isSelected ? '#000' : isHovered ? '#666' : 'none'}
        strokeWidth={pinned ? 3 : isSelected ? 2.5 : isHovered ? 2 : 1.5}
        opacity={isHovered || isSelected ? 1 : 0.9}
      />
      {pinned && (
        <circle r={nodeSize + 4} fill="none" stroke="#ff6b6b" strokeWidth={1} opacity={0.5} className="pointer-events-none" />
      )}
      {showLabel && node.label && (
        <text y={nodeSize + 15} fill="#333" fontSize="12" textAnchor="middle" dominantBaseline="middle" pointerEvents="none" className="select-none">
          {node.label}
        </text>
      )}
    </g>
  );
};

export default NodeItem;
