import mongoose from 'mongoose';

const spatialNodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Academic', 'Library', 'Cafeteria', 'Admin', 'Recreation']
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  arContent: {
    textOverlay: String,
    color: {
      type: String,
      default: '#1677ff'
    }
  }
}, { timestamps: true });

export const SpatialNode = mongoose.models.SpatialNode || mongoose.model('SpatialNode', spatialNodeSchema);
