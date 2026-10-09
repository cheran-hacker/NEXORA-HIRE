import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Full-Time', 'Part-Time', 'Internship', 'Contract'], required: true },
  location: { type: String, required: true }, // e.g. 'Bangalore, Hybrid' or 'Remote'
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' },
    hidden: { type: Boolean, default: false }
  },
  experience: { type: String }, // e.g. '0-2 years'
  
  // Placement specific
  eligibleBatches: [Number],
  eligibleBranches: [String],
  minimumCGPA: { type: Number, default: 0 },
  
  status: { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
  source: { type: String, enum: ['Placement', 'Alumni'], default: 'Placement' },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  deadline: { type: Date },
  
  metrics: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    offers: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Index for search
jobSchema.index({ title: 'text', company: 'text', skills: 'text' });

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
