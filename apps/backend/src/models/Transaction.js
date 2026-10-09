import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['CROWDFUNDING', 'ASSESSMENT', 'MENTORSHIP'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    description: 'ID of the project, assessment, or mentorship being paid for'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
