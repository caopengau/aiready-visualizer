import { getLatestAnalysis } from '../src/lib/db/analysis';
import { getAnalysis } from '../src/lib/storage';
import { GraphBuilder } from '../src/lib/graph-builder';

async function test() {
  const repoId = '86687a20-2aef-4684-a296-bb8bea4b3b6f';
  const analysis = await getLatestAnalysis(repoId);

  if (!analysis) {
    console.log('No analysis found');
    return;
  }

  const rawKey = (analysis as any).rawKey;
  const raw = await getAnalysis(rawKey);
  if (!raw) {
    console.log('Could not load from S3');
    return;
  }

  const graph = GraphBuilder.buildFromReport(raw);

  const nodesWithCost = graph.nodes.filter((n) => n.tokenCost != null);
  const nodesWithoutCost = graph.nodes.filter((n) => n.tokenCost == null);

  console.log(`Total nodes: ${graph.nodes.length}`);
  console.log(`Nodes WITH context budget: ${nodesWithCost.length}`);
  console.log(`Nodes WITHOUT context budget: ${nodesWithoutCost.length}`);

  if (nodesWithCost.length > 0) {
    console.log('\nSample nodes with budget:');
    nodesWithCost.slice(0, 3).forEach((n) => {
      console.log(`  ${n.label}: ${n.tokenCost?.toLocaleString()} tokens`);
    });
    console.log('\n✅ Context Budget is being populated!');
  } else {
    console.log('\n❌ No nodes have context budget data');
  }
}

test().catch(console.error);
