import { AlumniMicroContribution } from '../models/AlumniMicroContribution.js';

// Get a random 30-second question for the alumni to answer
export const getActivePoll = async (req, res, next) => {
  try {
    const defaultQuestions = [
      { type: 'SkillSignal', topic: 'What skills are most useful for freshers in your role?', industryContext: 'General' },
      { type: 'LessonLearned', topic: 'What is a common mistake juniors make in their first 6 months?', industryContext: 'General' },
      { type: 'RealityCheck', topic: 'Is a Master\'s degree strictly required to advance to a senior position in your field?', industryContext: 'General' }
    ];
    // Return a random question for the UI to display
    const randomQuestion = defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
    res.status(200).json({ success: true, data: randomQuestion });
  } catch (error) {
    next(error);
  }
};

// Alumni submitting their 30-second contribution
export const submitContribution = async (req, res, next) => {
  try {
    const { type, topic, response, industryContext } = req.body;
    const contribution = await AlumniMicroContribution.create({
      alumniId: req.user.id,
      type,
      topic,
      response,
      industryContext
    });
    res.status(201).json({ success: true, data: contribution, message: 'Contribution submitted successfully!' });
  } catch (error) {
    next(error);
  }
};

// Students fetching aggregated insights
export const getAggregatedInsights = async (req, res, next) => {
  try {
    const insights = await AlumniMicroContribution.find().populate('alumniId', 'name').sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};
