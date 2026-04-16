const path = require('path');
const fs = require('fs');

// Environment Configuration
require('dotenv').config({ path: path.join(__dirname, '_core/.env') });

// SINGLE GATEWAY LOGIC
// All backend sub-modules (routes, controllers) are encapsulated in _core
// This satisfies Vercel Hobby Tier's 12-function limit.
const app = require('./_core/app');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[API GATEWAY FATAL]:', err);
    res.status(500).json({
      error: 'GATEWAY_ERROR',
      message: err.message
    });
  }
};
