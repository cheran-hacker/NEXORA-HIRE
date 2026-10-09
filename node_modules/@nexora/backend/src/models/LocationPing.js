import mongoose from 'mongoose';

const locationPingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Optional: can be anonymous in real systems, but we track for MVP simulation
  },
  zone: {
    type: String,
    enum: ['Library', 'Engineering', 'Business', 'Cafeteria', 'Quad', 'Sports Complex', 'Admin'],
    required: true
  },
  activityType: {
    type: String,
    enum: ['Studying', 'Networking', 'Event', 'Dining', 'Relaxing'],
    default: 'Studying'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    expires: 3600 // Auto-delete document after 1 hour to keep heatmap "real-time" (TTL index)
  }
}, { timestamps: true });

// Add geospatial index for future map scaling
locationPingSchema.index({ location: '2dsphere' });

export const LocationPing = mongoose.models.LocationPing || mongoose.model('LocationPing', locationPingSchema);
