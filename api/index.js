const app = require('./server/app');

// Definitive Vercel Serverless Entry Point
// Bridges the mirrored backend logic directly into the Lambda context.
module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[FATAL]:', err);
    res.status(500).json({
      error: 'CRITICAL_BOOT_FAILURE',
      message: err.message
    });
  }
};
