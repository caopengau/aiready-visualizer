const fs = require('fs');
const path = require('path');

const REPORT_NAME_PATTERN = /^aiready-(report|scan)-.*\.json$/;

/**
 * Find the latest aiready report
 * @param {string} basePath - The base path to search for .aiready directory
 * @returns {string|null} - The path to the latest report or null if not found
 */
function findLatestReport(basePath) {
  const aireadyDir = path.resolve(basePath, '.aiready');
  if (!fs.existsSync(aireadyDir)) return null;

  let latestPath = null;
  let latestMtime = -1;

  const entries = fs.readdirSync(aireadyDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !REPORT_NAME_PATTERN.test(entry.name)) {
      continue;
    }

    const candidatePath = path.resolve(aireadyDir, entry.name);
    const mtime = fs.statSync(candidatePath).mtimeMs;
    if (mtime > latestMtime) {
      latestMtime = mtime;
      latestPath = candidatePath;
    }
  }

  return latestPath;
}

module.exports = { findLatestReport };
