import mongoose from 'mongoose';

const stockProfileSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentPrice: {
    type: Number,
    default: 100 // Base IPO price
  },
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  totalSharesOutstanding: {
    type: Number,
    default: 1000
  }
}, { timestamps: true });

export const StockProfile = mongoose.models.StockProfile || mongoose.model('StockProfile', stockProfileSchema);

const investmentSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockProfile',
    required: true
  },
  sharesOwned: {
    type: Number,
    required: true
  },
  averageBuyPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);
