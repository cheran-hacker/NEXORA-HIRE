import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Social', 'Academic'], required: true },
  president: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logo: { type: String },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Member', 'Core', 'Admin'], default: 'Member' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    joinedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  tags: [{ type: String }]
}, { timestamps: true });

export const Club = mongoose.models.Club || mongoose.model('Club', clubSchema);
