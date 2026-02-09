// Tiny test runner that attempts to load ts-node if available.
try {
  require('ts-node/register');
} catch (e) {
  console.error('\nERROR: ts-node not installed.');
  console.error('Install with: pnpm add -D ts-node typescript @types/node');
  process.exit(2);
}

const path = require('path');
require(path.resolve(__dirname, 'buildFromReport.test.ts'));
