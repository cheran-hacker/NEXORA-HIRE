import { ConsensusQuestion } from '../models/ConsensusQuestion.js';

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await ConsensusQuestion.find()
      .populate('studentId', 'name')
      .populate('responses.alumniId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

export const askQuestion = async (req, res, next) => {
  try {
    const { question, industryContext, targetRole } = req.body;

    if (!question || !industryContext) {
      return res.status(400).json({ success: false, message: 'Question and Context are required' });
    }

    const newQuestion = await ConsensusQuestion.create({
      studentId: req.user.id,
      question,
      industryContext,
      targetRole: targetRole || ''
    });

    // Populate the newly created question's student data so the frontend can use it immediately if needed
    await newQuestion.populate('studentId', 'name');

    res.status(201).json({ success: true, data: newQuestion });
  } catch (error) {
    next(error);
  }
};

export const answerQuestion = async (req, res, next) => {
  try {
    const { answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }

    const consensusQuestion = await ConsensusQuestion.findById(req.params.id);
    if (!consensusQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    consensusQuestion.responses.push({
      alumniId: req.user.id,
      answer,
      upvotes: 0
    });

    await consensusQuestion.save();

    res.status(200).json({ success: true, data: consensusQuestion });
  } catch (error) {
    next(error);
  }
};
