const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/executive', dashboardController.getExecutiveDashboard);
router.get('/my-rfps', dashboardController.getMyDashboard);

module.exports = router;
