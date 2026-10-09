import mongoose from 'mongoose';

const geoEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  radiusMeters: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  activeParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  endTime: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export const GeoEvent = mongoose.models.GeoEvent || mongoose.model('GeoEvent', geoEventSchema);
