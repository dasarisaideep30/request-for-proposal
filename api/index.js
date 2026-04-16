const app = require('../backend/app');

// Vercel Serverless Entry Point
module.exports = (req, res) => {
  // Ensure we are in the correct directory for local requires
  try {
    return app(req, res);
  } catch (err) {
    console.error('[FATAL RUNTIME ERROR]:', err);
    res.status(500).json({
      error: 'API Execution Failed',
      message: err.message,
      invocation_id: req.headers['x-vercel-id'] || 'unknown'
    });
  }
};
