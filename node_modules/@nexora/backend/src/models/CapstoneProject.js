import mongoose from 'mongoose';

const capstoneProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pitch: { type: String, required: true },
  fundingGoal: { type: Number, required: true },
  currentFunding: { type: Number, default: 0 },
  equityOffered: { type: Number, required: true }, // percentage
  status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Completed'], default: 'Pending Approval' },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }],
  investors: [{
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number
  }]
}, { timestamps: true });

export const CapstoneProject = mongoose.models.CapstoneProject || mongoose.model('CapstoneProject', capstoneProjectSchema);
