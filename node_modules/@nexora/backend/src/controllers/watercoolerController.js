import { WatercoolerSession } from '../models/WatercoolerSession.js';

export const getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await WatercoolerSession.find({ status: { $ne: 'Ended' } }).populate('alumni', 'name');
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const startListening = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const session = await WatercoolerSession.create({
      alumni: req.user.id,
      topic,
      status: 'Listening'
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const joinSession = async (req, res, next) => {
  try {
    const session = await WatercoolerSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'Listening') return res.status(400).json({ message: 'Alumni is currently busy or offline' });

    session.status = 'InCall';
    session.currentStudent = req.user.id;
    session.callStartTime = new Date();
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
