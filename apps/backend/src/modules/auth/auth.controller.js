import mongoose from 'mongoose';
import UserSchema from '../../../../../packages/shared-schemas/user.schema.js';
import AppError from '../../core/errors/AppError.js';
import { generateTokens } from '../../utils/jwt.js';

const User = mongoose.models.User || mongoose.model('User', UserSchema);
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../core/config/env.js';

const googleClient = new OAuth2Client(env.google.clientId);

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // In a real app, hash password in pre-save hook
      role
    });

    const tokens = generateTokens(newUser);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.password !== password) {
      // In a real app, use bcrypt.compare
      return next(new AppError('Incorrect email or password', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const tokens = generateTokens(user);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return next(new AppError('Google token is required', 400));
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.google.clientId,
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: given_name || 'Google',
        lastName: family_name || given_name || 'User',
        email,
        googleId: sub,
        profilePicture: picture,
        role: 'Student', // Default role for new Google sign-ups
        isEmailVerified: true,
        status: 'Active'
      });
    } else if (!user.googleId) {
      user.googleId = sub;
      user.profilePicture = user.profilePicture || picture;
      await user.save({ validateBeforeSave: false });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const tokens = generateTokens(user);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatarUrl: user.profilePicture
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    next(new AppError('Failed to authenticate with Google', 401));
  }
};

export const activate = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      return next(new AppError('Token and password are required', 400));
    }

    const user = await User.findOne({ 
      activationToken: token,
      activationExpire: { $gt: Date.now() },
      status: 'Invited'
    });

    if (!user) {
      return next(new AppError('Invalid or expired activation token', 400));
    }

    user.password = password; // Should be hashed in pre-save hook in real system
    user.activationToken = undefined;
    user.activationExpire = undefined;
    user.status = 'Active';
    
    await user.save({ validateBeforeSave: false });
    
    const tokens = generateTokens(user);

    // Also update AlumniInvitation if it exists
    const { AlumniInvitation } = await import('../../models/AlumniInvitation.js');
    await AlumniInvitation.findOneAndUpdate({ email: user.email }, { status: 'ACTIVATED' });

    res.status(200).json({
      status: 'success',
      message: 'Account activated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};
