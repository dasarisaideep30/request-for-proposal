const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/unread', getUnreadCount);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

module.exports = router;
