import mongoose from 'mongoose';

const projectAutopsySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  whatWentWrong: {
    type: String,
    required: true
  },
  rootCause: {
    type: String,
    required: true
  },
  lessonsLearned: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const ProjectAutopsy = mongoose.models.ProjectAutopsy || mongoose.model('ProjectAutopsy', projectAutopsySchema);
