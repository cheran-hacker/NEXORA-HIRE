import mongoose from 'mongoose';

const textbookExchangeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  haveBook: {
    type: String,
    required: true // e.g., "Bio 101"
  },
  needBook: {
    type: String,
    required: true // e.g., "Calc 201"
  },
  status: {
    type: String,
    enum: ['Looking', 'Trade Found', 'Completed'],
    default: 'Looking'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escrowStatus: {
    type: String,
    enum: ['None', 'Pending Dropoff', 'In Escrow', 'Completed'],
    default: 'None'
  },
  inventoryStatus: {
    type: String, // E.g. 'Campus Library Locker A3'
  }
}, { timestamps: true });

export const TextbookExchange = mongoose.models.TextbookExchange || mongoose.model('TextbookExchange', textbookExchangeSchema);
