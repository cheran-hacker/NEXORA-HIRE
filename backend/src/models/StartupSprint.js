import mongoose from 'mongoose';

const startupSprintSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  projectBrief: {
    type: String,
    required: true
  },
  bountyAmount: {
    type: Number,
    required: true
  },
  requiredRoles: [{
    type: String
  }],
  team: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String
  }],
  status: {
    type: String,
    enum: ['Open', 'Locked_In', 'Completed'],
    default: 'Open'
  },
  sprintStartTime: {
    type: Date
  },
  deadline: {
    type: Date
  },
  goals: [{
    description: String,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export const StartupSprint = mongoose.models.StartupSprint || mongoose.model('StartupSprint', startupSprintSchema);
