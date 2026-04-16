/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.patch('/profile', authenticate, authController.updateProfile);
router.get('/debug', authenticate, (req, res) => {
  res.json({
    status: 'authenticated',
    user: req.user,
    token_verified: true,
    server_time: new Date().toISOString()
  });
});

module.exports = router;
