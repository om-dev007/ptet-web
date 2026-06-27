const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/:id/profile', authenticate, userController.getProfile);
router.patch('/:id/profile', authenticate, userController.updateProfile);
router.get('/:id/dashboard', authenticate, userController.getDashboardData);
router.get('/:id/activity', authenticate, userController.getUserActivity);

module.exports = router;
