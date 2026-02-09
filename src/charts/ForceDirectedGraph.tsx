import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  useForceSimulation,
  type SimulationNode,
  type SimulationLink,
  type ForceSimulationOptions,
} from '../hooks/useForceSimulation';
import { cn } from '../utils/cn';

export interface GraphNode extends SimulationNode {
  id: string;
  label?: string;
  color?: string;
  size?: number;
  group?: string;
}

export interface GraphLink extends SimulationLink {
  color?: string;
  width?: number;
  label?: string;
}

export interface ForceDirectedGraphProps {
  /**
   * Array of nodes to display
   */
  nodes: GraphNode[];

  /**
   * Array of links between nodes
   */
  links: GraphLink[];

  /**
   * Width of the graph container
   */
  width: number;

  /**
   * Height of the graph container
   */
  height: number;

  /**
   * Force simulation options
   */
  simulationOptions?: Partial<ForceSimulationOptions>;

  /**
   * Whether to enable zoom and pan
   * @default true
   */
  enableZoom?: boolean;

  /**
   * Whether to enable node dragging
   * @default true
   */
  enableDrag?: boolean;

  /**
   * Callback when a node is clicked
   */
  onNodeClick?: (node: GraphNode) => void;

  /**
   * Callback when a node is hovered
   */
  onNodeHover?: (node: GraphNode | null) => void;

  /**
   * Callback when a link is clicked
   */
  onLinkClick?: (link: GraphLink) => void;

  /**
   * Selected node ID
   */
  selectedNodeId?: string;

  /**
   * Hovered node ID
   */
  hoveredNodeId?: string;

  /**
   * Default node color
   * @default "#69b3a2"
   */
  defaultNodeColor?: string;

  /**
   * Default node size
   * @default 10
   */
  defaultNodeSize?: number;

  /**
   * Default link color
   * @default "#999"
   */
  defaultLinkColor?: string;

  /**
   * Default link width
   * @default 1
   */
  defaultLinkWidth?: number;

  /**
   * Whether to show node labels
   * @default true
   */
  showNodeLabels?: boolean;

  /**
   * Whether to show link labels
   * @default false
   */
  showLinkLabels?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ForceDirectedGraph: React.FC<ForceDirectedGraphProps> = ({
  nodes: initialNodes,
  links: initialLinks,
  width,
  height,
  simulationOptions,
  enableZoom = true,
  enableDrag = true,
  onNodeClick,
  onNodeHover,
  onLinkClick,
  selectedNodeId,
  hoveredNodeId,
  defaultNodeColor = '#69b3a2',
  defaultNodeSize = 10,
  defaultLinkColor = '#999',
  defaultLinkWidth = 1,
  showNodeLabels = true,
  showLinkLabels = false,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  // Initialize simulation
  const { nodes, links, restart } = useForceSimulation(initialNodes, initialLinks, {
    width,
    height,
    ...simulationOptions,
  });

  // Set up zoom behavior
  useEffect(() => {
    if (!enableZoom || !svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setTransform(event.transform);
      });

    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, [enableZoom]);

  // Set up drag behavior
  const handleDragStart = useCallback(
    (event: React.MouseEvent, node: GraphNode) => {
      if (!enableDrag) return;
      event.stopPropagation();
      node.fx = node.x;
      node.fy = node.y;
      restart();
    },
    [enableDrag, restart]
  );

  const handleDrag = useCallback(
    (event: React.MouseEvent, node: GraphNode) => {
      if (!enableDrag) return;
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const x = (event.clientX - rect.left - transform.x) / transform.k;
      const y = (event.clientY - rect.top - transform.y) / transform.k;

      node.fx = x;
      node.fy = y;
    },
    [enableDrag, transform]
  );

  const handleDragEnd = useCallback(
    (event: React.MouseEvent, node: GraphNode) => {
      if (!enableDrag) return;
      event.stopPropagation();
      node.fx = null;
      node.fy = null;
    },
    [enableDrag]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  const handleNodeMouseEnter = useCallback(
    (node: GraphNode) => {
      onNodeHover?.(node);
    },
    [onNodeHover]
  );

  const handleNodeMouseLeave = useCallback(() => {
    onNodeHover?.(null);
  }, [onNodeHover]);

  const handleLinkClick = useCallback(
    (link: GraphLink) => {
      onLinkClick?.(link);
    },
    [onLinkClick]
  );

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={cn('bg-white dark:bg-gray-900', className)}
    >
      <defs>
        {/* Arrow marker for directed graphs */}
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="20"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={defaultLinkColor} />
        </marker>
      </defs>

      <g ref={gRef}>
        {/* Render links */}
        {links.map((link, i) => {
          const source = link.source as GraphNode;
          const target = link.target as GraphNode;
          if (!source.x || !source.y || !target.x || !target.y) return null;

          return (
            <g key={`link-${i}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={link.color || defaultLinkColor}
                strokeWidth={link.width || defaultLinkWidth}
                opacity={0.6}
                className="cursor-pointer transition-opacity hover:opacity-100"
                onClick={() => handleLinkClick(link)}
              />
              {showLinkLabels && link.label && (
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2}
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
        })}

        {/* Render nodes */}
        {nodes.map((node) => {
          if (!node.x || !node.y) return null;

          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const nodeSize = node.size || defaultNodeSize;
          const nodeColor = node.color || defaultNodeColor;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeMouseEnter(node)}
              onMouseLeave={handleNodeMouseLeave}
              onMouseDown={(e) => handleDragStart(e, node)}
              onMouseMove={(e) => handleDrag(e, node)}
              onMouseUp={(e) => handleDragEnd(e, node)}
            >
              <circle
                r={nodeSize}
                fill={nodeColor}
                stroke={isSelected ? '#000' : isHovered ? '#666' : 'none'}
                strokeWidth={isSelected ? 3 : 2}
                opacity={isHovered || isSelected ? 1 : 0.9}
                className="transition-all"
              />
              {showNodeLabels && node.label && (
                <text
                  y={nodeSize + 15}
                  fill="#333"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  className="select-none"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

ForceDirectedGraph.displayName = 'ForceDirectedGraph';