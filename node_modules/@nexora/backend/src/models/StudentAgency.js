import mongoose from 'mongoose';

const studentAgencySchema = new mongoose.Schema({
  agencyName: {
    type: String,
    required: true,
    unique: true
  },
  tagline: {
    type: String
  },
  founders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  specialties: [{
    type: String // e.g. "React Native", "UI/UX", "Backend"
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const StudentAgency = mongoose.models.StudentAgency || mongoose.model('StudentAgency', studentAgencySchema);
