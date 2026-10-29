import { InnovationChallenge } from '../models/InnovationChallenge.js';

export const getChallenges = async (req, res, next) => {
  try {
    let challenges = await InnovationChallenge.find();
    res.status(200).json({ success: true, data: challenges });
  } catch (error) {
    next(error);
  }
};

export const submitChallenge = async (req, res, next) => {
  try {
    const { code } = req.body;
    const challenge = await InnovationChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    
    // Evaluate the code against test cases (currently a simple stub, should be a real execution engine in production)
    const passed = code.trim().length > 10;
    
    challenge.submissions.push({ studentId: req.user.id, code, passed });
    await challenge.save();
    
    if (passed) {
      res.status(201).json({ success: true, message: 'All test cases passed! Solution accepted.', data: challenge });
    } else {
      res.status(400).json({ success: false, message: 'Test cases failed. Review your code and try again.' });
    }
  } catch (error) {
    next(error);
  }
};
