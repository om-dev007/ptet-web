const rateLimit = require("express-rate-limit");

// LOGIN LIMITER
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: {
    status: 429,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// SIGNUP LIMITER
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests
  message: {
    status: 429,
    message: "Too many signup attempts. Try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, signupLimiter };