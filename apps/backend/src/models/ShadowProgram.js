import mongoose from 'mongoose';

const shadowProgramSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  alumniName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  microTasks: [{ type: String }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const ShadowProgram = mongoose.models.ShadowProgram || mongoose.model('ShadowProgram', shadowProgramSchema);
