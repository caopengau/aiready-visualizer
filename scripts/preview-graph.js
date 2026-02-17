const fs = require('fs');
const path = require('path');

/**
 * Find the latest aiready report
 */
function findLatestReport(basePath) {
  const aireadyDir = path.resolve(basePath, '.aiready');
  if (!fs.existsSync(aireadyDir)) return null;
  
  const files = fs.readdirSync(aireadyDir)
    .filter(f => f.startsWith('aiready-report-') && f.endsWith('.json'));
  
  if (files.length === 0) return null;
  
  const sorted = files
    .map(f => ({
      name: f,
      path: path.resolve(aireadyDir, f),
      mtime: fs.statSync(path.resolve(aireadyDir, f)).mtime
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  
  return sorted[0].path;
}

const basePath = path.resolve(process.cwd(), '..', '..');
const reportPath = findLatestReport(basePath);

if (!reportPath) {
  console.error('No aiready report found. Run: aiready scan --output json');
  process.exit(1);
}

console.log(`Using report: ${path.relative(basePath, reportPath)}`);
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const patterns = report.patterns || [];
const fileMap = new Map();
const severityRank = { critical: 4, major: 3, minor: 2, info: 1 };
const severityColor = { critical: '#ef4444', major: '#f97316', minor: '#f59e0b', info: '#60a5fa' };

for (const p of patterns) {
  const id = String(p.fileName);
  const label = id.split('/').slice(-2).join('/');
  const issues = Array.isArray(p.issues) ? p.issues : [];
  let top = 'info';
  for (const it of issues) {
    const s = (it.severity || 'info').toLowerCase();
    if ((severityRank[s] || 0) > (severityRank[top] || 0)) top = s;
  }
  const tokenCost = (p.metrics && p.metrics.tokenCost) || 0;
  const size = Math.round(10 + Math.min(40, Math.log(Math.max(1, tokenCost)) * 6 + issues.length * 2));
  fileMap.set(id, { id, label, color: severityColor[top] || '#60a5fa', size });
}

const pathRegex = /to\s+([^\s)]+)/g;
const builtLinks = [];
for (const p of patterns) {
  const source = String(p.fileName);
  for (const it of (p.issues || [])) {
    const msg = String(it.message || '');
    let m;
    while ((m = pathRegex.exec(msg))) {
      const targetPath = m[1];
      const tgt = targetPath.replace(/[),]$/g, '');
      if (fileMap.has(tgt)) {
        builtLinks.push({ source, target: tgt });
      } else {
        const matched = Array.from(fileMap.keys()).find((k) => k.endsWith(tgt) || k.endsWith('/' + tgt));
        if (matched) builtLinks.push({ source, target: matched });
      }
    }
  }
}

console.log('Nodes:', fileMap.size);
console.log('Links:', builtLinks.length);
console.log('Sample nodes:', Array.from(fileMap.values()).slice(0,10));
console.log('Sample links:', builtLinks.slice(0,10));
