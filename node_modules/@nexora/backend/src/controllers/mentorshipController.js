import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

// @desc    Get all available Alumni mentors
// @route   GET /api/mentorship/alumni
export const getAlumni = async (req, res, next) => {
  try {
    const alumni = await User.find({ role: 'Alumni', 'alumniProfile.available': true })
      .select('name avatar alumniProfile');

    res.status(200).json({ success: true, count: alumni.length, data: alumni });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a mentorship session
// @route   POST /api/mentorship/book
export const bookSession = async (req, res, next) => {
  try {
    const { mentorId, type, scheduledAt, durationMinutes, menteeNotes } = req.body;

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'Alumni') {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    // Conflict Logic
    const requestedStart = new Date(scheduledAt);
    const requestedDuration = durationMinutes || 30;
    const requestedEnd = new Date(requestedStart.getTime() + requestedDuration * 60000);

    const existingSessions = await Session.find({
      mentor: mentorId,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    const hasConflict = existingSessions.some(session => {
      const existingStart = new Date(session.scheduledAt);
      const existingEnd = new Date(existingStart.getTime() + (session.durationMinutes || 30) * 60000);
      
      // Check for overlap
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });

    if (hasConflict) {
      return res.status(409).json({ success: false, message: 'Mentor is already booked for this time slot.' });
    }

    const session = await Session.create({
      mentor: mentorId,
      mentee: req.user.id,
      type,
      scheduledAt,
      durationMinutes: durationMinutes || 30,
      menteeNotes
    });

    const populatedSession = await Session.findById(session._id)
      .populate('mentor', 'name avatar alumniProfile.company alumniProfile.designation')
      .populate('mentee', 'name avatar');

    res.status(201).json({ success: true, data: populatedSession });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sessions for logged-in user (as mentor or mentee)
// @route   GET /api/mentorship/sessions
export const getMySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentor: req.user.id }, { mentee: req.user.id }]
    })
      .populate('mentor', 'name avatar alumniProfile.company alumniProfile.designation')
      .populate('mentee', 'name avatar studentProfile.college')
      .sort({ scheduledAt: 1 });

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm a session (Mentor action)
// @route   PATCH /api/mentorship/sessions/:id/confirm
export const confirmSession = async (req, res, next) => {
  try {
    const { meetingLink } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.status = 'Confirmed';
    session.meetingLink = meetingLink || 'https://meet.google.com/nexora-session';
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave feedback after session (Mentee action)
// @route   PATCH /api/mentorship/sessions/:id/feedback
export const leaveFeedback = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.mentee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.rating = rating;
    session.review = review;
    session.status = 'Completed';
    await session.save();

    // Update mentor's average rating
    const allSessions = await Session.find({ mentor: session.mentor, status: 'Completed', rating: { $exists: true } });
    const avgRating = allSessions.reduce((acc, s) => acc + s.rating, 0) / allSessions.length;
    await User.findByIdAndUpdate(session.mentor, { 'alumniProfile.rating': avgRating.toFixed(1) });

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
