import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Hardware', 'Textbooks', 'Electronics', 'Misc'],
    default: 'Misc'
  },
  status: {
    type: String,
    enum: ['Available', 'Pending Handoff', 'Borrowed'],
    default: 'Available'
  },
  currentBorrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  image: String
}, { timestamps: true });

export const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);
