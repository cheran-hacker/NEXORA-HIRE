import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  credentialId: { type: String },
  url: { type: String },
  skillsVerified: [{ type: String }],
  type: { type: String, enum: ['Course', 'Hackathon', 'Assessment', 'Internship'], default: 'Course' },
  status: { type: String, enum: ['Verified', 'Pending'], default: 'Verified' }
}, { timestamps: true });

export const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
