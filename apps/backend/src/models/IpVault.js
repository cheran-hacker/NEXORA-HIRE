import mongoose from 'mongoose';

const ipVaultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  description: { type: String },
  fileHash: { type: String, required: true }, // simulated blockchain hash
  txId: { type: String, required: true },
  status: { type: String, enum: ['Secured', 'Pending'], default: 'Secured' }
}, { timestamps: true });

export const IpVault = mongoose.models.IpVault || mongoose.model('IpVault', ipVaultSchema);
