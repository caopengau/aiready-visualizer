const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/report-data.json', 'utf8'));

// Replicate transform logic
const nodeMap = new Map();
for (const ctx of data.context) {
  nodeMap.set(ctx.file, ctx);
}

const edges = [];

// Add similarity edges from duplicates
for (const dup of data.duplicates || []) {
  if (nodeMap.has(dup.file1) && nodeMap.has(dup.file2)) {
    const exists = edges.some(e =>
      (e.source === dup.file1 && e.target === dup.file2) ||
      (e.source === dup.file2 && e.target === dup.file1)
    );
    if (!exists) {
      edges.push({ source: dup.file1, target: dup.file2, type: 'similarity' });
    }
  }
}

// Add dependency edges
for (const ctx of data.context) {
  for (const dep of ctx.dependencyList || []) {
    if (dep.startsWith('.') || dep.startsWith('/')) {
      const targetFile = [...nodeMap.keys()].find(k => k.endsWith(dep.replace(/^\.\/?/, '')));
      if (targetFile && targetFile !== ctx.file) {
        edges.push({ source: ctx.file, target: targetFile, type: 'dependency' });
      }
    }
  }
}

// Add related edges
for (const ctx of data.context) {
  for (const related of ctx.relatedFiles || []) {
    if (nodeMap.has(related) && related !== ctx.file) {
      const exists = edges.some(e =>
        (e.source === ctx.file && e.target === related) ||
        (e.source === related && e.target === ctx.file)
      );
      if (!exists) edges.push({ source: ctx.file, target: related, type: 'related' });
    }
  }
}

console.log('Total edges created:', edges.length);
console.log('Edge types:', edges.map(e => e.type));
