import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  // Kept internally to prevent spam, but never exposed to frontend
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true, // e.g., 'javascript', 'python'
  },
  code: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  roasts: [{
    // The reviewer ID is tracked to prevent double-voting/abuse, but kept secret
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    upvotes: {
      type: Number,
      default: 0
    },
    upvotedBy: [mongoose.Schema.Types.ObjectId], // Array of User IDs who upvoted this roast
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalViews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Snippet = mongoose.models.Snippet || mongoose.model('Snippet', snippetSchema);
