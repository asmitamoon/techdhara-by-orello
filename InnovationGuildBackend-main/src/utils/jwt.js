const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiry || '15m'
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiry || '7d'
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtAccessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

const createTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });

  return { accessToken, refreshToken };
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const saveRefreshToken = async (userId, token, req) => {
  const refreshTokenDoc = new RefreshToken({
    userId,
    token: hashToken(token),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    }
  });

  await refreshTokenDoc.save();
  return refreshTokenDoc;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createTokens,
  saveRefreshToken,
  hashToken
};