const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getActivities);

module.exports = router;
