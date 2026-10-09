import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
  // Who performed the swipe
  swiperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swiperRole: {
    type: String,
    enum: ['Student', 'Placement'],
    required: true
  },
  
  // Who/what was swiped on
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    // Could be a Job ID (if student swiped) or a User ID (if recruiter swiped)
    required: true
  },
  targetModel: {
    type: String,
    enum: ['Job', 'User'],
    required: true
  },

  // The action taken
  action: {
    type: String,
    enum: ['right', 'left'],
    required: true
  },

  // If a mutual match occurred
  isMatch: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure a user can only swipe on a specific target once
swipeSchema.index({ swiperId: 1, targetId: 1 }, { unique: true });

export const Swipe = mongoose.models.Swipe || mongoose.model('Swipe', swipeSchema);
