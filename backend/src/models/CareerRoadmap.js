import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  month: { 
    type: String, 
    required: true 
  }, // e.g. "Month 1"
  focusArea: { 
    type: String, 
    required: true 
  }, // e.g. "Networking Fundamentals"
  description: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed'], 
    default: 'Not Started' 
  },
  skillsToLearn: [{ type: String }],
  actionItems: [{ type: String }],
  tags: [{ type: String }], // e.g. ["Video Lectures", "Practice Labs", "Quiz"]
  resources: [{
    title: String,
    type: { type: String, default: 'Resource' },
    url: String
  }]
}, { _id: true });

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Documentation' }, // Documentation, Practice Labs, Certifications, Courses
  url: { type: String, default: '#' },
  type: { type: String, default: 'Guide' },
  free: { type: Boolean, default: true }
}, { _id: true });

const noteSchema = new mongoose.Schema({
  title: { type: String, default: 'Study Note' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const careerRoadmapSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roleName: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    default: '6 months'
  },
  durationMonths: {
    type: Number,
    default: 6
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['In Progress', 'Saved', 'Completed', 'Archived'],
    default: 'In Progress'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentSkills: [{ type: String }],
  targetSkills: [{ type: String }],
  milestones: [milestoneSchema],
  resources: [resourceSchema],
  notes: [noteSchema],
  isFavorite: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

careerRoadmapSchema.methods.recalculateProgress = function() {
  if (!this.milestones || this.milestones.length === 0) return this.progress || 0;
  const total = this.milestones.length;
  let score = 0;
  this.milestones.forEach(m => {
    if (m.status === 'Completed') score += 1;
    else if (m.status === 'In Progress') score += 0.5;
  });
  const calculated = Math.round((score / total) * 100);
  this.progress = calculated;
  if (calculated === 100) {
    this.status = 'Completed';
  } else if (calculated > 0 && this.status !== 'In Progress') {
    this.status = 'In Progress';
  }
  return calculated;
};

if (mongoose.models.CareerRoadmap) {
  delete mongoose.models.CareerRoadmap;
}

export const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);
