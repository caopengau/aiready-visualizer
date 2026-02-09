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
   * Velocity decay (friction)
   * @default 0.4
   */
  velocityDecay?: number;
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
): UseForceSimulationReturn {
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
  } = options;

  const [nodes, setNodes] = useState<SimulationNode[]>(initialNodes);
  const [links, setLinks] = useState<SimulationLink[]>(initialLinks);
  const [isRunning, setIsRunning] = useState(false);
  const [alpha, setAlpha] = useState(1);

  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);

  useEffect(() => {
    // Create a copy of nodes and links to avoid mutating the original data
    const nodesCopy = initialNodes.map((node) => ({ ...node }));
    const linksCopy = initialLinks.map((link) => ({ ...link }));

    // Create the simulation
    const simulation = d3
      .forceSimulation<SimulationNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, SimulationLink>(linksCopy)
          .id((d) => d.id)
          .distance(linkDistance)
          .strength(linkStrength)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
      .force(
        'collision',
        d3.forceCollide<SimulationNode>().radius(collisionRadius).strength(collisionStrength)
      )
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay);

    simulationRef.current = simulation;

    // Update state on each tick
    simulation.on('tick', () => {
      setNodes([...nodesCopy]);
      setLinks([...linksCopy]);
      setAlpha(simulation.alpha());
      setIsRunning(simulation.alpha() > simulation.alphaMin());
    });

    simulation.on('end', () => {
      setIsRunning(false);
    });

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [
    initialNodes,
    initialLinks,
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
  ]);

  const restart = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
      setIsRunning(true);
    }
  };

  const stop = () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      setIsRunning(false);
    }
  };

  return {
    nodes,
    links,
    restart,
    stop,
    isRunning,
    alpha,
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