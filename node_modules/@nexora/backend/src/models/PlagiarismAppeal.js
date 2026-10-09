import mongoose from 'mongoose';

const plagiarismAppealSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentName: {
    type: String,
    required: true
  },
  flaggedCodeUrl: {
    type: String
  },
  defenseStatement: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Deliberating', 'Guilty', 'Innocent'],
    default: 'Deliberating'
  },
  juryVotes: [{
    juror: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['Guilty', 'Innocent']
    },
    reasoning: String
  }]
}, { timestamps: true });

export const PlagiarismAppeal = mongoose.models.PlagiarismAppeal || mongoose.model('PlagiarismAppeal', plagiarismAppealSchema);
