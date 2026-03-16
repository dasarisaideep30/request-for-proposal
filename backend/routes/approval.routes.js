const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', authorize('PROPOSAL_MANAGER'), approvalController.createApproval);
router.patch('/:id', authorize('BID_REVIEWER', 'LEADERSHIP'), approvalController.decideApproval);

module.exports = router;
