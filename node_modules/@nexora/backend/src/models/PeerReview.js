import mongoose from 'mongoose';

const peerReviewSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedProject: { type: String, required: true },
  endorsementText: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

export const PeerReview = mongoose.models.PeerReview || mongoose.model('PeerReview', peerReviewSchema);
