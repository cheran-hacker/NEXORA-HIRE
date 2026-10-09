import AppError from '../errors/AppError.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new AppError(`Validation error: ${errorMessage}`, 400));
    }
    
    next();
  };
};
