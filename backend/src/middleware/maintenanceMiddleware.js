import { SystemSetting } from '../models/SystemSetting.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const checkMaintenance = async (req, res, next) => {
  try {
    // Check if maintenance mode is enabled in the database
    const maintenanceSetting = await SystemSetting.findOne({ key: 'isMaintenanceMode' });
    const isMaintenanceMode = maintenanceSetting ? maintenanceSetting.value : false;

    if (isMaintenanceMode) {
      // Allow settings routes and auth routes (to allow admin to login and disable it)
      if (req.path.startsWith('/api/v1/settings') || req.path.startsWith('/api/v1/auth/login')) {
        return next();
      }

      // Check if user is authenticated and is an Admin
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          const user = await User.findById(decoded.id);
          if (user && user.role === 'Admin') {
            return next(); // Admins bypass maintenance mode
          }
        } catch (err) {
          // Token invalid, ignore and block
        }
      }

      return res.status(503).json({
        success: false,
        message: 'Platform is currently undergoing maintenance. Please try again later.'
      });
    }

    next();
  } catch (error) {
    next(); // On DB error, just allow traffic to pass to not break app entirely
  }
};
