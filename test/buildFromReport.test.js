import { test, expect } from 'vitest';
import { createSampleGraph } from '../src/graph/builder';
test('createSampleGraph produces nodes', () => {
    const graph = createSampleGraph();
    expect(graph).toBeDefined();
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(graph.nodes.length).toBeGreaterThan(0);
});
