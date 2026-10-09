import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String, // e.g. "Library 3rd Floor"
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'FalseAlarm'],
    default: 'Active'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const EmergencyAlert = mongoose.models.EmergencyAlert || mongoose.model('EmergencyAlert', emergencyAlertSchema);
