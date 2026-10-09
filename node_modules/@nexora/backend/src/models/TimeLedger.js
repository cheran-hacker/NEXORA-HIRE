import mongoose from 'mongoose';

const timeLedgerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 2 // Start with 2 TimeCoins
  },
  skillsOffered: [{
    type: String
  }],
  transactions: [{
    amount: Number, // +1 for teaching, -1 for learning
    type: { type: String, enum: ['Earned', 'Spent'] },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    skill: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const TimeLedger = mongoose.models.TimeLedger || mongoose.model('TimeLedger', timeLedgerSchema);
