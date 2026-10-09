import mongoose from 'mongoose';

const clubTreasurySchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: true,
    unique: true
  },
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyAdvisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const ClubTreasury = mongoose.models.ClubTreasury || mongoose.model('ClubTreasury', clubTreasurySchema);
