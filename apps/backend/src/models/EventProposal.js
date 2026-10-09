import mongoose from 'mongoose';

const eventProposalSchema = new mongoose.Schema({
  proposer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Voting', 'Funded', 'Rejected'],
    default: 'Voting'
  },
  votes: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    stakeAmount: {
      type: Number,
      default: 1
    }
  }],
  totalStake: {
    type: Number,
    default: 0
  },
  ticketsClaimed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

export const EventProposal = mongoose.models.EventProposal || mongoose.model('EventProposal', eventProposalSchema);
