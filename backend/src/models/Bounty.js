import mongoose from 'mongoose';

const bountySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  taskInstructions: {
    type: String,
    default: ''
  },
  rewardAmount: {
    type: Number,
    required: true,
    min: 0
  },
  rewardCurrency: {
    type: String,
    default: 'USD'
  },
  tags: [String], // e.g., ['Node.js', 'Redis', 'Express']
  requiredSkills: [String], // Synced with tags
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  category: {
    type: String,
    default: 'Software Development'
  },
  eligibilityCriteria: {
    type: String,
    default: 'Open to all enrolled students with relevant skills'
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Draft', 'Open', 'Assigned', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Open'
  },
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pitch: {
      type: String,
      default: ''
    },
    relevantSkills: [String],
    portfolioUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    solutionUrl: String, // e.g., GitHub PR link, Figma link, deployed link
    message: String,
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Revision Requested'],
      default: 'Pending'
    },
    feedback: String,
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    }
  }],
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Pre-save hook to synchronize tags and requiredSkills
bountySchema.pre('save', function (next) {
  if (this.tags && this.tags.length > 0 && (!this.requiredSkills || this.requiredSkills.length === 0)) {
    this.requiredSkills = this.tags;
  } else if (this.requiredSkills && this.requiredSkills.length > 0 && (!this.tags || this.tags.length === 0)) {
    this.tags = this.requiredSkills;
  }
  next();
});

export const Bounty = mongoose.models.Bounty || mongoose.model('Bounty', bountySchema);
