const fs = require('fs');
const path = require('path');

// FORCE REQUIRED BUNDLING
require('dotenv');
require('express');
const { PrismaClient } = require('@prisma/client');

/**
 * Unified Vercel API Hub
 * Dynamically resolves the backend from either the workspace or the build-time copy.
 */
let app;

// Prefer local build-time copy (more reliable on Vercel)
const localBackend = path.join(__dirname, 'backend_src/app');
const workspaceBackend = path.join(__dirname, '../backend/app');

try {
  if (fs.existsSync(localBackend + '.js')) {
    console.log('[API] Loading from local backend_src...');
    app = require(localBackend);
  } else {
    console.log('[API] Loading from workspace backend...');
    app = require(workspaceBackend);
  }
} catch (err) {
  console.error('[API CRITICAL LOAD FAILURE]:', err);
}

module.exports = (req, res) => {
  if (!app) {
     return res.status(500).json({ error: 'BACKEND_NOT_LOADED', message: 'Could not find app logic in bundle' });
  }
  return app(req, res);
};
