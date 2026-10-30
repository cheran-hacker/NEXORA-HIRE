import { Assessment } from '../models/Assessment.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';

// @desc    Get all published assessments
// @route   GET /api/assessments
export const getAssessments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = 'Published';
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    const assessments = await Assessment.find(filter)
      .select('-questions.options.isCorrect -questions.testCases.expectedOutput')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    console.error('[getAssessments] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assessments' });
  }
};

// @desc    Get single assessment by ID
// @route   GET /api/assessments/:id
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Hide answers if accessed by student or unauthenticated candidate
    let sanitized = assessment.toObject();
    const canViewAnswers = req.user && ['Admin', 'Placement', 'Recruiter'].includes(req.user.role);
    if (!canViewAnswers && Array.isArray(sanitized.questions)) {
      sanitized.questions = sanitized.questions.map((q) => {
        const { options = [], ...rest } = q;
        return {
          ...rest,
          options: options.map((opt) => ({
            _id: opt._id,
            text: opt.text,
          })),
        };
      });
    }

    res.status(200).json({ success: true, data: sanitized });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid assessment ID format' });
    }
    console.error('[getAssessmentById] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assessment' });
  }
};

// @desc    Get assessments for current user (Placement/Admin created list OR Student submissions)
// @route   GET /api/assessments/my-assessments
export const getMyAssessments = async (req, res) => {
  try {
    // If student, return their submissions populated with assessment info
    if (req.user?.role === 'Student') {
      const submissions = await Submission.find({ studentId: req.user.id })
        .populate('assessmentId')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: submissions.length, data: submissions });
    }

    // For Admin or Placement, return all system assessments or user-created ones
    const filter = (req.user.role === 'Admin' || req.user.role === 'Placement')
      ? (req.query.mine === 'true' ? { createdBy: req.user.id } : {})
      : { createdBy: req.user.id };

    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    console.error('[getMyAssessments] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve my assessments' });
  }
};

// @desc    Create new assessment
// @route   POST /api/assessments
export const createAssessment = async (req, res) => {
  try {
    const {
      title,
      topic,
      type = 'Technical',
      difficulty = 'Medium',
      durationMinutes,
      status = 'Published',
      totalMarks,
      passingPercentage,
      description,
      questions = [],
      settings,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment title is required.' });
    }

    const duration = Number(durationMinutes);
    if (!duration || duration <= 0) {
      return res.status(400).json({ success: false, message: 'Valid assessment duration in minutes is required.' });
    }

    // Normalize type against allowed enums
    const validTypes = ['Aptitude', 'Technical', 'Coding', 'CompanySpecific', 'Domain Specific', 'General'];
    const matchedType = validTypes.find(
      (t) => t.toLowerCase() === String(type).trim().toLowerCase(),
    );
    const normalizedType = matchedType || 'Technical';

    // Normalize difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    const normalizedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Medium';

    // Normalize questions array (support both 'content' and 'text')
    const normalizedQuestions = (Array.isArray(questions) ? questions : []).map((q, idx) => {
      const prompt = (q.content || q.text || q.questionPrompt || '').trim() || `Question ${idx + 1}`;
      const qType = q.type && ['MCQ', 'Coding', 'Subjective'].includes(q.type) ? q.type : 'MCQ';
      const qDifficulty = validDifficulties.includes(q.difficulty) ? q.difficulty : normalizedDifficulty;
      const defaultMarks = qDifficulty === 'Hard' ? 4 : qDifficulty === 'Medium' ? 3 : 2;
      const qMarks = typeof q.marks === 'number' && q.marks > 0 ? q.marks : defaultMarks;

      const options = Array.isArray(q.options)
        ? q.options.map((opt) => ({
            text: typeof opt === 'string' ? opt : String(opt?.text || opt?.option || ''),
            isCorrect: Boolean(opt?.isCorrect || opt?.correct || opt?.is_correct),
          }))
        : [];

      return {
        type: qType,
        content: prompt,
        marks: qMarks,
        difficulty: qDifficulty,
        options,
        language: q.language || undefined,
        initialCode: q.initialCode || undefined,
        testCases: Array.isArray(q.testCases) ? q.testCases : [],
      };
    });

    const calculatedTotalMarks =
      Number(totalMarks) > 0
        ? Number(totalMarks)
        : normalizedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const desc =
      description && description.trim()
        ? description.trim()
        : `AI-generated ${normalizedDifficulty} assessment on: ${topic || title.trim()}.`;

    const assessmentData = {
      title: title.trim(),
      description: desc,
      createdBy: req.user.id,
      type: normalizedType,
      difficulty: normalizedDifficulty,
      durationMinutes: duration,
      status: ['Draft', 'Published', 'Archived'].includes(status) ? status : 'Published',
      totalMarks: calculatedTotalMarks,
      passingPercentage: Number(passingPercentage) || 60,
      questions: normalizedQuestions,
      settings: settings || {
        shuffleQuestions: false,
        proctoringEnabled: false,
        showResultsImmediately: true,
      },
    };

    const assessment = await Assessment.create(assessmentData);
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error('[createAssessment] Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('; ') || error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while saving assessment',
    });
  }
};

// @desc    Start assessment session (marks the attempt)
// @route   POST /api/assessments/:id/start
export const startAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.status(200).json({ success: true, message: 'Assessment session started', data: { assessmentId: assessment._id } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid assessment ID format' });
    }
    console.error('[startAssessment] Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to start assessment' });
  }
};

// @desc    Submit assessment and auto-grade
// @route   POST /api/assessments/:id/submit
export const submitAssessment = async (req, res) => {
  try {
    const { answers = {} } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    let score = 0;
    let totalMarks = 0;
    const evaluatedAnswers = [];

    (assessment.questions || []).forEach((q) => {
      const qMarks = q.marks || 1;
      totalMarks += qMarks;

      const qIdStr = q._id.toString();
      const studentAnswer = answers[qIdStr] !== undefined ? answers[qIdStr] : answers[q._id];

      let isCorrect = false;
      let marksAwarded = 0;
      let selectedOptionId = null;

      if (q.type === 'MCQ' && Array.isArray(q.options)) {
        const correctOption = q.options.find((opt) => opt.isCorrect);
        const matchedOption = q.options.find(
          (opt) => opt.text === studentAnswer || opt._id?.toString() === studentAnswer
        );
        if (matchedOption) {
          selectedOptionId = matchedOption._id;
        }

        if (correctOption) {
          if (
            studentAnswer === correctOption.text ||
            studentAnswer === correctOption._id?.toString() ||
            (matchedOption && matchedOption.isCorrect)
          ) {
            isCorrect = true;
            marksAwarded = qMarks;
            score += qMarks;
          }
        }
      } else if (studentAnswer) {
        isCorrect = true;
        marksAwarded = qMarks;
        score += qMarks;
      }

      if (studentAnswer !== undefined) {
        evaluatedAnswers.push({
          questionId: q._id,
          selectedOptionId,
          textAnswer: typeof studentAnswer === 'string' ? studentAnswer : JSON.stringify(studentAnswer),
          isCorrect,
          marksAwarded
        });
      }
    });

    Object.keys(answers).forEach((key) => {
      const alreadyIncluded = evaluatedAnswers.some(a => a.questionId.toString() === key.toString());
      if (!alreadyIncluded) {
        evaluatedAnswers.push({
          questionId: key,
          textAnswer: typeof answers[key] === 'string' ? answers[key] : JSON.stringify(answers[key]),
          marksAwarded: 0,
          isCorrect: false
        });
      }
    });

    const maxMarks = assessment.totalMarks > 0 ? assessment.totalMarks : (totalMarks > 0 ? totalMarks : 100);
    const percentage = Math.min(100, maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0);
    const passingPct = assessment.passingPercentage || 60;
    const finalStatus = percentage >= passingPct ? 'Passed' : 'Failed';

    const submission = await Submission.create({
      assessmentId: assessment._id,
      studentId: req.user.id,
      submitTime: new Date(),
      totalScore: score,
      status: 'Evaluated',
      answers: evaluatedAnswers,
    });

    // Update readiness score on student profile
    const user = await User.findById(req.user.id);
    if (user && user.role === 'Student') {
      if (!user.readinessScore) user.readinessScore = 0;
      user.readinessScore =
        user.readinessScore === 0
          ? percentage
          : Math.round((user.readinessScore + percentage) / 2);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        totalMarks: maxMarks,
        percentage,
        status: finalStatus,
        submissionId: submission._id,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid assessment ID format' });
    }
    console.error('[submitAssessment] Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit assessment' });
  }
};

// @desc    Get submissions for an assessment
// @route   GET /api/assessments/:id/submissions
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assessmentId: req.params.id })
      .populate('studentId', 'name email avatar studentProfile.batchYear studentProfile.branch')
      .sort({ submitTime: -1 });
    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid assessment ID format' });
    }
    console.error('[getSubmissions] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assessment submissions' });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
export const updateAssessment = async (req, res) => {
  try {
    let assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (assessment.createdBy && assessment.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assessment' });
    }

    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid assessment ID format' });
    }
    console.error('[updateAssessment] Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update assessment' });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (assessment.createdBy && assessment.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assessment' });
    }

    await assessment.deleteOne();
    res.status(200).json({ success: true, message: 'Assessment deleted successfully', data: {} });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid assessment ID format' });
    }
    console.error('[deleteAssessment] Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete assessment' });
  }
};
