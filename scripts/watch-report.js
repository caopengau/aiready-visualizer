const fs = require('fs');
const path = require('path');
const { findLatestReport } = require('./report-utils');

// Accept optional source report path as first argument (absolute or relative)
const argPath = process.argv[2];
const basePath = path.resolve(process.cwd(), '..', '..');
const srcReport = argPath
  ? path.resolve(process.cwd(), argPath)
  : findLatestReport(basePath);

if (!srcReport) {
  console.error('❌ No aiready report found');
  console.error('Run: aiready scan --output json');
  process.exit(1);
}

const dst = path.resolve(process.cwd(), 'web', 'report-data.json');

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
