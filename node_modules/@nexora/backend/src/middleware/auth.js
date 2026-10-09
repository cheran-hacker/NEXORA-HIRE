import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexora_fallback_secret_key');
    
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      console.error('User not found for ID:', decoded.id);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (req.user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Make case-insensitive comparison
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const userRole = req.user.role.toLowerCase();
    
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};
