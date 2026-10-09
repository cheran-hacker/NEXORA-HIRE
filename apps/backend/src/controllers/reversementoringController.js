import { ReverseMentoring } from '../models/ReverseMentoring.js';

export const getMentors = async (req, res, next) => {
  try {
    let mentors = await ReverseMentoring.find().populate('studentMentor', 'name');

    res.status(200).json({ success: true, data: mentors });
  } catch (error) {
    next(error);
  }
};

export const offerMentoring = async (req, res, next) => {
  try {
    const { topic, hourlyRate } = req.body;
    const session = await ReverseMentoring.create({
      studentMentor: req.user.id,
      topic,
      hourlyRate
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const bookMentoring = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await ReverseMentoring.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.status === 'Booked') {
      return res.status(409).json({ success: false, message: 'Session is already booked' });
    }
    
    // We assume the user booking is an Alumni or someone who wants to learn
    session.status = 'Booked';
    session.corporateExecName = req.user.name || 'Anonymous Exec';
    await session.save();
    
    res.status(200).json({ success: true, data: session, message: 'Successfully booked reverse mentoring session.' });
  } catch (error) {
    next(error);
  }
};
