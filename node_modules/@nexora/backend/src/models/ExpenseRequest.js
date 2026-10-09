import mongoose from 'mongoose';

const expenseRequestSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClubTreasury',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // usually the president or treasurer
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  receiptUrl: {
    type: String // Optional receipt upload
  }
}, { timestamps: true });

export const ExpenseRequest = mongoose.models.ExpenseRequest || mongoose.model('ExpenseRequest', expenseRequestSchema);
