import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { type: String, enum: ['Remote', 'On-Site', 'Hybrid'], default: 'Remote' },
  duration: { type: String }, // e.g., "2 months", "6 months"
  location: { type: String },
  stipend: {
    amount: { type: Number },
    currency: { type: String, default: 'INR' },
    period: { type: String, default: 'Monthly' }
  },
  
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  
  ppoChance: { type: Boolean, default: false }, // Pre-Placement Offer possibility
  certificate: { type: Boolean, default: true },
  lettersOfRecommendation: { type: Boolean, default: false },
  
  startDate: { type: Date },
  applicationDeadline: { type: Date },
  eligibleBatches: [Number],
  
  openings: { type: Number, default: 1 },
  status: { type: String, enum: ['Open', 'Closed', 'Filled'], default: 'Open' }
}, { timestamps: true });

export const Internship = mongoose.models.Internship || mongoose.model('Internship', internshipSchema);
