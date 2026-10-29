import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['MCQ', 'Coding', 'Subjective'], required: true },
  content: { type: String, required: true }, // The question text
  marks: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  
  // MCQ specific
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  
  // Coding specific
  language: { type: String }, // e.g., 'javascript', 'python'
  initialCode: { type: String },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }]
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Faculty or Recruiter
  type: { type: String, enum: ['Aptitude', 'Technical', 'Coding', 'CompanySpecific'], required: true },
  
  durationMinutes: { type: Number, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  
  questions: [questionSchema],
  
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    proctoringEnabled: { type: Boolean, default: false },
    showResultsImmediately: { type: Boolean, default: true }
  },
  
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' }
}, { timestamps: true });

export const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
