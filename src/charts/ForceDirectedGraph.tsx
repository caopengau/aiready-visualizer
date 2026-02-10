import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
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

export interface ForceDirectedGraphHandle {
  /**
   * Pin all nodes in place
   */
  pinAll: () => void;

  /**
   * Unpin all nodes (release constraints)
   */
  unpinAll: () => void;

  /**
   * Reset all nodes to auto-layout (unpin and restart simulation)
   */
  resetLayout: () => void;

  /**
   * Fit all nodes in the current view
   */
  fitView: () => void;

  /**
   * Get currently pinned node IDs
   */
  getPinnedNodes: () => string[];

  /**
   * Toggle dragging mode
   */
  setDragMode: (enabled: boolean) => void;
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

  /**
   * Manual layout mode: disables forces, allows free dragging
   * @default false
   */
  manualLayout?: boolean;

  /**
   * Callback when manual layout mode is toggled
   */
  onManualLayoutChange?: (enabled: boolean) => void;

  /**
   * Package bounds computed by the parent (pack layout): map of `pkg:group` -> {x,y,r}
   */
  packageBounds?: Record<string, { x: number; y: number; r: number }>;
}

export const ForceDirectedGraph = forwardRef<ForceDirectedGraphHandle, ForceDirectedGraphProps>(
  (
    {
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
      manualLayout = false,
      onManualLayoutChange,
      packageBounds,
    },
    ref
  ) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const dragNodeRef = useRef<GraphNode | null>(null);
  const dragActiveRef = useRef(false);
  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(new Set());
  const internalDragEnabledRef = useRef(enableDrag);

  // Update the ref when enableDrag prop changes
  useEffect(() => {
    internalDragEnabledRef.current = enableDrag;
  }, [enableDrag]);

  // Initialize simulation with manualLayout mode
  const onTick = (nodesCopy: any[], _linksCopy: any[], _sim: any) => {
    const bounds = packageBounds && Object.keys(packageBounds).length ? packageBounds : undefined;
    // fallback: if parent didn't provide packageBounds, compute locally from initialNodes
    let effectiveBounds = bounds;
    if (!effectiveBounds) {
      try {
        const counts: Record<string, number> = {};
        (initialNodes || []).forEach((n: any) => {
          if (n && n.kind === 'file') {
            const g = n.packageGroup || 'root';
            counts[g] = (counts[g] || 0) + 1;
          }
        });
        const children = Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));
        if (children.length > 0) {
          const root = d3.hierarchy<any>({ children } as any).sum((d: any) => d.value as number);
          const pack = d3.pack().size([width, height]).padding(30);
          const packed = pack(root);
          const map: Record<string, { x: number; y: number; r: number }> = {};
          if (packed.children) {
            packed.children.forEach((c: any) => {
              map[`pkg:${c.data.name}`] = { x: c.x, y: c.y, r: c.r * 0.95 };
            });
            effectiveBounds = map;
          }
        }
      } catch (e) {
        // ignore fallback errors
      }
    }
    if (!effectiveBounds) return;
    try {
      Object.values(nodesCopy).forEach((n: any) => {
        if (!n) return;
        // only constrain file nodes (package nodes have their own fx/fy)
        if (n.kind === 'package') return;
        const pkg = n.packageGroup;
        if (!pkg) return;
        const bound = effectiveBounds[`pkg:${pkg}`];
        if (!bound) return;
        const margin = (n.size || 10) + 12;
        const dx = (n.x || 0) - bound.x;
        const dy = (n.y || 0) - bound.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const maxDist = Math.max(1, bound.r - margin);
        if (dist > maxDist) {
          const desiredX = bound.x + dx * (maxDist / dist);
          const desiredY = bound.y + dy * (maxDist / dist);
          // apply a soft corrective velocity toward the desired position
          const softness = 0.08;
          n.vx = (n.vx || 0) + (desiredX - n.x) * softness;
          n.vy = (n.vy || 0) + (desiredY - n.y) * softness;
        }
      });
    } catch (e) {
      // ignore
    }
  };

  const { nodes, links, restart, stop, setForcesEnabled } = useForceSimulation(initialNodes, initialLinks, {
    width,
    height,
    chargeStrength: manualLayout ? 0 : undefined,
    onTick,
    ...simulationOptions,
  });

  // If package bounds are provided, add a tick-time clamp via the hook's onTick option
  useEffect(() => {
    if (!packageBounds) return;
    // nothing to do here because the hook will call onTick passed in creation; we need to recreate simulation to use onTick
    // So restart the simulation to pick up potential changes in node bounds.
    try { restart(); } catch (e) {}
  }, [packageBounds, restart]);

  // If manual layout is enabled or any nodes are pinned, disable forces
  useEffect(() => {
    try {
      if (manualLayout || pinnedNodes.size > 0) setForcesEnabled(false);
      else setForcesEnabled(true);
    } catch (e) {
      // ignore
    }
  }, [manualLayout, pinnedNodes, setForcesEnabled]);

  // Expose imperative handle for parent components
  useImperativeHandle(
    ref,
    () => ({
      pinAll: () => {
        const newPinned = new Set<string>();
        nodes.forEach((node) => {
          node.fx = node.x;
          node.fy = node.y;
          newPinned.add(node.id);
        });
        setPinnedNodes(newPinned);
        restart();
      },

      unpinAll: () => {
        nodes.forEach((node) => {
          node.fx = null;
          node.fy = null;
        });
        setPinnedNodes(new Set());
        restart();
      },

      resetLayout: () => {
        nodes.forEach((node) => {
          node.fx = null;
          node.fy = null;
        });
        setPinnedNodes(new Set());
        restart();
      },

      fitView: () => {
        if (!svgRef.current || !nodes.length) return;

        // Calculate bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach((node) => {
          if (node.x !== undefined && node.y !== undefined) {
            const size = node.size || 10;
            minX = Math.min(minX, node.x - size);
            maxX = Math.max(maxX, node.x + size);
            minY = Math.min(minY, node.y - size);
            maxY = Math.max(maxY, node.y + size);
          }
        });

        if (!isFinite(minX)) return;

        const padding = 40;
        const nodeWidth = maxX - minX;
        const nodeHeight = maxY - minY;
        const scale = Math.min(
          (width - padding * 2) / nodeWidth,
          (height - padding * 2) / nodeHeight,
          10
        );

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const x = width / 2 - centerX * scale;
        const y = height / 2 - centerY * scale;

        if (gRef.current && svgRef.current) {
          const svg = d3.select(svgRef.current);
          const newTransform = d3.zoomIdentity.translate(x, y).scale(scale);
          svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().transform as any, newTransform);
          setTransform(newTransform);
        }
      },

      getPinnedNodes: () => Array.from(pinnedNodes),

      setDragMode: (enabled: boolean) => {
        internalDragEnabledRef.current = enabled;
      },
    }),
    [nodes, pinnedNodes, restart, width, height]
  );

  // Notify parent when manual layout mode changes (uses the prop so it's not unused)
  useEffect(() => {
    try {
      if (typeof onManualLayoutChange === 'function') onManualLayoutChange(manualLayout);
    } catch (e) {
      // ignore errors from callbacks
    }
  }, [manualLayout, onManualLayoutChange]);

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

  // Set up drag behavior with global listeners for smoother dragging
  const handleDragStart = useCallback(
    (event: React.MouseEvent, node: GraphNode) => {
      if (!enableDrag) return;
      event.preventDefault();
      event.stopPropagation();
      // pause forces while dragging to avoid the whole graph moving
      dragActiveRef.current = true;
      dragNodeRef.current = node;
      node.fx = node.x;
      node.fy = node.y;
      setPinnedNodes((prev) => new Set([...prev, node.id]));
      try { stop(); } catch (e) {}
    },
    [enableDrag, restart]
  );

  useEffect(() => {
    if (!enableDrag) return;

    const handleWindowMove = (event: MouseEvent) => {
      if (!dragActiveRef.current || !dragNodeRef.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (event.clientX - rect.left - transform.x) / transform.k;
      const y = (event.clientY - rect.top - transform.y) / transform.k;
      dragNodeRef.current.fx = x;
      dragNodeRef.current.fy = y;
    };

    const handleWindowUp = () => {
      if (!dragActiveRef.current) return;
      // Keep fx/fy set to pin the node where it was dropped.
      try { setForcesEnabled(true); restart(); } catch (e) {}
      dragNodeRef.current = null;
      dragActiveRef.current = false;
    };

    const handleWindowLeave = (event: MouseEvent) => {
      if (event.relatedTarget === null) handleWindowUp();
    };

    window.addEventListener('mousemove', handleWindowMove);
    window.addEventListener('mouseup', handleWindowUp);
    window.addEventListener('mouseout', handleWindowLeave);
    window.addEventListener('blur', handleWindowUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowUp);
      window.removeEventListener('mouseout', handleWindowLeave);
      window.removeEventListener('blur', handleWindowUp);
    };
  }, [enableDrag, transform]);

  // Attach d3.drag behavior to node groups rendered by React. This helps make
  // dragging more robust across transforms and pointer behaviors.
  useEffect(() => {
    if (!gRef.current || !enableDrag) return;
    const g = d3.select(gRef.current);
    const dragBehavior = d3
      .drag<SVGGElement, unknown>()
      .on('start', function (event) {
        try {
          const target = (event.sourceEvent && (event.sourceEvent.target as Element)) || (event.target as Element);
          const grp = target.closest?.('g.node') as Element | null;
          const id = grp?.getAttribute('data-id');
          if (!id) return;
          const node = nodes.find((n) => n.id === id) as GraphNode | undefined;
          if (!node) return;
          if (!internalDragEnabledRef.current) return;
          if (!event.active) restart();
          dragActiveRef.current = true;
          dragNodeRef.current = node;
          node.fx = node.x;
          node.fy = node.y;
          setPinnedNodes((prev) => new Set([...prev, node.id]));
        } catch (e) {
          // ignore
        }
      })
      .on('drag', function (event) {
        if (!dragActiveRef.current || !dragNodeRef.current) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = (event.sourceEvent.clientX - rect.left - transform.x) / transform.k;
        const y = (event.sourceEvent.clientY - rect.top - transform.y) / transform.k;
        dragNodeRef.current.fx = x;
        dragNodeRef.current.fy = y;
      })
      .on('end', function () {
        // re-enable forces when drag ends
        try { setForcesEnabled(true); restart(); } catch (e) {}
        dragNodeRef.current = null;
        dragActiveRef.current = false;
      });

    try {
      g.selectAll('g.node').call(dragBehavior as any);
    } catch (e) {
      // ignore attach errors
    }

    return () => {
      try {
        g.selectAll('g.node').on('.drag', null as any);
      } catch (e) {
        /* ignore */
      }
    };
  }, [gRef, enableDrag, nodes, transform, restart]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: GraphNode) => {
      event.stopPropagation();
      if (!enableDrag) return;
      if (node.fx === null || node.fx === undefined) {
        node.fx = node.x;
        node.fy = node.y;
        setPinnedNodes((prev) => new Set([...prev, node.id]));
      } else {
        node.fx = null;
        node.fy = null;
        setPinnedNodes((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      }
      restart();
    },
    [enableDrag, restart]
  );

  const handleCanvasDoubleClick = useCallback(() => {
    nodes.forEach((node) => {
      node.fx = null;
      node.fy = null;
    });
    setPinnedNodes(new Set());
    restart();
  }, [nodes, restart]);

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
      onDoubleClick={handleCanvasDoubleClick}
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
          if (source.x == null || source.y == null || target.x == null || target.y == null) return null;

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
          if (node.x == null || node.y == null) return null;

          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const nodeSize = node.size || defaultNodeSize;
          const nodeColor = node.color || defaultNodeColor;

          return (
            <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                className="cursor-pointer node"
                data-id={node.id}
                onClick={() => handleNodeClick(node)}
                onDoubleClick={(event) => handleNodeDoubleClick(event, node)}
                onMouseEnter={() => handleNodeMouseEnter(node)}
                onMouseLeave={handleNodeMouseLeave}
                onMouseDown={(e) => handleDragStart(e, node)}
              >
              <circle
                r={nodeSize}
                fill={nodeColor}
                stroke={isSelected ? '#000' : isHovered ? '#666' : 'none'}
                strokeWidth={pinnedNodes.has(node.id) ? 3 : isSelected ? 2.5 : isHovered ? 2 : 1.5}
                opacity={isHovered || isSelected ? 1 : 0.9}
                className="transition-all"
              />
              {pinnedNodes.has(node.id) && (
                <circle
                  r={nodeSize + 4}
                  fill="none"
                  stroke="#ff6b6b"
                  strokeWidth={1}
                  opacity={0.5}
                  className="pointer-events-none"
                />
              )}
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
        {/* Package boundary circles (from parent pack layout) - drawn on top for visibility */}
        {packageBounds && Object.keys(packageBounds).length > 0 && (
          <g className="package-boundaries" pointerEvents="none">
            {Object.entries(packageBounds).map(([pid, b]) => (
              <g key={pid}>
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={b.r}
                  fill="rgba(148,163,184,0.06)"
                  stroke="#475569"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  opacity={0.9}
                />
                <text
                  x={b.x}
                  y={Math.max(12, b.y - b.r + 14)}
                  fill="#475569"
                  fontSize={11}
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {pid.replace(/^pkg:/, '')}
                </text>
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
  }
);

ForceDirectedGraph.displayName = 'ForceDirectedGraph';