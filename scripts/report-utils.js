const fs = require('fs');
const path = require('path');

/**
 * Find the latest aiready report
 * @param {string} basePath - The base path to search for .aiready directory
 * @returns {string|null} - The path to the latest report or null if not found
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

module.exports = { findLatestReport };
