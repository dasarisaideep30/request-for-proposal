const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All admin routes are protected to Master Admin only
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.post('/assign-coadmin', adminController.assignCoAdmin);

module.exports = router;
