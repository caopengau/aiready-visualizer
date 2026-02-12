import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  [key: string]: any;
}

export interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: string | SimulationNode;
  target: string | SimulationNode;
  [key: string]: any;
}

export interface ForceSimulationOptions {
  /**
   * Strength of the charge force (repulsion between nodes)
   * @default -300
   */
  chargeStrength?: number;

  /**
   * Distance for links between nodes
   * @default 100
   */
  linkDistance?: number;

  /**
   * Strength of the link force
   * @default 1
   */
  linkStrength?: number;

  /**
   * Strength of collision detection
   * @default 1
   */
  collisionStrength?: number;

  /**
   * Radius for collision detection (node size)
   * @default 10
   */
  collisionRadius?: number;

  /**
   * Strength of centering force
   * @default 0.1
   */
  centerStrength?: number;

  /**
   * Width of the simulation space
   */
  width: number;

  /**
   * Height of the simulation space
   */
  height: number;

  /**
   * Alpha decay rate (how quickly the simulation cools down)
   * @default 0.0228
   */
  alphaDecay?: number;

  /**
   * Alpha target controls the resting energy of the simulation. When set to 0
   * the simulation will cool and stop moving once forces settle. Increase to
   * keep the graph more dynamic.
   * @default 0
   */
  alphaTarget?: number;

  /**
   * Warm alpha used when (re)starting the simulation to give it a small amount
   * of energy. This mirrors the Observable example which sets a modest
   * alphaTarget when dragging instead of forcing alpha to 1.
   * @default 0.3
   */
  warmAlpha?: number;

  /**
   * Minimum alpha threshold below which the simulation is considered cooled
   * and will stop. Increasing this makes the simulation stop earlier.
   * @default 0.01
   */
  alphaMin?: number;

  /**
   * When true, zero node velocities and snap positions when the simulation
   * stops to reduce residual jitter.
   * @default true
   */
  stabilizeOnStop?: boolean;

  /**
   * Maximum time (ms) to allow the simulation to run after creation/restart.
   * If the simulation hasn't cooled by this time, it will be force-stopped
   * to prevent indefinite animation. Set to 0 to disable.
   * @default 3000
   */
  maxSimulationTimeMs?: number;

  /**
   * Velocity decay (friction)
   * @default 0.4
   */
  velocityDecay?: number;

  /**
   * Optional tick callback invoked on each simulation tick with current nodes/links and the simulation instance
   */
  onTick?: (nodes: SimulationNode[], links: SimulationLink[], sim: d3.Simulation<SimulationNode, SimulationLink>) => void;
}

export interface UseForceSimulationReturn {
  /**
   * Current nodes with positions
   */
  nodes: SimulationNode[];

  /**
   * Current links
   */
  links: SimulationLink[];

  /**
   * Restart the simulation
   */
  restart: () => void;

  /**
   * Stop the simulation
   */
  stop: () => void;

  /**
   * Whether the simulation is currently running
   */
  isRunning: boolean;

  /**
   * Current alpha value (simulation heat)
   */
  alpha: number;
}

/**
 * Hook for managing d3-force simulations
 * Automatically handles simulation lifecycle, tick updates, and cleanup
 *
 * @param initialNodes - Initial nodes for the simulation
 * @param initialLinks - Initial links for the simulation
 * @param options - Configuration options for the force simulation
 * @returns Simulation state and control functions
 *
 * @example
 * ```tsx
 * function NetworkGraph() {
 *   const nodes = [
 *     { id: 'node1', name: 'Node 1' },
 *     { id: 'node2', name: 'Node 2' },
 *     { id: 'node3', name: 'Node 3' },
 *   ];
 *
 *   const links = [
 *     { source: 'node1', target: 'node2' },
 *     { source: 'node2', target: 'node3' },
 *   ];
 *
 *   const { nodes: simulatedNodes, links: simulatedLinks, restart } = useForceSimulation(
 *     nodes,
 *     links,
 *     {
 *       width: 800,
 *       height: 600,
 *       chargeStrength: -500,
 *       linkDistance: 150,
 *     }
 *   );
 *
 *   return (
 *     <svg width={800} height={600}>
 *       {simulatedLinks.map((link, i) => (
 *         <line
 *           key={i}
 *           x1={(link.source as SimulationNode).x}
 *           y1={(link.source as SimulationNode).y}
 *           x2={(link.target as SimulationNode).x}
 *           y2={(link.target as SimulationNode).y}
 *           stroke="#999"
 *         />
 *       ))}
 *       {simulatedNodes.map((node) => (
 *         <circle
 *           key={node.id}
 *           cx={node.x}
 *           cy={node.y}
 *           r={10}
 *           fill="#69b3a2"
 *         />
 *       ))}
 *     </svg>
 *   );
 * }
 * ```
 */
export function useForceSimulation(
  initialNodes: SimulationNode[],
  initialLinks: SimulationLink[],
  options: ForceSimulationOptions
): UseForceSimulationReturn & { setForcesEnabled: (enabled: boolean) => void } {
  const {
    chargeStrength = -300,
    linkDistance = 100,
    linkStrength = 1,
    collisionStrength = 1,
    collisionRadius = 10,
    centerStrength = 0.1,
    width,
    height,
    alphaDecay = 0.0228,
    velocityDecay = 0.4,
    alphaTarget = 0,
    warmAlpha = 0.3,
    alphaMin = 0.01,
    // @ts-ignore allow extra option
    stabilizeOnStop = true,
    onTick,
    // Optional throttle in milliseconds for tick updates (reduce React re-renders)
    // Lower values = smoother but more CPU; default ~30ms (~33fps)
    // @ts-ignore allow extra option
    tickThrottleMs = 33,
    // @ts-ignore allow extra option
    maxSimulationTimeMs = 3000,
  } = options;

  const [nodes, setNodes] = useState<SimulationNode[]>(initialNodes);
  const [links, setLinks] = useState<SimulationLink[]>(initialLinks);
  const [isRunning, setIsRunning] = useState(false);
  const [alpha, setAlpha] = useState(1);

  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  // Create lightweight keys for nodes/links so we only recreate the simulation
  // when the actual identity/content of inputs change (not when parent passes
  // new array references on each render).
  const nodesKey = initialNodes.map((n) => n.id).join('|');
  const linksKey = (initialLinks || []).map((l) => {
    const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
    const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
    return `${s}->${t}:${(l as any).type || ''}`;
  }).join('|');

  useEffect(() => {
    // Create a copy of nodes and links to avoid mutating the original data
    const nodesCopy = initialNodes.map((node) => ({ ...node }));
    const linksCopy = initialLinks.map((link) => ({ ...link }));

    // ALWAYS seed initial positions to ensure nodes don't stack at origin
    // This is critical for force-directed graphs to work properly
    try {
      // Always seed positions for all nodes when simulation is created
      // This ensures nodes start spread out even if they have coordinates
      nodesCopy.forEach((n, i) => {
        // Use deterministic but more widely spread positions based on index
        const angle = (i * 2 * Math.PI) / nodesCopy.length;
        // Larger seed radius to encourage an initial spread
        const radius = Math.min(width, height) * 0.45;
        n.x = width / 2 + radius * Math.cos(angle);
        n.y = height / 2 + radius * Math.sin(angle);
        // Add very small random velocity to avoid large initial motion
        (n as any).vx = (Math.random() - 0.5) * 2;
        (n as any).vy = (Math.random() - 0.5) * 2;
      });
    } catch (e) {
      // If error, fall back to random positions
      nodesCopy.forEach((n) => {
        n.x = Math.random() * width;
        n.y = Math.random() * height;
        (n as any).vx = (Math.random() - 0.5) * 10;
        (n as any).vy = (Math.random() - 0.5) * 10;
      });
    }

    // Create the simulation
    const simulation = (d3.forceSimulation(nodesCopy as any) as unknown) as d3.Simulation<SimulationNode, SimulationLink>;

    // Configure link force separately to avoid using generic type args on d3 helpers
    try {
      const linkForce = (d3.forceLink(linksCopy as any) as unknown) as d3.ForceLink<SimulationNode, SimulationLink>;
      linkForce.id((d: any) => d.id).distance((d: any) => (d && d.distance != null ? d.distance : linkDistance)).strength(linkStrength);
      simulation.force('link', linkForce as any);
    } catch (e) {
      // fallback: attach a plain link force
      try { simulation.force('link', d3.forceLink(linksCopy as any) as any); } catch (e) {}
    }
      ;

    try {
      simulation.force('charge', d3.forceManyBody().strength(chargeStrength) as any);
      simulation.force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength) as any);
      const collide = d3.forceCollide().radius((d: any) => {
        const nodeSize = (d && d.size) ? d.size : 10;
        return nodeSize + collisionRadius;
      }).strength(collisionStrength as any) as any;
      simulation.force('collision', collide);
      simulation.force('x', d3.forceX(width / 2).strength(Math.max(0.02, centerStrength * 0.5)) as any);
      simulation.force('y', d3.forceY(height / 2).strength(Math.max(0.02, centerStrength * 0.5)) as any);
      simulation.alphaDecay(alphaDecay);
      simulation.velocityDecay(velocityDecay);
      simulation.alphaMin(alphaMin);
      try { simulation.alphaTarget(alphaTarget); } catch (e) {}
      try { simulation.alpha(warmAlpha); } catch (e) {}
    } catch (e) {
      // ignore force configuration errors
    }

    simulationRef.current = simulation;

    // Force-stop timeout to ensure simulation doesn't run forever.
    if (stopTimeoutRef.current != null) {
      try { (globalThis.clearTimeout as any)(stopTimeoutRef.current); } catch (e) {}
      stopTimeoutRef.current = null;
    }
    if (maxSimulationTimeMs && maxSimulationTimeMs > 0) {
      stopTimeoutRef.current = (globalThis.setTimeout as any)(() => {
        try {
          if (stabilizeOnStop) {
            nodesCopy.forEach((n) => {
              (n as any).vx = 0;
              (n as any).vy = 0;
              if (typeof n.x === 'number') n.x = Number(n.x.toFixed(3));
              if (typeof n.y === 'number') n.y = Number(n.y.toFixed(3));
            });
          }
          simulation.alpha(0);
          simulation.stop();
        } catch (e) {}
        setIsRunning(false);
        setNodes([...nodesCopy]);
        setLinks([...linksCopy]);
      }, maxSimulationTimeMs) as unknown as number;
    }

    // Update state on each tick. Batch updates via requestAnimationFrame to avoid
    // excessive React re-renders which can cause visual flicker.
    let rafId: number | null = null;
    let lastUpdate = 0;
    const tickHandler = () => {
      try {
        if (typeof onTick === 'function') onTick(nodesCopy, linksCopy, simulation);
      } catch (e) {
        // ignore user tick errors
      }

      // If simulation alpha has cooled below the configured minimum, stop it to
      // ensure nodes don't drift indefinitely (acts as a hard-stop safeguard).
      try {
        if (simulation.alpha() <= (alphaMin as number)) {
          try {
            if (stabilizeOnStop) {
              nodesCopy.forEach((n) => {
                (n as any).vx = 0;
                (n as any).vy = 0;
                if (typeof n.x === 'number') n.x = Number(n.x.toFixed(3));
                if (typeof n.y === 'number') n.y = Number(n.y.toFixed(3));
              });
            }
            simulation.stop();
          } catch (e) {}
          setAlpha(simulation.alpha());
          setIsRunning(false);
          setNodes([...nodesCopy]);
          setLinks([...linksCopy]);
          return;
        }
      } catch (e) {
        // ignore
      }

      const now = Date.now();
      const shouldUpdate = now - lastUpdate >= (tickThrottleMs as number);
      if (rafId == null && shouldUpdate) {
        rafId = (globalThis.requestAnimationFrame || ((cb: FrameRequestCallback) => setTimeout(cb, 16)))(() => {
          rafId = null;
          lastUpdate = Date.now();
          setNodes([...nodesCopy]);
          setLinks([...linksCopy]);
          setAlpha(simulation.alpha());
          setIsRunning(simulation.alpha() > simulation.alphaMin());
        }) as unknown as number;
      }
    };

    simulation.on('tick', tickHandler);

    simulation.on('end', () => {
      setIsRunning(false);
    });

    // Cleanup on unmount
    return () => {
      try {
        simulation.on('tick', null as any);
      } catch (e) {}
      if (stopTimeoutRef.current != null) {
        try { (globalThis.clearTimeout as any)(stopTimeoutRef.current); } catch (e) {}
        stopTimeoutRef.current = null;
      }
      if (rafId != null) {
        try { (globalThis.cancelAnimationFrame || ((id: number) => clearTimeout(id)))(rafId); } catch (e) {}
        rafId = null;
      }
      simulation.stop();
    };
  }, [
    nodesKey,
    linksKey,
    chargeStrength,
    linkDistance,
    linkStrength,
    collisionStrength,
    collisionRadius,
    centerStrength,
    width,
    height,
    alphaDecay,
    velocityDecay,
    alphaTarget,
    alphaMin,
    stabilizeOnStop,
    tickThrottleMs,
    maxSimulationTimeMs,
  ]);

  const restart = () => {
    if (simulationRef.current) {
      // Reheat the simulation to a modest alpha target rather than forcing
      // full heat; this matches the Observable pattern and helps stability.
      try { simulationRef.current.alphaTarget(warmAlpha).restart(); } catch (e) { simulationRef.current.restart(); }
      setIsRunning(true);
      // Reset safety timeout when simulation is manually restarted
      if (stopTimeoutRef.current != null) {
        try { (globalThis.clearTimeout as any)(stopTimeoutRef.current); } catch (e) {}
        stopTimeoutRef.current = null;
      }
      if (maxSimulationTimeMs && maxSimulationTimeMs > 0) {
        stopTimeoutRef.current = (globalThis.setTimeout as any)(() => {
          try { simulationRef.current?.alpha(0); simulationRef.current?.stop(); } catch (e) {}
          setIsRunning(false);
        }, maxSimulationTimeMs) as unknown as number;
      }
    }
  };

  const stop = () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      setIsRunning(false);
    }
  };

  const originalForcesRef = useRef({ charge: chargeStrength, link: linkStrength, collision: collisionStrength });
  const forcesEnabledRef = useRef(true);

  const setForcesEnabled = (enabled: boolean) => {
    const sim = simulationRef.current;
    if (!sim) return;
    // avoid repeated updates
    if (forcesEnabledRef.current === enabled) return;
    forcesEnabledRef.current = enabled;

    try {
      // Only toggle charge and link forces to avoid collapse; keep collision/centering
      const charge: any = sim.force('charge');
      if (charge && typeof charge.strength === 'function') {
        charge.strength(enabled ? originalForcesRef.current.charge : 0);
      }

      const link: any = sim.force('link');
      if (link && typeof link.strength === 'function') {
        link.strength(enabled ? originalForcesRef.current.link : 0);
      }
    } catch (e) {
      // ignore
    }
  };

  return {
    nodes,
    links,
    restart,
    stop,
    isRunning,
    alpha,
    setForcesEnabled,
  };
}

/**
 * Hook for creating a draggable force simulation
 * Provides drag handlers that can be attached to node elements
 *
 * @param simulation - The d3 force simulation instance
 * @returns Drag behavior that can be applied to nodes
 *
 * @example
 * ```tsx
 * function DraggableNetworkGraph() {
 *   const simulation = useRef<d3.Simulation<SimulationNode, SimulationLink>>();
 *   const drag = useDrag(simulation.current);
 *
 *   return (
 *     <svg>
 *       {nodes.map((node) => (
 *         <circle
 *           key={node.id}
 *           {...drag}
 *           cx={node.x}
 *           cy={node.y}
 *           r={10}
 *         />
 *       ))}
 *     </svg>
 *   );
 * }
 * ```
 */
export function useDrag(simulation: d3.Simulation<SimulationNode, any> | null | undefined) {
  const dragStarted = (event: any, node: SimulationNode) => {
    if (!simulation) return;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
  };

  const dragged = (event: any, node: SimulationNode) => {
    node.fx = event.x;
    node.fy = event.y;
  };

  const dragEnded = (event: any, node: SimulationNode) => {
    if (!simulation) return;
    if (!event.active) simulation.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  };

  return {
    onDragStart: dragStarted,
    onDrag: dragged,
    onDragEnd: dragEnded,
  };
}