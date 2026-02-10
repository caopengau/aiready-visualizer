const fs = require('fs');
const path = require('path');

const srcReport = path.resolve(process.cwd(), '..', '..', 'aiready-improvement-report.json');
const dst = path.resolve(process.cwd(), 'web', 'report-data.json');

function copy() {
  try {
    if (fs.existsSync(srcReport)) {
      fs.copyFileSync(srcReport, dst);
      console.log('Copied report to', dst);
    }
  } catch (e) { console.error(e); }
}

copy();
fs.watchFile(srcReport, { interval: 1000 }, copy);
console.log('Watching', srcReport);
