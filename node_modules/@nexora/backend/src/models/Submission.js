import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionId: { type: mongoose.Schema.Types.ObjectId }, // For MCQs
  textAnswer: { type: String }, // For subjective
  code: { type: String }, // For coding
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number, default: 0 }
});

const submissionSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  submitTime: { type: Date },
  answers: [answerSchema],
  totalScore: { type: Number, default: 0 },
  status: { type: String, enum: ['InProgress', 'Submitted', 'Evaluated'], default: 'InProgress' }
}, { timestamps: true });

submissionSchema.pre('save', function (next) {
  if (this.answers && this.answers.length > 0) {
    this.totalScore = this.answers.reduce((acc, curr) => acc + (curr.marksAwarded || 0), 0);
  }
  
  if (this.status === 'Submitted') {
    this.status = 'Evaluated';
  }
  next();
});

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
