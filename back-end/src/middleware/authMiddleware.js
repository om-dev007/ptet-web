const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_access_secret');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'The user belonging to this token does no longer exist.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please refresh your token.' });
    }
    return res.status(401).json({ error: 'Not authorized to access this route. Invalid token.' });
  }
};

/**
 * @param  {...string} roles 
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};
