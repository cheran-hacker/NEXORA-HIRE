import mongoose from 'mongoose';
import { ROLES, STATUSES } from '../shared-constants/index.js';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: function() {
        // Not required if using Google Auth
        return !this.googleId;
      },
      minlength: 8
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT
    },
    profilePicture: {
      type: String,
      default: 'https://res.cloudinary.com/default/image/upload/v1/default_avatar.png'
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.ACTIVE
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'role'
  }
);

// Mongoose schema methods or indexes can be added here
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export default UserSchema;
