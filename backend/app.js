require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('[DEBUG] Server starting up...');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Polyfill for pdf-parse in serverless environments
if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {};
}

if (!process.env.JWT_SECRET) {
  console.error('[CRITICAL]: JWT_SECRET is not defined in environment variables!');
}

// Route imports
const authRoutes = require('./routes/auth.routes');
const rfpRoutes = require('./routes/rfp.routes');
const taskRoutes = require('./routes/task.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const approvalRoutes = require('./routes/approval.routes');
const activityRoutes = require('./routes/activity.routes');
const notificationRoutes = require('./routes/notification.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

app.use(compression());

// CORS - Allow frontend access
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and same-origin requests
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Basic DDoS protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'RFP Command Center API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-env', (req, res) => {
  res.json({
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV
  });
});

// ============================================
// API ROUTES
// ============================================

// ============================================
// API ROUTES
// ============================================

// Standard prefix routes
console.log('[DEBUG] Registering /api/auth routes');
app.use('/api/auth', authRoutes);
app.use('/api/rfps', rfpRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Fallback routes (in case /api is stripped by proxy/redirect)
app.use('/auth', authRoutes);
app.use('/rfps', rfpRoutes);
app.use('/tasks', taskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/approvals', approvalRoutes);
app.use('/activities', activityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai', aiRoutes);

// SERVE FRONTEND (Combined Deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    }
  });
}

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[CRITICAL ERROR]:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: err.stack,
    details: 'Exposed for debugging'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log('==============================================');
    console.log('🚀 RFP Command Center API');
    console.log('==============================================');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'} [LOCAL]`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log('==============================================');
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error('==============================================');
      console.error(`❌ PORT ${PORT} IS ALREADY IN USE.`);
      console.error('==============================================');
      process.exit(1);
    }
  });
}

module.exports = app;
