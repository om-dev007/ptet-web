const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const { loginLimiter, signupLimiter } = require("../middleware/rateLimit");
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/github', authController.githubAuth);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateMe);


router.post('/register', signupLimiter, authController.register);

router.post('/login', loginLimiter, authController.login);

module.exports = router;