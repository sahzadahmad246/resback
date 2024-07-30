const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');

const usedTokens = new Set();

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return next(new ErrorHandler("No token provided", 403));
  }

  if (usedTokens.has(token)) {
    return next(new ErrorHandler("Token has already been used", 403));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new ErrorHandler("Failed to authenticate token", 500));
    }

    // Marking the token as used
    usedTokens.add(token);

    req.decoded = decoded;
    next();
  });
};

module.exports = verifyToken;
