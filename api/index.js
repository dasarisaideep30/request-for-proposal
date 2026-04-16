console.log('[STEP 1] Entry point loaded');

// We use dynamic requires to trace the exact crash point
module.exports = async (req, res) => {
  try {
    console.log('[STEP 2] Request received:', req.url);
    
    console.log('[STEP 3] Loading Express...');
    const express = require('express');
    
    console.log('[STEP 4] Loading Backend App...');
    // If it crashes here, we know it's a module issue
    const app = require('../backend/app');
    
    console.log('[STEP 5] Executing App...');
    return app(req, res);
  } catch (err) {
    console.error('[CRITICAL FAILURE]:', err);
    res.status(500).json({
      error: 'API_CRASH',
      message: err.message,
      stack: err.stack
    });
  }
};
