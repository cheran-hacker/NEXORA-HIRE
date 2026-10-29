import mongoose from 'mongoose';

const pivotRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  failureTitle: {
    type: String,
    required: true
  },
  context: {
    type: String, // What were they trying to do? (e.g., "Build a social app for pets")
    required: true
  },
  whatWentWrong: {
    type: String,
    required: true
  },
  keyTakeaway: {
    type: String, // The positive growth out of the failure
    required: true
  },
  dateOfFailure: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const PivotRecord = mongoose.models.PivotRecord || mongoose.model('PivotRecord', pivotRecordSchema);
