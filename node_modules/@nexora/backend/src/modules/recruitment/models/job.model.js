import mongoose from 'mongoose';
import { STATUSES } from '../../../../../../packages/shared-constants/index.js';

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    requirements: [String],
    skillsRequired: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    jobType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Internship', 'Contract'],
      required: true
    },
    location: String,
    isRemote: {
      type: Boolean,
      default: false
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' }
    },
    experienceRequired: {
      min: Number,
      max: Number
    },
    openings: Number,
    deadline: Date,
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.ACTIVE
    },
    hiringDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HiringDrive'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
