import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  }
}, { timestamps: true });

// Prevent student from saving the same job multiple times
savedJobSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

export const SavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);
