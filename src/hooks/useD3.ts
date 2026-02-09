import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Hook for managing D3 selections with React lifecycle
 * Provides a ref to the SVG/container element and runs a render function when dependencies change
 *
 * @param renderFn - Function that receives the D3 selection and performs rendering
 * @param dependencies - Array of dependencies that trigger re-render
 * @returns Ref to attach to the SVG/container element
 *
 * @example
 * ```tsx
 * function BarChart({ data }: { data: number[] }) {
 *   const ref = useD3(
 *     (svg) => {
 *       const width = 600;
 *       const height = 400;
 *       const margin = { top: 20, right: 20, bottom: 30, left: 40 };
 *
 *       // Clear previous content
 *       svg.selectAll('*').remove();
 *
 *       // Set up scales
 *       const x = d3.scaleBand()
 *         .domain(data.map((_, i) => i.toString()))
 *         .range([margin.left, width - margin.right])
 *         .padding(0.1);
 *
 *       const y = d3.scaleLinear()
 *         .domain([0, d3.max(data) || 0])
 *         .range([height - margin.bottom, margin.top]);
 *
 *       // Draw bars
 *       svg.selectAll('rect')
 *         .data(data)
 *         .join('rect')
 *         .attr('x', (_, i) => x(i.toString())!)
 *         .attr('y', d => y(d))
 *         .attr('width', x.bandwidth())
 *         .attr('height', d => y(0) - y(d))
 *         .attr('fill', 'steelblue');
 *     },
 *     [data]
 *   );
 *
 *   return <svg ref={ref} width={600} height={400} />;
 * }
 * ```
 */
export function useD3<T extends SVGSVGElement | HTMLDivElement>(
  renderFn: (selection: d3.Selection<T, unknown, null, undefined>) => void,
  dependencies: React.DependencyList = []
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      const selection = d3.select(ref.current);
      renderFn(selection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref;
}

/**
 * Hook for managing D3 selections with automatic resize handling
 * Similar to useD3 but also triggers re-render on window resize
 *
 * @param renderFn - Function that receives the D3 selection and performs rendering
 * @param dependencies - Array of dependencies that trigger re-render
 * @returns Ref to attach to the SVG/container element
 *
 * @example
 * ```tsx
 * function ResponsiveChart({ data }: { data: number[] }) {
 *   const ref = useD3WithResize(
 *     (svg) => {
 *       const container = svg.node();
 *       const width = container?.clientWidth || 600;
 *       const height = container?.clientHeight || 400;
 *
 *       // Render with responsive dimensions
 *       // ...
 *     },
 *     [data]
 *   );
 *
 *   return <svg ref={ref} style={{ width: '100%', height: '400px' }} />;
 * }
 * ```
 */
export function useD3WithResize<T extends SVGSVGElement | HTMLDivElement>(
  renderFn: (selection: d3.Selection<T, unknown, null, undefined>) => void,
  dependencies: React.DependencyList = []
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const selection = d3.select(ref.current);
    const render = () => renderFn(selection);

    // Initial render
    render();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(ref.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref;
}