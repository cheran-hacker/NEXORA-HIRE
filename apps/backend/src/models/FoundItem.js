import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
  finder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  locationFound: {
    type: String,
    required: true
  },
  aiTags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Unclaimed', 'Claimed'],
    default: 'Unclaimed'
  }
}, { timestamps: true });

export const FoundItem = mongoose.models.FoundItem || mongoose.model('FoundItem', foundItemSchema);
