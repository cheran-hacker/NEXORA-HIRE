import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  requirements: [{
    type: String
  }],
  eligibility: {
    minGpa: Number,
    majors: [String],
    yearOfStudy: [String]
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Awarded'],
    default: 'Open'
  },
  applicants: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Rejected', 'Selected'], default: 'Pending' }
  }]
}, {
  timestamps: true
});

export const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', scholarshipSchema);
