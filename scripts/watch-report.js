import fs from 'fs';
import { resolve } from 'path';

// Accept optional source report path as first argument (absolute or relative)
const argPath = process.argv[2];
const srcReport = argPath
  ? resolve(process.cwd(), argPath)
  : resolve(process.cwd(), '..', '..', 'aiready-improvement-report.json');
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
