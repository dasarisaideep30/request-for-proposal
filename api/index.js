const app = require('../backend/app');

/**
 * Enterprise RFP Command Center - Unified API Entry Point
 * Correctly Resolves Backend relative to Vercel's root /api functions.
 */
module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[API CRITICAL]:', err);
    res.status(500).json({
      error: 'INTERAL_SERVER_ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
