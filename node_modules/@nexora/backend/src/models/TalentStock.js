import mongoose from 'mongoose';

const talentStockSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentPrice: {
    type: Number,
    default: 10.00 // Starts at 10 Nexora Coins
  },
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now },
    reason: String // e.g., "Won Hackathon", "Landed Internship"
  }],
  // Who has invested in this student
  investors: [{
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharesOwned: {
      type: Number,
      default: 0
    },
    averageBuyPrice: Number
  }]
}, { timestamps: true });

export const TalentStock = mongoose.models.TalentStock || mongoose.model('TalentStock', talentStockSchema);
