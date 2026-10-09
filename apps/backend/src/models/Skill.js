import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  normalizedName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Soft', 'Language', 'Domain', 'Other'],
    default: 'Technical'
  }
}, { timestamps: true });

export const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
