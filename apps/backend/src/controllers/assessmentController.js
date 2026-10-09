import { Assessment } from '../models/Assessment.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';

// @desc    Get all published assessments
// @route   GET /api/assessments
export const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ status: 'Published' }).select('-questions.options.isCorrect -questions.testCases.expectedOutput');
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single assessment by ID
// @route   GET /api/assessments/:id
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select('-questions.options.isCorrect -questions.testCases.expectedOutput');
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit assessment and auto-grade
// @route   POST /api/assessments/:id/submit
export const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: 'answer_or_code' }
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    let score = 0;
    let totalMarks = 0;

    // Simple MCQ Grading logic (Mocking coding eval for now)
    assessment.questions.forEach(q => {
      totalMarks += q.marks;
      if (q.type === 'MCQ') {
        const correctOption = q.options.find(opt => opt.isCorrect);
        if (correctOption && answers[q._id] === correctOption.text) {
          score += q.marks;
        }
      } else if (q.type === 'Coding') {
        // In a real app, this would send code to a secure docker sandbox.
        // Since we have NO FAKE DATA policy and no sandbox, we do not artificially grant points.
        // It requires manual evaluation or actual execution engine.
        score += 0;
      }
    });

    const percentage = (score / totalMarks) * 100;
    const finalStatus = percentage >= 60 ? 'Passed' : 'Failed';

    // Save submission to MongoDB
    const submission = await Submission.create({
      assessmentId: assessment._id,
      studentId: req.user.id,
      submitTime: new Date(),
      totalScore: score,
      status: 'Evaluated',
      answers: Object.keys(answers).map(key => ({
        questionId: key,
        textAnswer: answers[key]
      }))
    });

    // Sync grade to student profile
    const user = await User.findById(req.user.id);
    if (user && user.role === 'Student') {
      if (!user.readinessScore) user.readinessScore = 0;
      // Simple moving average for readiness score based on assessment percentage
      user.readinessScore = user.readinessScore === 0 ? Math.round(percentage) : Math.round((user.readinessScore + percentage) / 2);
      await user.save();
    }

    res.status(200).json({ 
      success: true, 
      data: { score, totalMarks, percentage, status: finalStatus, submissionId: submission._id } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assessments created by the logged in user (Admin/Recruiter/Faculty)
// @route   GET /api/assessments/my-assessments
export const getMyAssessments = async (req, res) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { createdBy: req.user.id };
    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new assessment
// @route   POST /api/assessments
export const createAssessment = async (req, res) => {
  try {
    const assessmentData = { ...req.body, createdBy: req.user.id };
    const assessment = await Assessment.create(assessmentData);
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start assessment session (marks the attempt)
// @route   POST /api/assessments/:id/start
export const startAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    // Simply acknowledge the start — no-op for now
    res.status(200).json({ success: true, message: 'Assessment session started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
export const updateAssessment = async (req, res) => {
  try {
    let assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    // Ensure user owns the assessment unless they are an admin
    if (assessment.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assessment' });
    }

    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    if (assessment.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assessment' });
    }

    await assessment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
