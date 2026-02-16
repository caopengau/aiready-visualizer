import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FileNode, GraphData, ThemeColors, EffectiveTheme } from '../types';
import { severityColors, edgeColors, GRAPH_CONFIG } from '../constants';
import { getEdgeDistance, getEdgeStrength, getEdgeOpacity, getEdgeStrokeWidth } from '../utils';

interface GraphCanvasProps {
  data: GraphData;
  dimensions: { width: number; height: number };
  colors: ThemeColors;
  effectiveTheme: EffectiveTheme;
  onNodeClick: (node: FileNode | null) => void;
}

export function GraphCanvas({
  data,
  dimensions,
  colors,
  effectiveTheme,
  onNodeClick,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  useEffect(() => {
    if (!data || !svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    
    // Get actual SVG dimensions from the DOM element
    const svgRect = svgRef.current.getBoundingClientRect();
    const width = svgRect.width;
    const height = svgRect.height;

    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([GRAPH_CONFIG.zoomMin, GRAPH_CONFIG.zoomMax])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        zoomTransformRef.current = event.transform;
      });
    svg.call(zoom);
    svg.call(zoom.transform, zoomTransformRef.current);

    // Prepare nodes and links
    const nodes = data.nodes.map((d, i) => {
      // Initialize nodes in a circle around center with slight random spread
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const radius = 50 + Math.random() * 30;
      return {
        ...d,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
      };
    });
    const links = data.edges.map(d => ({ ...d }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3.forceLink(links)
          .id((d: unknown) => (d as { id: string }).id)
          .distance((d: unknown) => getEdgeDistance((d as { type: string }).type))
          .strength((d: unknown) => getEdgeStrength((d as { type: string }).type))
      )
      .force('charge', d3.forceManyBody().strength(GRAPH_CONFIG.simulation.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(GRAPH_CONFIG.collisionRadius))
      .force('x', d3.forceX(width / 2).strength(GRAPH_CONFIG.simulation.centerStrength))
      .force('y', d3.forceY(height / 2).strength(GRAPH_CONFIG.simulation.centerStrength));

    // Create link group
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d: unknown) => edgeColors[(d as { type: string }).type] || edgeColors.default)
      .attr('stroke-opacity', (d: unknown) => getEdgeOpacity((d as { type: string }).type))
      .attr('stroke-width', (d: unknown) => getEdgeStrokeWidth((d as { type: string }).type));

    // Create node group
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      );

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', (d: unknown) => Math.sqrt((d as { value: number }).value || 10) + GRAPH_CONFIG.nodeBaseRadius)
      .attr('fill', (d: unknown) => (d as { color: string }).color || severityColors.default)
      .attr('stroke', effectiveTheme === 'dark' ? '#fff' : '#000')
      .attr('stroke-width', 1.5);

    // Add labels to nodes
    node
      .append('text')
      .text((d: unknown) => ((d as { label: string }).label.split('/').pop() || (d as { label: string }).label))
      .attr('x', 0)
      .attr('y', (d: unknown) => Math.sqrt((d as { value: number }).value || 10) + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', effectiveTheme === 'dark' ? '#e2e8f0' : '#1e293b')
      .attr('font-size', '9px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('pointer-events', 'none');

    // Add tooltips
    node.append('title').text((d: unknown) => (d as { title: string }).title);

    // Event handlers
    node.on('click', (event: unknown, d: unknown) => {
      (event as Event).stopPropagation();
      onNodeClick(d as FileNode);
    });
    svg.on('click', () => onNodeClick(null));

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: unknown) => (d as { source: { x: number } }).source.x)
        .attr('y1', (d: unknown) => (d as { source: { y: number } }).source.y)
        .attr('x2', (d: unknown) => (d as { target: { x: number } }).target.x)
        .attr('y2', (d: unknown) => (d as { target: { y: number } }).target.y);

      node.attr('transform', (d: unknown) => `translate(${(d as { x: number }).x},${(d as { y: number }).y})`);
    });

    // Drag functions
    function dragstarted(event: unknown, d: unknown) {
      if (!(event as { active: boolean }).active) simulation.alphaTarget(0.3).restart();
      (d as { fx: number | null }).fx = (d as { x: number }).x;
      (d as { fy: number | null }).fy = (d as { y: number }).y;
    }

    function dragged(event: unknown, d: unknown) {
      (d as { fx: number }).fx = (event as { x: number }).x;
      (d as { fy: number }).fy = (event as { y: number }).y;
    }

    function dragended(event: unknown, d: unknown) {
      if (!(event as { active: boolean }).active) simulation.alphaTarget(0);
      (d as { fx: null }).fx = null;
      (d as { fy: null }).fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, effectiveTheme, onNodeClick]);

  return (
    <div className="flex-1 relative w-full h-full">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block', backgroundColor: 'transparent', zIndex: 10, position: 'absolute', top: 0, left: 0 }}
      />
      <div className="absolute bottom-6 left-6 z-20">
        <div
          className="px-4 py-2.5 rounded-lg backdrop-blur-sm border text-xs flex items-center gap-2"
          style={{
            backgroundColor: `${colors.panel}ee`,
            borderColor: colors.panelBorder,
            color: colors.textMuted,
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
            />
          </svg>
          <span>Drag to move • Scroll to zoom • Click for details</span>
        </div>
      </div>
    </div>
  );
}
