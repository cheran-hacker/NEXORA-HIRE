import mongoose from 'mongoose';

const hardwarePoolSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true }, // GPU, VR, Drone, etc.
  collateralKarma: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Borrowed'], default: 'Available' },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const HardwarePool = mongoose.models.HardwarePool || mongoose.model('HardwarePool', hardwarePoolSchema);
