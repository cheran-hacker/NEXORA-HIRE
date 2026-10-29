import mongoose from 'mongoose';

const alumniConnectionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  message: {
    type: String
  }
}, { timestamps: true });

// Prevent duplicate pending/accepted requests
alumniConnectionSchema.index({ student: 1, alumni: 1 }, { unique: true });

export const AlumniConnection = mongoose.models.AlumniConnection || mongoose.model('AlumniConnection', alumniConnectionSchema);
