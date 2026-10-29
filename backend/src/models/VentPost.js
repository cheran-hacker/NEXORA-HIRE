import mongoose from 'mongoose';

const ventPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  // No author field to ensure 100% anonymity
  color: {
    type: String, // e.g. '#ff9999', used for UI bubble color
    default: '#e2e8f0'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // Auto-destruct in 24h
  }
}, { timestamps: true });

// Auto-delete documents when expiresAt is reached
ventPostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VentPost = mongoose.models.VentPost || mongoose.model('VentPost', ventPostSchema);
