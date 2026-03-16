const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const multer = require('multer');
const upload = multer({ 
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  storage: multer.memoryStorage() 
});

// POST analyze RFP Document
// Protected to ensure only authenticated users can run expensive AI models
router.post('/analyze-rfp', 
  authenticate,
  authorize('SOLUTION_ARCHITECT', 'PROPOSAL_MANAGER'),
  upload.single('file'),
  aiController.analyzeRFP
);

module.exports = router;
