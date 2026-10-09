import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  package: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  offerLetterUrl: { type: String },
  notes: { type: String }
}, { timestamps: true });

export const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
