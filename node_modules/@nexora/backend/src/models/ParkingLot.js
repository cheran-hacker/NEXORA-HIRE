import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  totalSpots: {
    type: Number,
    required: true
  },
  currentStatus: {
    type: String,
    enum: ['Empty', 'Filling Fast', 'Full'],
    default: 'Empty'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const ParkingLot = mongoose.models.ParkingLot || mongoose.model('ParkingLot', parkingLotSchema);
