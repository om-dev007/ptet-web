const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const admin = require('../config/firebase');
const redis = require('../config/redis');
const { cookieOptions } = require('../config/cookieConfig');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/env');
const normalizeEmail = require("../utils/normalizeEmail");
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

exports.register = async (req, res, next) => {
  try {
    const { password, name } = req.body;
    const email = normalizeEmail(req.body.email)

    const trimmedPassword = password?.trim() || '';
    const trimmedName = name?.trim() || '';

    if (!trimmedEmail || !trimmedPassword || !trimmedName) {
      return res.status(400).json({
        error: 'Email, password, and name are required fields and cannot be empty.'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(200).json({
        message: 'If an account can be created, you will receive further instructions.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(trimmedPassword, salt);

    const verification_token = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      name: trimmedName,
      password_hash,
      provider: 'email',
      role: 'user',
      verification_token
    });

    await sendWelcomeEmail(user.email, user.name, user.verification_token);

    return res.status(200).json({
      message: 'If an account can be created, you will receive further instructions.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo_url: user.photo_url
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = normalizeEmail(decodedToken.email);
    const { name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'No email associated with this token' });
    }

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        email,
        name: name || 'Google User',
        photo_url: picture,
        provider: 'google',
        role: 'user'
      });
    } else if (user.provider !== 'google' && user.provider !== 'email') {
      // Provider-linking logic can be handled separately if needed
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      message: 'Google login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo_url: user.photo_url
      }
    });
  } catch (err) {
    if (err.code && err.code.startsWith('auth/')) {
      return res.status(401).json({ error: 'Invalid or expired Firebase token' });
    }
    next(err);
  }
};

exports.githubAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Please provide Firebase ID token' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = normalizeEmail(decodedToken.email);
    const { name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'No email associated with this token' });
    }

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        email,
        name: name || 'GitHub User',
        photo_url: picture,
        provider: 'github',
        role: 'user'
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      message: 'GitHub login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo_url: user.photo_url
      }
    });
  } catch (err) {
    if (err.code && err.code.startsWith('auth/')) {
      return res.status(401).json({ error: 'Invalid or expired Firebase token' });
    }
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const isBlocked = await redis.get(`bl_token:${refreshToken}`);
    if (isBlocked) {
      return res.status(403).json({ error: 'Refresh token has been revoked' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      accessToken
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        if (expiresIn > 0) {
          await redis.set(`bl_token:${refreshToken}`, 'blocked', 'EX', expiresIn);
        }
      } catch (err) {
        // Token may already be expired or invalid; continue clearing cookie
      }
    }

    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo_url: user.photo_url
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, photo_url } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (photo_url !== undefined) user.photo_url = photo_url;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo_url: user.photo_url
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await User.findOne({ where: { verification_token: token } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isActive = true;
    user.verification_token = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const user = await User.findOne({
      where: {
        passwordResetToken: token,
      }
    });

    if (!user || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    user.password_hash = password_hash;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};