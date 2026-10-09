import mongoose from 'mongoose';

const portfolioRuleSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ruleName: {
    type: String,
    required: true
  },
  urlParameter: {
    type: String,
    required: true // e.g., 'company=google'
  },
  highlightedSkills: [{
    type: String
  }],
  hiddenSections: [{
    type: String // e.g., 'Education', 'Projects'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const PortfolioRule = mongoose.models.PortfolioRule || mongoose.model('PortfolioRule', portfolioRuleSchema);
