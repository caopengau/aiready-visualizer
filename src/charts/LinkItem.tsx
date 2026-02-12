import React from 'react';
import type { GraphLink, GraphNode } from './ForceDirectedGraph';

export interface LinkItemProps {
  link: GraphLink;
  onClick?: (l: GraphLink) => void;
  defaultWidth?: number;
  showLabel?: boolean;
  nodes?: GraphNode[]; // Optional nodes array to resolve string IDs to node objects
}

export const LinkItem: React.FC<LinkItemProps> = ({ link, onClick, defaultWidth, showLabel = true, nodes = [] }) => {
  const src = (link.source as any)?.id ?? (typeof link.source === 'string' ? link.source : undefined);
  const tgt = (link.target as any)?.id ?? (typeof link.target === 'string' ? link.target : undefined);

  // Helper to get node position from source/target (which could be node object or string ID)
  const getNodePosition = (nodeOrId: string | GraphNode): { x: number; y: number } | null => {
    if (typeof nodeOrId === 'object' && nodeOrId !== null) {
      // It's a node object
      const node = nodeOrId as GraphNode;
      return { x: node.x ?? 0, y: node.y ?? 0 };
    } else if (typeof nodeOrId === 'string') {
      // It's a string ID, try to find in nodes array
      const found = nodes.find(n => n.id === nodeOrId);
      if (found) return { x: found.x ?? 0, y: found.y ?? 0 };
    }
    return null;
  };

  const sourcePos = getNodePosition(link.source);
  const targetPos = getNodePosition(link.target);

  // If we can't get positions, render nothing (or a placeholder)
  if (!sourcePos || !targetPos) {
    return null;
  }

  // Calculate midpoint for label positioning
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

  return (
    <g>
      <line
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        data-source={src}
        data-target={tgt}
        stroke={link.color}
        strokeWidth={link.width ?? defaultWidth ?? 1}
        opacity={0.6}
        className="cursor-pointer transition-opacity hover:opacity-100"
        onClick={() => onClick?.(link)}
      />
      {showLabel && link.label && (
        <text
          x={midX}
          y={midY}
          fill="#666"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="middle"
          pointerEvents="none"
        >
          {link.label}
        </text>
      )}
    </g>
  );
};

export default LinkItem;
