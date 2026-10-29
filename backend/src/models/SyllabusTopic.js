import mongoose from 'mongoose';

const syllabusTopicSchema = new mongoose.Schema({
  topicName: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true // e.g., 'Computer Science', 'Business'
  },
  currentStatus: {
    type: String,
    enum: ['Core', 'Elective', 'Deprecated', 'Proposed'],
    default: 'Proposed'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  // We track recruiter votes to prevent double voting
  voters: [{
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['up', 'down']
    }
  }],
  // Analytics
  industryDemandScore: {
    type: Number,
    default: 50 // 0-100 score based on votes
  }
}, { timestamps: true });

export const SyllabusTopic = mongoose.models.SyllabusTopic || mongoose.model('SyllabusTopic', syllabusTopicSchema);
