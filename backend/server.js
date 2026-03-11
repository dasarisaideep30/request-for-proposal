/**
 * RFP Command Center - Main Server
 * Enterprise-grade Node.js/Express Backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Route imports
const authRoutes = require('./routes/auth.routes');
const rfpRoutes = require('./routes/rfp.routes');
const taskRoutes = require('./routes/task.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const approvalRoutes = require('./routes/approval.routes');
const activityRoutes = require('./routes/activity.routes');
const notificationRoutes = require('./routes/notification.routes');
const { startCron } = require('./utils/cron');

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow frontend access
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/rfps', rfpRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);

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
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('==============================================');
  console.log('🚀 RFP Command Center API');
  console.log('==============================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('==============================================');

  // Start automated intelligence engines
  startCron();
});

module.exports = app;
