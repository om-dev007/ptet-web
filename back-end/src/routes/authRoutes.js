const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const { loginLimiter, signupLimiter } = require("../middleware/rateLimit");
const {validateRegister, validateLogin, validateSocialAuth, validateUpdateMe} = require("../middleware//authMiddleware");
router.post('/register', validateRegister ,authController.register);
router.post('/login', validateLogin ,authController.login);
router.post('/google', validateSocialAuth ,authController.googleAuth);
router.post('/github', validateSocialAuth ,authController.githubAuth);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, validateUpdateMe ,authController.updateMe);


router.post('/register', signupLimiter, authController.register);

router.post('/login', loginLimiter, authController.login);

module.exports = router;