import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  creator: {
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
  goalAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Hardware', 'Software', 'Event', 'Research', 'Other'],
    default: 'Software'
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Funded', 'Failed'],
    default: 'Active'
  },
  donations: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

campaignSchema.pre('save', function (next) {
  if (this.donations && this.donations.length > 0) {
    this.currentAmount = this.donations.reduce((acc, curr) => acc + curr.amount, 0);
  } else {
    this.currentAmount = 0;
  }
  
  if (this.currentAmount >= this.goalAmount && this.status === 'Active') {
    this.status = 'Funded';
  }
  next();
});

export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
