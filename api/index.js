// FORCE EXPLICIT BUNDLING OF ALL BACKEND DEPENDENCIES
require('dotenv');
require('express');
require('cors');
require('jsonwebtoken');
require('bcryptjs');
require('express-rate-limit');
require('compression');
require('express-validator');
require('multer');
require('pdf-parse');
require('mammoth');
require('csv-string');
require('@google/genai');
require('groq-sdk');
require('openai');
require('serverless-http');
const { PrismaClient } = require('@prisma/client');

console.log('[STEP 1] Bundled dependencies verified');

// Now load the actual app
const app = require('../backend/app');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[API CRITICAL]:', err);
    res.status(500).json({
      error: 'INTERAL_SERVER_ERROR',
      message: err.message
    });
  }
};
