import { HotSeatSession } from '../models/HotSeatSession.js';

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await HotSeatSession.find().populate('candidate', 'name').sort('scheduledTime');
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { topic, scheduledTime } = req.body;
    const session = await HotSeatSession.create({
      candidate: req.user.id,
      topic,
      scheduledTime
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const submitRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const session = await HotSeatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    // MVP: just overwrite or average it simply
    session.communityRating = session.communityRating === 0 ? rating : Math.floor((session.communityRating + rating) / 2);
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
