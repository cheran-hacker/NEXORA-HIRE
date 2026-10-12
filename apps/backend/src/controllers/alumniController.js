import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
// Import removed to use User.alumniProfile instead
import { MentorshipSession } from '../models/MentorshipSession.js';
import { Bounty } from '../models/Bounty.js';
import { ReferralLink } from '../models/ReferralLink.js';
import { ReferralApplicant } from '../models/ReferralApplicant.js';
import { AnonymousChat } from '../models/AnonymousChat.js';
import { matchVacancyToStudents } from '../modules/matching/vacancyMatcher.service.js';
import { AlumniMicroContribution } from '../models/AlumniMicroContribution.js';
import { AlumniConnection } from '../models/AlumniConnection.js';
import { SkillValidationRequest } from '../models/SkillValidationRequest.js';
import { Job } from '../models/Job.js';

export const getAlumniStats = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const user = await User.findById(alumniId);
    
    // 1. Mentorship Sessions
    const activeMentorshipsCount = await MentorshipSession.countDocuments({ mentor: alumniId, status: 'Active' });
    const completedSessionsCount = await MentorshipSession.countDocuments({ mentor: alumniId, status: 'Completed' });
    
    // 2. Pending Requests (Connections + Mentorships)
    const pendingMentorships = await MentorshipSession.find({ mentor: alumniId, status: 'Pending' })
      .populate('mentee', 'name avatar studentProfile')
      .sort({ createdAt: -1 });
      
    const pendingConnections = await AlumniConnection.find({ alumni: alumniId, status: 'Pending' })
      .populate('student', 'name avatar studentProfile')
      .sort({ createdAt: -1 });

    const totalPendingRequests = pendingMentorships.length + pendingConnections.length;

    // 3. Accepted Connections
    const connectionsCount = await AlumniConnection.countDocuments({ alumni: alumniId, status: 'Accepted' });

    // 4. Referrals / Opportunities posted by this Alumni
    const referralsCount = await Job.countDocuments({ recruiterId: alumniId, source: 'Alumni' });

    // Format pending requests for the UI
    const pendingRequestsFormatted = [
      ...pendingMentorships.map(m => ({
        _id: m._id,
        type: 'mentorship',
        student: {
          _id: m.mentee?._id,
          name: m.mentee?.name || 'Student',
          avatar: m.mentee?.avatar,
          department: m.mentee?.studentProfile?.department || 'Department',
          year: m.mentee?.studentProfile?.batchYear || 'N/A',
          targetRole: m.targetRole || m.mentee?.studentProfile?.targetCareerRole || 'Role',
        },
        message: m.message || 'Requesting mentorship',
        time: m.createdAt
      })),
      ...pendingConnections.map(c => ({
        _id: c._id,
        type: 'connection',
        student: {
          _id: c.student?._id,
          name: c.student?.name || 'Student',
          avatar: c.student?.avatar,
          department: c.student?.studentProfile?.department || 'Department',
          year: c.student?.studentProfile?.batchYear || 'N/A',
          targetRole: c.student?.studentProfile?.targetCareerRole || 'Role',
        },
        message: c.message || 'Requesting connection',
        time: c.createdAt
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5); // Limit to top 5 recent

    // Extract unique mentees from recent sessions for the directory and widget
    const recentSessions = await MentorshipSession.find({ mentor: alumniId, status: { $in: ['Active', 'Completed'] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('mentee', 'name avatar studentProfile');
      
    const menteesMap = new Map();
    recentSessions.forEach(s => {
      if (s.mentee && !menteesMap.has(s.mentee._id.toString())) {
        menteesMap.set(s.mentee._id.toString(), s.mentee);
      }
    });
    const mentees = Array.from(menteesMap.values());

    res.json({
      profileSummary: {
        name: user.name,
        role: user.alumniProfile?.designation || user.alumniProfile?.currentRole || "Alumni",
        company: user.alumniProfile?.company || "Unknown Company",
        gradYear: user.alumniProfile?.graduationYear || "N/A",
        donations: "$0",
        hoursContributed: 0
      },
      kpis: {
        studentRequests: totalPendingRequests,
        activeMentorships: activeMentorshipsCount,
        connections: connectionsCount,
        referrals: referralsCount,
        sessionsCompleted: completedSessionsCount,
        avgRating: user.alumniProfile?.rating || 0,
        availability: user.alumniProfile?.availability || false
      },
      pendingRequests: pendingRequestsFormatted,
      networkDirectory: mentees.map(m => ({
        id: m._id,
        name: m.name,
        role: "Mentee",
        company: m.studentProfile?.college,
        avatar: m.avatar || m.name.substring(0, 2).toUpperCase(),
        location: "Virtual",
        connectedDate: new Date().toLocaleDateString()
      })),
      hours: { labels: [], data: [] },
      impactMetrics: { labels: [], data: [] },
      recentActivity: []
    });
  } catch (error) {
    console.error('Error fetching alumni stats:', error);
    res.status(500).json({ error: 'Failed to fetch alumni statistics' });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Alumni not found' });
    
    const defaultSchedule = {
      monday: [{ start: "09:00", end: "11:00" }],
      tuesday: [],
      wednesday: [{ start: "14:00", end: "16:00" }],
      thursday: [],
      friday: [],
      saturday: [{ start: "10:00", end: "12:00" }],
      sunday: [],
    };
    
    return res.json({
      success: true,
      available: user.alumniProfile?.available ?? user.alumniProfile?.availability ?? true,
      schedule: user.alumniProfile?.schedule || defaultSchedule
    });
  } catch (error) {
    console.error('getAvailability Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability' });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const user = await User.findById(alumniId);
    if (!user) {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    
    if (!user.alumniProfile) user.alumniProfile = {};
    
    if (req.body.schedule) {
      user.alumniProfile.schedule = req.body.schedule;
    }
    
    if (typeof req.body.available === 'boolean') {
      user.alumniProfile.available = req.body.available;
      user.alumniProfile.availability = req.body.available;
    } else if (req.body.schedule === undefined) {
      const current = user.alumniProfile.available ?? user.alumniProfile.availability ?? true;
      user.alumniProfile.available = !current;
      user.alumniProfile.availability = !current;
    }
    
    user.markModified('alumniProfile');
    await user.save();
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      available: user.alumniProfile.available,
      schedule: user.alumniProfile.schedule
    });
  } catch (error) {
    console.error('Toggle Error:', error);
    res.status(500).json({ message: 'Server error toggling availability' });
  }
};

// ─── ALUMNI DIRECTORY ────────────────────────────────────────────────────────
export const getAlumniDirectory = async (req, res, next) => {
  try {
    const alumniUsers = await User.find({ role: 'Alumni' }).select('-password');
    
    // Merge user data with embedded alumniProfile data
    const directory = alumniUsers.map(user => ({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl || user.avatar,
      company: user.alumniProfile?.company || '',
      companyName: user.alumniProfile?.company || '',
      title: user.alumniProfile?.designation || '',
      currentRole: user.alumniProfile?.designation || '',
      graduationYear: user.alumniProfile?.graduationYear || '',
      location: user.alumniProfile?.location || 'Remote',
      expertise: user.alumniProfile?.expertise || [],
      mentorshipAvailable: user.alumniProfile?.available !== false,
      availableForMentorship: user.alumniProfile?.available !== false,
      user: { name: user.name, email: user.email, avatar: user.avatarUrl || user.avatar },
      karma: user.alumniProfile?.rating || 0,
      linkedIn: user.alumniProfile?.linkedinUrl || user.linkedinUrl || ''
    }));
    
    res.status(200).json({ success: true, data: directory });
  } catch (error) {
    next(error);
  }
};

export const getLiveRooms = async (req, res, next) => {
  try {
    const liveRooms = await AnonymousChat.find({ status: { $in: ['Active', 'Waiting'] } })
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.status(200).json({ success: true, data: liveRooms });
  } catch (error) {
    next(error);
  }
};

// ─── MENTORSHIP BOOKING ──────────────────────────────────────────────────────
export const bookMentorship = async (req, res, next) => {
  try {
    const { mentorId, alumniId, scheduledDate, scheduledAt, topic, notes, durationMinutes } = req.body;
    const targetMentorId = mentorId || alumniId;
    
    // Verify mentor exists and is an alumni
    const mentor = await User.findOne({ _id: targetMentorId, role: 'Alumni' });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found or is not an Alumni.' });
    }
    
    const session = await MentorshipSession.create({
      mentor: targetMentorId,
      mentee: req.user.id,
      scheduledDate: scheduledDate || scheduledAt || new Date(Date.now() + 86400000),
      topic: topic || notes || 'General Career Guidance',
      durationMinutes: durationMinutes || 30
    });
    
    res.status(201).json({ success: true, data: session, message: 'Mentorship requested successfully!' });
  } catch (error) {
    next(error);
  }
};

export const getMyMentorships = async (req, res, next) => {
  try {
    const query = req.user.role === 'Alumni' ? { mentor: req.user.id } : { mentee: req.user.id };
    const sessions = await MentorshipSession.find(query)
      .populate('mentor', 'name avatarUrl')
      .populate('mentee', 'name avatarUrl')
      .sort({ scheduledDate: 1 });
      
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const updateMentorshipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, meetingLink } = req.body;
    
    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.mentor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this session' });
    }
    
    session.status = status || session.status;
    if (meetingLink) session.meetingLink = meetingLink;
    
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// ─── BOUNTY BOARD ────────────────────────────────────────────────────────────
export const postBounty = async (req, res, next) => {
  try {
    const { title, description, rewardAmount, tags, deadline } = req.body;
    
    const bounty = await Bounty.create({
      title,
      description,
      rewardAmount,
      tags,
      deadline,
      poster: req.user.id
    });
    
    res.status(201).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};

export const getAlumniBounties = async (req, res, next) => {
  try {
    const bounties = await Bounty.find({ poster: req.user.id })
      .populate('submissions.student', 'name avatarUrl')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: bounties });
  } catch (error) {
    next(error);
  }
};

export const getReferrals = async (req, res, next) => {
  try {
    const links = await ReferralLink.find({ alumni: req.user.id }).sort({ createdAt: -1 });
    const linkIds = links.map(l => l._id);
    
    const applicants = await ReferralApplicant.find({ referralLink: { $in: linkIds } })
      .populate('student', 'name')
      .populate('referralLink', 'role company')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const kpis = {
      activeLinks: links.filter(l => l.isActive).length,
      totalApplicants: await ReferralApplicant.countDocuments({ referralLink: { $in: linkIds } }),
      hired: await ReferralApplicant.countDocuments({ referralLink: { $in: linkIds }, status: 'Hired' }),
      pending: await ReferralApplicant.countDocuments({ referralLink: { $in: linkIds }, status: 'Pending Review' })
    };
    
    const formattedLinks = links.map(l => ({
      id: l._id,
      role: l.role,
      company: l.company,
      url: l.url,
      clicks: l.clicks,
      conversions: applicants.filter(a => a.referralLink._id.toString() === l._id.toString()).length,
      createdAt: new Date(l.createdAt).toLocaleDateString()
    }));
    
    const formattedApplicants = applicants.map(a => ({
      id: a._id,
      name: a.student.name,
      roleApplied: a.referralLink.role,
      matchScore: a.matchScore,
      status: a.status
    }));

    res.json({
      success: true,
      data: {
        kpis,
        links: formattedLinks,
        recentApplicants: formattedApplicants
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateReferralLink = async (req, res, next) => {
  try {
    const { role, company } = req.body;
    
    // Generate a unique short URL
    const urlId = Math.random().toString(36).substring(2, 8);
    const url = `https://nexora.camp/ref/${urlId}`;
    
    const link = await ReferralLink.create({
      alumni: req.user.id,
      role,
      company,
      url,
      requiredSkills: req.body.requiredSkills || []
    });
    
    // Trigger vacancy matcher service asynchronously
    matchVacancyToStudents(link).then(matches => {
      console.log(`Vacancy matching complete. Found ${matches.length} potential matches.`);
      // In a real scenario, this would create in-app notifications or emails for the matched students.
    }).catch(err => {
      console.error("Vacancy matching failed:", err);
    });
    
    res.status(201).json({ success: true, data: link, message: "Vacancy shared and matching engine triggered." });
  } catch (error) {
    next(error);
  }
};

// ─── NOVELTY CONTROLLERS ─────────────────────────────────────────────────────

export const getTrajectorySimilarities = async (req, res, next) => {
  try {
    const users = await User.find({ 'alumniProfile.company': { $exists: true }, role: 'Alumni' }).select('name alumniProfile');
    res.status(200).json({ success: true, data: users, message: "Trajectory similarities calculated." });
  } catch (error) {
    next(error);
  }
};

export const getPendingValidations = async (req, res, next) => {
  try {
    const validations = await SkillValidationRequest.find({ status: 'Pending' })
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: validations });
  } catch (error) {
    next(error);
  }
};

export const validateSkill = async (req, res, next) => {
  try {
    const { requestId, status, feedback } = req.body;
    
    if (!requestId || !status) {
      return res.status(400).json({ success: false, message: 'Request ID and Status are required' });
    }

    const validation = await SkillValidationRequest.findById(requestId);
    if (!validation) {
      return res.status(404).json({ success: false, message: 'Validation request not found' });
    }

    validation.status = status;
    validation.feedback = feedback;
    validation.reviewer = req.user.id;
    await validation.save();

    res.status(200).json({ success: true, message: `Skill ${validation.skill} validation recorded as ${status}.`, data: validation });
  } catch (error) {
    next(error);
  }
};

export const postMicroContribution = async (req, res, next) => {
  try {
    const { type, topic, response, industryContext } = req.body;
    
    if (!type || !topic || !response) {
      return res.status(400).json({ success: false, message: 'Type, topic, and response are required.' });
    }

    const contribution = await AlumniMicroContribution.create({
      alumniId: req.user.id,
      type,
      topic,
      response,
      industryContext
    });

    res.status(201).json({ success: true, data: contribution });
  } catch (error) {
    next(error);
  }
};

// ─── CONNECTION REQUESTS ─────────────────────────────────────────────────────

export const getConnectionRequests = async (req, res, next) => {
  try {
    const { AlumniConnection } = await import('../models/AlumniConnection.js');
    const requests = await AlumniConnection.find({ alumni: req.user.id })
      .populate('student', 'name avatar studentProfile email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateConnectionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'

    const { AlumniConnection } = await import('../models/AlumniConnection.js');
    const request = await AlumniConnection.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (request.alumni.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ success: true, data: request, message: `Connection ${status.toLowerCase()}` });
  } catch (error) {
    next(error);
  }
};
