import jwt from 'jsonwebtoken';
import { env } from '../core/config/env.js';

export const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };

  const accessToken = jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn
  });

  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};
