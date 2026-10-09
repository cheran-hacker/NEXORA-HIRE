import mongoose from 'mongoose';

const synergyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Hacker (Tech), Hustler (Business/Sales), Hipster (Design/UX)
  primaryRole: {
    type: String,
    enum: ['Hacker', 'Hustler', 'Hipster'],
    required: true
  },
  // What roles they are looking for in a cofounder
  lookingFor: [{
    type: String,
    enum: ['Hacker', 'Hustler', 'Hipster']
  }],
  // Myers-Briggs or generic personality archetype to match complementary traits
  personalityArchetype: {
    type: String,
    enum: ['Visionary', 'Executor', 'Analyst', 'Communicator']
  },
  topSkills: [String],
  ideaStage: {
    type: String,
    enum: ['Just Exploring', 'Have an Idea', 'Building MVP', 'Have Revenue'],
    default: 'Just Exploring'
  },
  pitchIdea: String, // Brief 2-sentence description of their startup idea (if any)
  commitmentLevel: {
    type: String,
    enum: ['Part-time (Weekends)', 'Part-time (Evenings)', 'Full-time', 'Drop-out ready']
  }
}, { timestamps: true });

export const SynergyProfile = mongoose.models.SynergyProfile || mongoose.model('SynergyProfile', synergyProfileSchema);
