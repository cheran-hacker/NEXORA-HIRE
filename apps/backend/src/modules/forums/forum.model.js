import mongoose from 'mongoose';
import { STATUSES } from '../../../../../packages/shared-constants/index.js';

const ForumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['General', 'Technical', 'Career', 'Interview Prep', 'Alumni', 'Announcements'],
      required: true
    },
    tags: [String],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    views: {
      type: Number,
      default: 0
    },
    isResolved: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.ACTIVE
    }
  },
  { timestamps: true }
);

export default mongoose.models.ForumPost || mongoose.model('ForumPost', ForumPostSchema);
