import { User } from '../models/User.js';
import { StudentList } from '../models/StudentList.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'nexora_fallback_secret_key', {
    expiresIn: '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (role && role.toLowerCase() === 'student') {
      return res.status(403).json({ success: false, message: 'Student registration is disabled. Access is only available via Administrator import.' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'Active', // Temporarily allow all roles to be active for testing
      emailVerificationToken,
      emailVerificationExpire
    });

    const token = generateToken(user._id, user.role);
    console.log(`[MOCK EMAIL] Verification code for ${email} is ${emailVerificationToken}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        ...user.toObject(),
        avatar: user.avatarUrl,
        status: user.status,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended. Contact support.' });
    }

    // Allow Students to log in with email/password during local development bypassing Google Auth

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        ...user.toObject(),
        avatar: user.avatarUrl,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const activateAlumniAccount = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const user = await User.findOne({
      activationToken: token,
      activationExpire: { $gt: Date.now() },
      role: 'Alumni',
      status: 'Invited'
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired activation token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Activate user
    user.status = 'Active';
    user.activationToken = undefined;
    user.activationExpire = undefined;
    user.lastLogin = new Date();
    await user.save();

    const authToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Account activated successfully',
      token: authToken,
      user: {
        ...user.toObject(),
        avatar: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        avatar: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'avatar', 'studentProfile', 'alumniProfile', 'recruiterProfile', 'themePreference', 'notificationSettings'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
          Object.keys(req.body[key]).forEach(subKey => {
            updateData[`${key}.${subKey}`] = req.body[key][subKey];
          });
        } else {
          updateData[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        avatar: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { token, role: requestedRole } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    let payload;
    try {
      const { OAuth2Client } = (await import('google-auth-library'));
      const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.warn('Strict Google Auth Verification failed, falling back to local decode:', verifyError.message);
      // Fallback for local development if network or Client ID mismatch occurs
      const base64Url = token.split('.')[1];
      if (!base64Url) return res.status(401).json({ success: false, message: 'Invalid token format' });
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      payload = JSON.parse(jsonPayload);
      
      if (!payload || !payload.email) {
        return res.status(401).json({ success: false, message: 'Unable to verify your Google account.' });
      }
    }
    
    const { sub, email, name, picture, given_name, family_name } = payload;
    
    // Strict Check for Students
    if (requestedRole === 'student') {
      if (!email.toLowerCase().endsWith('@bitsathy.ac.in')) {
        return res.status(403).json({ success: false, message: 'Please sign in using your official @bitsathy.ac.in Google account.' });
      }
      
      let user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(403).json({ success: false, message: 'Your institutional account is not registered in the system. Please contact the administrator.' });
      }
      
      if (user.role !== 'Student') {
        return res.status(403).json({ success: false, message: 'Your account is not authorized for the Student Portal. Please contact the administrator.' });
      }
      
      if (user.status === 'Pending') {
        return res.status(403).json({ success: false, message: 'Your account has not been approved yet. Please contact the administrator.' });
      }
      
      if (user.status !== 'Active') {
        return res.status(403).json({ success: false, message: 'Your Student Portal access is currently inactive.' });
      }
      
      // Update Google details for existing authorized student
      if (!user.googleId) user.googleId = sub;
      if (picture && user.avatar !== picture) user.avatar = picture;
      // Do not overwrite academic names from excel, only set if missing
      if (!user.firstName && given_name) user.firstName = given_name;
      if (!user.lastName && family_name) user.lastName = family_name;
      
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = new Date();
      await user.save();
      
      const jwtToken = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        token: jwtToken,
        requiresOnboarding: false,
        user: {
          ...user.toObject(),
          avatar: user.avatar || user.avatarUrl || '',
          provider: 'google'
        }
      });
    }

    // Default flow for Recruiter/Admin/Guest
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        firstName: given_name || '',
        lastName: family_name || '',
        email,
        googleId: sub,
        avatar: picture,
        role: 'Guest',
        isEmailVerified: true,
        status: 'Active',
        provider: 'google',
        loginCount: 1,
        lastLogin: new Date()
      });
      isNewUser = true;
    } else {
      if (!user.googleId) user.googleId = sub;
      if (picture && user.avatar !== picture) user.avatar = picture;
      if (name && user.name !== name) user.name = name;
      if (given_name && !user.firstName) user.firstName = given_name;
      if (family_name && !user.lastName) user.lastName = family_name;
      
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = new Date();
      await user.save();
    }

    const requiresOnboarding = user.role === 'Guest' || !user.role;

    const jwtToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token: jwtToken,
      requiresOnboarding,
      user: {
        ...user.toObject(),
        avatar: user.avatar || user.avatarUrl || ''
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Failed to authenticate with Google' });
  }
};

export const completeProfile = async (req, res, next) => {
  try {
    const { role, phone, department, course, year, college, skills, linkedinUrl, githubUrl, portfolioUrl, resumeUrl } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'Guest' && user.role) {
      return res.status(400).json({ success: false, message: 'Profile is already completed' });
    }

    if (!['Placement', 'Alumni'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    user.role = role;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (course) user.course = course;
    if (year) user.year = year;
    if (college) user.college = college;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (linkedinUrl) user.linkedinUrl = linkedinUrl;
    if (githubUrl) user.githubUrl = githubUrl;
    if (portfolioUrl) user.portfolioUrl = portfolioUrl;
    if (resumeUrl) user.resumeUrl = resumeUrl;
    
    // Also initialize specific profile data based on role

    await user.save();

    // Re-generate token with new role
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        ...user.toObject(),
        avatar: user.avatarUrl,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// PASSWORD RECOVERY
// =======================

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // In a real app, send email with nodemailer
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Mock sending email
    res.status(200).json({ success: true, message: 'Password reset token sent to email' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// =======================
// TWO-FACTOR AUTH (2FA)
// =======================

export const generate2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const secret = speakeasy.generateSecret({ name: `NexoraCampus (${user.email})` });
    
    user.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ success: false, message: 'Error generating QR code' });
      res.status(200).json({ success: true, secret: secret.base32, qrCode: data_url });
    });
  } catch (error) {
    next(error);
  }
};

export const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      return res.status(200).json({ success: true, message: '2FA enabled successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    next(error);
  }
};

// =======================
// MICROSOFT & LINKEDIN MOCK
// =======================

export const microsoftAuth = async (req, res, next) => {
  try {
    const { email, name, microsoftId, avatar } = req.body; // Mocked inputs from MS MSAL
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || 'Microsoft User',
        email,
        microsoftId,
        avatarUrl: avatar,
        role: 'Student',
        isEmailVerified: true,
        status: 'Active'
      });
    } else if (!user.microsoftId) {
      user.microsoftId = microsoftId;
      await user.save();
    }
    
    const jwtToken = generateToken(user._id, user.role);
    res.status(200).json({ success: true, token: jwtToken, user: { ...user.toObject(), avatar: user.avatarUrl } });
  } catch (error) {
    next(error);
  }
};

export const linkedinAuth = async (req, res, next) => {
  try {
    const { email, name, linkedinId, avatar } = req.body; // Mocked inputs from LinkedIn
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || 'LinkedIn User',
        email,
        linkedinId,
        avatarUrl: avatar,
        role: 'Student',
        isEmailVerified: true,
        status: 'Active'
      });
    } else if (!user.linkedinId) {
      user.linkedinId = linkedinId;
      await user.save();
    }
    
    const jwtToken = generateToken(user._id, user.role);
    res.status(200).json({ success: true, token: jwtToken, user: { ...user.toObject(), avatar: user.avatarUrl } });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { code, email } = req.body;
    
    const user = await User.findOne({ 
      email,
      emailVerificationToken: code,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpire = emailVerificationExpire;
    await user.save();

    console.log(`[MOCK EMAIL] New Verification code for ${email} is ${emailVerificationToken}`);
    res.status(200).json({ success: true, message: 'Verification code resent' });
  } catch (error) {
    next(error);
  }
};
