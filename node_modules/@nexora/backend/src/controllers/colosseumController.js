import { LiveInterviewStream } from '../models/LiveInterviewStream.js';

export const getStreams = async (req, res, next) => {
  try {
    const streams = await LiveInterviewStream.find().populate('candidate', 'name').sort('-createdAt');
    res.status(200).json({ success: true, data: streams });
  } catch (error) {
    next(error);
  }
};

export const scheduleStream = async (req, res, next) => {
  try {
    const { title, interviewerRole, scheduledTime } = req.body;
    const stream = await LiveInterviewStream.create({
      candidate: req.user.id,
      title,
      interviewerRole,
      scheduledTime
    });
    res.status(201).json({ success: true, data: stream });
  } catch (error) {
    next(error);
  }
};

export const voteHire = async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'hire' or 'nohire'
    const stream = await LiveInterviewStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });

    if (voteType === 'hire') stream.hireVotes += 1;
    if (voteType === 'nohire') stream.noHireVotes += 1;

    await stream.save();
    res.status(200).json({ success: true, data: stream });
  } catch (error) {
    next(error);
  }
};
