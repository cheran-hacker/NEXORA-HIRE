import mongoose from 'mongoose';

const hiringDriveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Completed'],
    default: 'Upcoming'
  },
  locations: [{
    type: String
  }],
  applied: {
    type: Number,
    default: 0
  },
  assessed: {
    type: Number,
    default: 0
  },
  interviewed: {
    type: Number,
    default: 0
  },
  offered: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const HiringDrive = mongoose.models.HiringDrive || mongoose.model('HiringDrive', hiringDriveSchema);
