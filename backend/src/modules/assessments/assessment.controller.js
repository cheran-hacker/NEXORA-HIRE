import Assessment from './models/assessment.model.js';
import Submission from './models/submission.model.js';
import AppError from '../../core/errors/AppError.js';
import { ASSESSMENT_STATUSES } from '../../../../../packages/shared-constants/index.js';

// ─── Faculty / Admin: Create Assessment ────────────────────────────────────
export const createAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ status: 'success', data: assessment });
  } catch (error) {
    next(error);
  }
};

// ─── Faculty / Admin: Get All Assessments ──────────────────────────────────
export const getAllAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find().populate('createdBy', 'name email').lean();
    res.status(200).json({ status: 'success', results: assessments.length, data: assessments });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Assessment (with questions) ────────────────────────────────
export const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions.questionId')
      .populate('createdBy', 'name');

    if (!assessment) return next(new AppError('Assessment not found', 404));
    res.status(200).json({ status: 'success', data: assessment });
  } catch (error) {
    next(error);
  }
};

// ─── Student: Start Assessment Session ────────────────────────────────────
export const startAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return next(new AppError('Assessment not found', 404));

    const existingSubmission = await Submission.findOne({
      assessment: req.params.id,
      student: req.user._id
    });

    if (existingSubmission && existingSubmission.status === ASSESSMENT_STATUSES.COMPLETED) {
      return next(new AppError('You have already completed this assessment', 400));
    }

    if (existingSubmission) {
      return res.status(200).json({ status: 'success', data: existingSubmission });
    }

    const submission = await Submission.create({
      assessment: req.params.id,
      student: req.user._id
    });

    res.status(201).json({ status: 'success', data: submission });
  } catch (error) {
    next(error);
  }
};

// ─── Student: Submit Assessment Answers ───────────────────────────────────
export const submitAssessment = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const submission = await Submission.findOneAndUpdate(
      { assessment: req.params.id, student: req.user._id },
      {
        answers,
        status: ASSESSMENT_STATUSES.COMPLETED,
        endTime: new Date()
      },
      { new: true }
    );

    if (!submission) return next(new AppError('No active submission found', 404));
    res.status(200).json({ status: 'success', data: submission });
  } catch (error) {
    next(error);
  }
};

// ─── Faculty: Get All Submissions for Assessment ──────────────────────────
export const getSubmissionsByAssessment = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assessment: req.params.id })
      .populate('student', 'name email');
    res.status(200).json({ status: 'success', results: submissions.length, data: submissions });
  } catch (error) {
    next(error);
  }
};
