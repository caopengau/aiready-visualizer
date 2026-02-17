import fs from 'fs';
import { resolve } from 'path';

/**
 * Find the latest aiready report
 */
function findLatestReport(basePath) {
  const aireadyDir = resolve(basePath, '.aiready');
  if (!fs.existsSync(aireadyDir)) return null;
  
  const files = fs.readdirSync(aireadyDir)
    .filter(f => f.startsWith('aiready-report-') && f.endsWith('.json'));
  
  if (files.length === 0) return null;
  
  const sorted = files
    .map(f => ({
      name: f,
      path: resolve(aireadyDir, f),
      mtime: fs.statSync(resolve(aireadyDir, f)).mtime
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  
  return sorted[0].path;
}

// Accept optional source report path as first argument (absolute or relative)
const argPath = process.argv[2];
const basePath = resolve(process.cwd(), '..', '..');
const srcReport = argPath
  ? resolve(process.cwd(), argPath)
  : findLatestReport(basePath);

if (!srcReport) {
  console.error('❌ No aiready report found');
  console.error('Run: aiready scan --output json');
  process.exit(1);
}

const dst = resolve(process.cwd(), 'web', 'report-data.json');

function copyReport() {
  try {
    if (fs.existsSync(srcReport)) {
      fs.copyFileSync(srcReport, dst);
      console.log('Copied report to', dst);
    }
  } catch (e) {
    console.error(e);
  }
}

copyReport();
fs.watchFile(srcReport, { interval: 1000 }, copyReport);
console.log('Watching', srcReport);
