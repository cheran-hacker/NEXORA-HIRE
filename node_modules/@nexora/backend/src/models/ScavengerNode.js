import mongoose from 'mongoose';

const scavengerNodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true // e.g., 'lib-01'
  },
  locationHint: {
    type: String,
    required: true
  },
  riddle: {
    type: String,
    required: true
  },
  unlocksModule: {
    type: String,
    required: true // e.g., 'Library Map'
  },
  pointsAwarded: {
    type: Number,
    default: 50
  }
}, { timestamps: true });

export const ScavengerNode = mongoose.models.ScavengerNode || mongoose.model('ScavengerNode', scavengerNodeSchema);
