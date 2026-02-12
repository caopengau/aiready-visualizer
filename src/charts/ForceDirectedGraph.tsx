import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { useForceSimulation, type SimulationNode, type SimulationLink, type ForceSimulationOptions } from '../hooks/useForceSimulation';
import { cn } from '../utils/cn';
import NodeItem from './NodeItem';
import LinkItem from './LinkItem';

export interface GraphNode extends SimulationNode {
  id: string;
  label?: string;
  color?: string;
  size?: number;
  group?: string;
  kind?: 'file' | 'package';
  packageGroup?: string;
}

export interface GraphLink extends SimulationLink {
  color?: string;
  width?: number;
  label?: string;
}

export interface ForceDirectedGraphHandle {
  pinAll: () => void;
  unpinAll: () => void;
  resetLayout: () => void;
  fitView: () => void;
  getPinnedNodes: () => string[];
  setDragMode: (enabled: boolean) => void;
}

export interface ForceDirectedGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  width: number;
  height: number;
  simulationOptions?: Partial<ForceSimulationOptions>;
  enableZoom?: boolean;
  enableDrag?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  onLinkClick?: (link: GraphLink) => void;
  selectedNodeId?: string;
  hoveredNodeId?: string;
  defaultNodeColor?: string;
  defaultNodeSize?: number;
  defaultLinkColor?: string;
  defaultLinkWidth?: number;
  showNodeLabels?: boolean;
  showLinkLabels?: boolean;
  className?: string;
  manualLayout?: boolean;
  onManualLayoutChange?: (enabled: boolean) => void;
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
  const transformRef = useRef(transform);
  const dragNodeRef = useRef<GraphNode | null>(null);
  const dragActiveRef = useRef(false);
  const [pinnedNodes, setPinnedNodes] = useState<Set<string>>(new Set());
  const internalDragEnabledRef = useRef(enableDrag);

  // Update the ref when enableDrag prop changes
  useEffect(() => {
    internalDragEnabledRef.current = enableDrag;
  }, [enableDrag]);

  // Initialize simulation - let React handle rendering based on node positions
  const onTick = (_nodesCopy: any[], _linksCopy: any[], _sim: any) => {
    // If package bounds are provided, gently pull file nodes toward their
    // package center to create meaningful clusters.
    try {
      const boundsToUse = clusterBounds?.bounds ?? packageBounds;
      const nodeClusterMap = clusterBounds?.nodeToCluster ?? {};
      if (boundsToUse) {
        Object.values(nodesById).forEach((n) => {
          if (!n) return;
          // Prefer explicit `group`, but fall back to `packageGroup` which is
          // provided by the visualizer data. This ensures file nodes are
          // pulled toward their package center (pkg:<name>) as intended.
          const group = (n as any).group ?? (n as any).packageGroup as string | undefined;
          const clusterKey = nodeClusterMap[n.id];
          const key = clusterKey ?? (group ? `pkg:${group}` : undefined);
          if (!key) return;
          const center = (boundsToUse as any)[key];
          if (!center) return;
          const dx = center.x - (n.x ?? 0);
          const dy = center.y - (n.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Much stronger pull so nodes reliably settle inside cluster areas
          const pullStrength = Math.min(0.5, 0.15 * (dist / (center.r || 200)) + 0.06);
          if (!isNaN(pullStrength) && isFinite(pullStrength)) {
            n.vx = (n.vx ?? 0) + (dx / (dist || 1)) * pullStrength;
            n.vy = (n.vy ?? 0) + (dy / (dist || 1)) * pullStrength;
          }
          // If outside cluster radius, apply a stronger inward correction scaled to excess
          if (center.r && dist > center.r) {
            const excess = (dist - center.r) / (dist || 1);
            n.vx = (n.vx ?? 0) - dx * 0.02 * excess;
            n.vy = (n.vy ?? 0) - dy * 0.02 * excess;
          }
        });
      }
    } catch (e) {
      // ignore grouping errors
    }

    // No DOM updates needed - React will re-render based on nodes state from useForceSimulation
    // The useForceSimulation hook already calls setNodes on each tick (throttled)
    // React components (NodeItem, LinkItem) will use node.x, node.y from the nodes state
  };

  // main simulation is created after seeding below (so seededNodes can be used)

  // --- Two-phase hierarchical layout: Phase A (package centers) + Phase B (local layouts)
  // Compute package areas and per-node local positions, then seed the main simulation.
  const { packageAreas, localPositions } = React.useMemo(() => {
    try {
      if (!initialNodes || !initialNodes.length) return { packageAreas: {}, localPositions: {} };
      // Group nodes by package/group key
      const groups = new Map<string, any[]>();
      initialNodes.forEach((n: any) => {
        const key = n.packageGroup || n.group || 'root';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(n);
      });

      const groupKeys = Array.from(groups.keys());
      // Build pack layout for package centers
      const children = groupKeys.map((k) => ({ name: k, value: Math.max(1, groups.get(k)!.length) }));
      const root: any = d3.hierarchy({ children } as any);
      root.sum((d: any) => d.value);
      const pack: any = d3.pack().size([width, height]).padding(Math.max(20, Math.min(width, height) * 0.03));
      const packed: any = pack(root);
      const packageAreas: Record<string, { x: number; y: number; r: number }> = {};
      if (packed.children) {
        packed.children.forEach((c: any) => {
          const name = c.data.name;
          packageAreas[name] = { x: c.x, y: c.y, r: Math.max(40, c.r) };
        });
      }

      // For each package, run a short local force simulation offscreen to compute local positions
      const localPositions: Record<string, { x: number; y: number }> = {};
      groups.forEach((nodesInGroup, _key) => {
        if (!nodesInGroup || nodesInGroup.length === 0) return;
        // create shallow copies for the local sim
        const localNodes = nodesInGroup.map((n: any) => ({ id: n.id, x: Math.random() * 10 - 5, y: Math.random() * 10 - 5, size: n.size || 10 }));
        // links restricted to intra-package
        const localLinks = (initialLinks || []).filter((l: any) => {
          const s = typeof l.source === 'string' ? l.source : (l.source && l.source.id);
          const t = typeof l.target === 'string' ? l.target : (l.target && l.target.id);
          return localNodes.some((ln: any) => ln.id === s) && localNodes.some((ln: any) => ln.id === t);
        }).map((l: any) => ({ source: typeof l.source === 'string' ? l.source : l.source.id, target: typeof l.target === 'string' ? l.target : l.target.id }));

        if (localNodes.length === 1) {
          localPositions[localNodes[0].id] = { x: 0, y: 0 };
          return;
        }

        const sim = d3.forceSimulation(localNodes as any)
          .force('link', d3.forceLink(localLinks as any).id((d: any) => d.id).distance(30).strength(0.8))
          .force('charge', d3.forceManyBody().strength(-15))
          .force('collide', d3.forceCollide((d: any) => (d.size || 10) + 6).iterations(2))
          .stop();

        // Run several synchronous ticks to settle local layout
        const ticks = 300;
        for (let i = 0; i < ticks; i++) sim.tick();

        localNodes.forEach((ln: any) => {
          localPositions[ln.id] = { x: ln.x ?? 0, y: ln.y ?? 0 };
        });
      });

      return { packageAreas, localPositions };
    } catch (e) {
      return { packageAreas: {}, localPositions: {} };
    }
  }, [initialNodes, initialLinks, width, height]);

  // Seed main simulation nodes with package-local coordinates mapped into package areas
  const seededNodes = React.useMemo(() => {
    if (!initialNodes || !Object.keys(packageAreas || {}).length) return initialNodes;
    return initialNodes.map((n: any) => {
      const key = n.packageGroup || n.group || 'root';
      const area = packageAreas[key];
      const lp = localPositions[n.id];
      if (!area || !lp) return n;
      // scale local layout to fit inside package radius
      const scale = Math.max(0.5, (area.r * 0.6) / (Math.max(1, Math.sqrt(lp.x * lp.x + lp.y * lp.y)) || 1));
      return { ...n, x: area.x + lp.x * scale, y: area.y + lp.y * scale };
    });
  }, [initialNodes, packageAreas, localPositions]);


  // Compute dependency-based clusters (connected components on dependency links)
  // create the main force simulation using seeded nodes
  const { nodes, links, restart, stop, setForcesEnabled } = useForceSimulation(seededNodes || initialNodes, initialLinks, {
    width,
    height,
    chargeStrength: manualLayout ? 0 : undefined,
    onTick,
    ...simulationOptions,
  });

  // Helper map id -> node for quick lookup in onTick
  const nodesById = React.useMemo(() => {
    const m: Record<string, any> = {};
    (nodes || []).forEach((n: any) => {
      if (n && n.id) m[n.id] = n;
    });
    return m;
  }, [nodes]);

  const clusterBounds = React.useMemo(() => {
    try {
      if (!links || !nodes) return null;
      const nodeIds = new Set(nodes.map((n) => n.id));
      const adj = new Map<string, Set<string>>();
      nodes.forEach((n) => adj.set(n.id, new Set()));
      links.forEach((l: any) => {
        const type = l.type || 'reference';
        if (type !== 'dependency') return;
        const s = typeof l.source === 'string' ? l.source : (l.source && l.source.id) || null;
        const t = typeof l.target === 'string' ? l.target : (l.target && l.target.id) || null;
        if (!s || !t) return;
        if (!nodeIds.has(s) || !nodeIds.has(t)) return;
        adj.get(s)?.add(t);
        adj.get(t)?.add(s);
      });

      const visited = new Set<string>();
      const comps: Array<string[]> = [];
      for (const nid of nodeIds) {
        if (visited.has(nid)) continue;
        const stack = [nid];
        const comp: string[] = [];
        visited.add(nid);
        while (stack.length) {
          const cur = stack.pop()!;
          comp.push(cur);
          const neigh = adj.get(cur);
          if (!neigh) continue;
          for (const nb of neigh) {
            if (!visited.has(nb)) {
              visited.add(nb);
              stack.push(nb);
            }
          }
        }
        comps.push(comp);
      }

      if (comps.length <= 1) return null;

      // Increase spread: scale the packing area slightly larger than viewport,
      // give more padding between clusters, and bias radii upward so nodes
      // have more room to sit inside cluster circles.
      const children = comps.map((c, i) => ({ name: String(i), value: Math.max(1, c.length) }));
      d3.hierarchy({ children } as any).sum((d: any) => d.value).sort((a: any, b: any) => b.value - a.value);
      // Use a radial layout to guarantee very large separation between clusters.
      // Place cluster centers on a circle around the viewport center with a
      // radius scaled aggressively by viewport size and cluster count.
      const num = comps.length;
      const cx = width / 2;
      const cy = height / 2;
      // Circle radius grows with viewport and number of clusters to force separation
      const base = Math.max(width, height);
      // Make cluster circle radius extremely large so clusters are very far apart.
      // Scale with number of clusters to avoid crowding; multiply heavily for drastic separation.
      const circleRadius = base * Math.max(30, num * 20, Math.sqrt(num) * 12);
      const map: Record<string, { x: number; y: number; r: number }> = {};
      comps.forEach((c, i) => {
        const angle = (2 * Math.PI * i) / num;
        const x = cx + Math.cos(angle) * circleRadius;
        const y = cy + Math.sin(angle) * circleRadius;
        const sizeBias = Math.sqrt(Math.max(1, c.length));
        const r = Math.max(200, 100 * sizeBias);
        map[`cluster:${i}`] = { x, y, r };
      });
      // Map node id -> cluster id center
      const nodeToCluster: Record<string, string> = {};
      comps.forEach((c, i) => c.forEach((nid) => (nodeToCluster[nid] = `cluster:${i}`)));
      return { bounds: map, nodeToCluster };
    } catch (e) {
      return null;
    }
  }, [nodes, links, width, height]);

  // If package or cluster bounds are provided, recreate the simulation so onTick gets the latest bounds
  useEffect(() => {
    if (!packageBounds && !clusterBounds && (!packageAreas || Object.keys(packageAreas).length === 0)) return;
    try {
      restart();
    } catch (e) {
      // ignore
    }
  }, [packageBounds, clusterBounds, packageAreas, restart]);

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
        transformRef.current = event.transform;
        setTransform(event.transform);
      });

    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, [enableZoom]);

  // Run a one-time DOM positioning pass when nodes/links change so elements
  // rendered by React are positioned to the simulation's seeded coordinates
  useEffect(() => {
    if (!gRef.current) return;
    try {
      const g = d3.select(gRef.current);
      g.selectAll<SVGGElement, any>('g.node').each(function (this: SVGGElement) {
        const datum = d3.select(this).datum() as any;
        if (!datum) return;
        d3.select(this).attr('transform', `translate(${datum.x || 0},${datum.y || 0})`);
      });

      g.selectAll<SVGLineElement, any>('line').each(function (this: SVGLineElement) {
        const l = d3.select(this).datum() as any;
        if (!l) return;
        const s: any = typeof l.source === 'object' ? l.source : nodes.find((n) => n.id === l.source) || l.source;
        const t: any = typeof l.target === 'object' ? l.target : nodes.find((n) => n.id === l.target) || l.target;
        if (!s || !t) return;
        d3.select(this).attr('x1', s.x).attr('y1', s.y).attr('x2', t.x).attr('y2', t.y);
      });
    } catch (e) {
      // ignore
    }
  }, [nodes, links]);

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
      const t: any = transformRef.current;
      const x = (event.clientX - rect.left - t.x) / t.k;
      const y = (event.clientY - rect.top - t.y) / t.k;
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
  }, [enableDrag]);

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
        
        {/* Render links via LinkItem (positions updated by D3) */}
        {links.map((link, i) => (
          <LinkItem
            key={`link-${i}`}
            link={link as GraphLink}
            onClick={handleLinkClick}
            defaultWidth={defaultLinkWidth}
            showLabel={showLinkLabels}
            nodes={nodes}
          />
        ))}

        {/* Render nodes via NodeItem (D3 will set transforms) */}
        {nodes.map((node) => (
          <NodeItem
            key={node.id}
            node={node as GraphNode}
            isSelected={selectedNodeId === node.id}
            isHovered={hoveredNodeId === node.id}
            pinned={pinnedNodes.has(node.id)}
            defaultNodeSize={defaultNodeSize}
            defaultNodeColor={defaultNodeColor}
            showLabel={showNodeLabels}
            onClick={handleNodeClick}
            onDoubleClick={handleNodeDoubleClick}
            onMouseEnter={handleNodeMouseEnter}
            onMouseLeave={handleNodeMouseLeave}
            onMouseDown={handleDragStart}
          />
        ))}
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