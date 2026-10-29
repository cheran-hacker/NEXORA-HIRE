import AppError from '../errors/AppError.js';
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../../../../packages/shared-constants/index.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (!permissions.includes(permission)) {
      return next(new AppError('You do not have the required permission for this action', 403));
    }
    next();
  };
};

export const requireMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    const userRoleValue = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredRoleValue = ROLE_HIERARCHY[minimumRole] || 0;

    if (userRoleValue < requiredRoleValue) {
      return next(new AppError('You do not have sufficient privileges', 403));
    }
    next();
  };
};
