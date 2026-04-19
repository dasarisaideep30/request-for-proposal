const path = require('path');
const fs = require('fs');

// Environment Configuration
require('dotenv').config({ path: path.join(__dirname, '_core/.env') });

module.exports = (req, res) => {
  try {
    const app = require('./_core/app');
    return app(req, res);
  } catch (err) {
    console.error('[API GATEWAY FATAL]:', err);
    res.status(500).json({
      error: 'GATEWAY_ERROR',
      message: err.message,
      stack: err.stack
    });
  }
};
