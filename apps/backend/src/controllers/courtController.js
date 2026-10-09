import { PlagiarismAppeal } from '../models/PlagiarismAppeal.js';

export const getAppeals = async (req, res, next) => {
  try {
    const appeals = await PlagiarismAppeal.find().populate('student', 'name').sort('-createdAt');
    res.status(200).json({ success: true, data: appeals });
  } catch (error) {
    next(error);
  }
};

export const createAppeal = async (req, res, next) => {
  try {
    const { assignmentName, defenseStatement } = req.body;
    const appeal = await PlagiarismAppeal.create({
      student: req.user.id,
      assignmentName,
      defenseStatement
    });
    res.status(201).json({ success: true, data: appeal });
  } catch (error) {
    next(error);
  }
};

export const voteOnAppeal = async (req, res, next) => {
  try {
    const { vote, reasoning } = req.body;
    const appeal = await PlagiarismAppeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Appeal not found' });
    if (appeal.status !== 'Deliberating') return res.status(400).json({ message: 'Voting closed' });

    // Ensure jury doesn't double vote
    if (appeal.juryVotes.find(v => v.juror.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You already voted on this appeal' });
    }

    appeal.juryVotes.push({ juror: req.user.id, vote, reasoning });

    // Check if enough votes (e.g., 3 votes ends it)
    if (appeal.juryVotes.length >= 3) {
      const guiltyVotes = appeal.juryVotes.filter(v => v.vote === 'Guilty').length;
      appeal.status = guiltyVotes >= 2 ? 'Guilty' : 'Innocent';
      
      if (appeal.status === 'Guilty') {
        // Find the user and deduct karma (simulate or real)
        const mongoose = await import('mongoose');
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(appeal.student, { $inc: { karma: -500 } });
      } else {
        // Refund/reward for innocent
        const mongoose = await import('mongoose');
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(appeal.student, { $inc: { karma: 100 } });
      }
    }

    await appeal.save();
    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    next(error);
  }
};
