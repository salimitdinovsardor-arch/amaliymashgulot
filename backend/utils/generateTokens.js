const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = '3m'; // 3 minutes as requested
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days as requested

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_ACCESS_SECRET || 'eduhub_access_fallback_secret_key_32chars!',
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET || 'eduhub_refresh_fallback_secret_key_32chars!',
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};

