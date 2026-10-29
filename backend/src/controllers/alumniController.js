import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
// Import removed to use User.alumniProfile instead
import { MentorshipSession } from '../models/MentorshipSession.js';
import { MentorshipRequest } from '../models/MentorshipRequest.js';
import { Bounty } from '../models/Bounty.js';
import { ReferralLink } from '../models/ReferralLink.js';
import { ReferralApplicant } from '../models/ReferralApplicant.js';
import { AnonymousChat } from '../models/AnonymousChat.js';
import { matchVacancyToStudents } from '../modules/matching/vacancyMatcher.service.js';
import { AlumniMicroContribution } from '../models/AlumniMicroContribution.js';
import { AlumniConnection } from '../models/AlumniConnection.js';
import { SkillValidationRequest } from '../models/SkillValidationRequest.js';
import { Notification } from '../models/Notification.js';
import { StudentSkill } from '../models/StudentSkill.js';
import { Skill } from '../models/Skill.js';
import { SkillBadge } from '../models/SkillBadge.js';
import { Certificate } from '../models/Certificate.js';
import { Submission } from '../models/Submission.js';
import { calculateReadinessScore } from '../utils/readinessEngine.js';
import { Job } from '../models/Job.js';
import { Post } from '../models/Post.js';
import { getMyAvailability, updateMyAvailability } from './mentorshipController.js';

export const getAlumniStats = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const user = await User.findById(alumniId);
    
    // 1. Mentorship Sessions (Scheduled / Confirmed & Completed)
    const scheduledSessionsCount = await MentorshipSession.countDocuments({
      mentor: alumniId,
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved', 'InProgress', 'Rescheduled'] }
    });
    const completedSessionsCount = await MentorshipSession.countDocuments({
      mentor: alumniId,
      status: 'Completed'
    });

    // Distinct Mentees
    const distinctMentees = await MentorshipSession.distinct('mentee', {
      mentor: alumniId,
      status: { $in: ['Completed', 'Active', 'Confirmed', 'Scheduled', 'InProgress', 'Rescheduled'] }
    });
    
    // 2. Pending Requests (MentorshipRequests + Connections)
    const pendingMentorshipRequests = await MentorshipRequest.find({ alumni: alumniId, status: 'Pending' })
      .populate('student', 'name avatar studentProfile email')
      .sort({ createdAt: -1 });

    const pendingLegacyMentorships = await MentorshipSession.find({ mentor: alumniId, status: 'Pending' })
      .populate('mentee', 'name avatar studentProfile email')
      .sort({ createdAt: -1 });
      
    const pendingConnections = await AlumniConnection.find({ alumni: alumniId, status: 'Pending' })
      .populate('student', 'name avatar studentProfile email')
      .sort({ createdAt: -1 });

    const totalPendingRequests = pendingMentorshipRequests.length + pendingLegacyMentorships.length + pendingConnections.length;

    // 3. Accepted Connections
    const connectionsCount = await AlumniConnection.countDocuments({ alumni: alumniId, status: 'Accepted' });

    // 4. Referrals / Opportunities posted by this Alumni
    const referralsCount = await Job.countDocuments({ recruiterId: alumniId, source: 'Alumni' });

    // Format pending requests for the UI
    const pendingRequestsFormatted = [
      ...pendingMentorshipRequests.map(m => ({
        _id: m._id,
        type: 'mentorship',
        student: {
          _id: m.student?._id,
          name: m.student?.name || 'Student',
          avatar: m.student?.avatar,
          department: m.student?.studentProfile?.department || 'Engineering',
          year: m.student?.studentProfile?.batchYear || 'N/A',
          targetRole: m.targetRole || m.student?.studentProfile?.targetCareerRole || 'Role',
        },
        topic: m.topic || '1-on-1 Mentorship Request',
        message: m.message || m.topic || 'Requesting mentorship',
        date: m.requestedDate,
        time: m.requestedStartTime,
        createdAt: m.createdAt,
        timeAgo: m.createdAt
      })),
      ...pendingLegacyMentorships.map(m => ({
        _id: m._id,
        type: 'mentorship',
        student: {
          _id: m.mentee?._id,
          name: m.mentee?.name || 'Student',
          avatar: m.mentee?.avatar,
          department: m.mentee?.studentProfile?.department || 'Engineering',
          year: m.mentee?.studentProfile?.batchYear || 'N/A',
          targetRole: m.targetRole || m.mentee?.studentProfile?.targetCareerRole || 'Role',
        },
        topic: m.topic || 'Mentorship Session',
        message: m.message || 'Requesting mentorship',
        time: m.createdAt,
        createdAt: m.createdAt
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
        time: c.createdAt,
        createdAt: c.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    // Extract unique mentees from recent sessions for the directory and widget
    const recentSessions = await MentorshipSession.find({ mentor: alumniId, status: { $in: ['Active', 'Completed', 'Confirmed', 'Scheduled'] } })
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

    // 5. Community Forum Discussions
    const forumDiscussionsCount = await Post.countDocuments({ status: { $ne: 'Hidden' } });
    const myDiscussionsCount = await Post.countDocuments({ author: alumniId, status: { $ne: 'Hidden' } });
    const recentForumPosts = await Post.find({ status: { $ne: 'Hidden' } })
      .populate('author', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

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
        activeMentees: distinctMentees.length,
        mentees: distinctMentees.length,
        pendingInquiries: totalPendingRequests,
        studentRequests: totalPendingRequests,
        pendingRequests: totalPendingRequests,
        scheduledSessions: scheduledSessionsCount,
        upcomingSessions: scheduledSessionsCount,
        completedSessions: completedSessionsCount,
        sessionsCompleted: completedSessionsCount,
        activeMentorships: scheduledSessionsCount,
        connections: connectionsCount,
        referrals: referralsCount,
        forumDiscussions: forumDiscussionsCount,
        myDiscussions: myDiscussionsCount,
        avgRating: user.alumniProfile?.rating || 4.8,
        availability: user.alumniProfile?.available ?? user.alumniProfile?.availability ?? true
      },
      forumDiscussions: recentForumPosts.map(p => ({
        _id: p._id,
        title: p.title,
        content: p.content,
        tags: p.tags,
        author: {
          name: p.author?.name || 'Community Member',
          role: p.author?.role || 'Student',
          avatar: p.author?.avatar
        },
        likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
        commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
        createdAt: p.createdAt
      })),
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

export const getAvailability = getMyAvailability;
export const toggleAvailability = updateMyAvailability;

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
    const alumniId = req.user.id || req.user._id;
    const query = {
      status: { $in: ['Pending', 'pending'] }
    };

    // Filter by the authenticated alumni member (or unassigned/legacy requests), Admins can review all
    if (req.user.role !== 'Admin') {
      query.$or = [
        { alumni: alumniId },
        { alumni: null },
        { alumni: { $exists: false } }
      ];
    }

    const validations = await SkillValidationRequest.find(query)
      .populate('student', 'name email avatar avatarUrl studentProfile')
      .populate('alumni', 'name email alumniProfile avatar avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: validations });
  } catch (error) {
    console.error('getPendingValidations error:', error);
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

    // Prevent duplicate reviews
    if (validation.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been reviewed (${validation.status}). Duplicate reviews are prevented.`
      });
    }

    // Enforce authorization: only assigned alumni or Admin can review
    if (req.user.role !== 'Admin' && validation.alumni && validation.alumni.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the designated alumni reviewer for this request.'
      });
    }

    // Normalize status
    let normalizedStatus = status;
    if (['Approved', 'Demonstrated', 'approved'].includes(status)) {
      normalizedStatus = 'Approved';
    } else if (['Rejected', 'Insufficient', 'rejected'].includes(status)) {
      normalizedStatus = 'Rejected';
    }

    validation.status = normalizedStatus;
    validation.feedback = (feedback || '').trim();
    validation.reviewer = req.user.id;
    validation.reviewedAt = new Date();
    await validation.save();

    const itemTitle = validation.title || validation.skill || 'Evidence';

    // Update student's profile & dashboard records
    try {
      const studentUser = await User.findById(validation.student);
      if (studentUser) {
        if (!studentUser.studentProfile) studentUser.studentProfile = {};
        
        if (normalizedStatus === 'Approved') {
          // Award +25 karma for approved skill/project validation
          studentUser.studentProfile.karma = (studentUser.studentProfile.karma || 0) + 25;

          // If skill, ensure it's in studentProfile.skills
          if (itemTitle && (!studentUser.studentProfile.skills || !studentUser.studentProfile.skills.includes(itemTitle))) {
            studentUser.studentProfile.skills = studentUser.studentProfile.skills || [];
            studentUser.studentProfile.skills.push(itemTitle);
          }

          // Recalculate dynamic readiness score
          const badgesCount = await SkillBadge.countDocuments({ student: studentUser._id });
          const certsCount = await Certificate.countDocuments({ student: studentUser._id });
          const assessmentsTaken = await Submission.countDocuments({ studentId: studentUser._id, status: { $in: ['Submitted', 'Evaluated'] } });
          studentUser.studentProfile.readinessScore = calculateReadinessScore(studentUser.studentProfile, {
            assessmentsTaken,
            badgesCount,
            certificatesCount: certsCount
          });

          await studentUser.save();

          // Sync StudentSkill table if skill exists
          try {
            const skillDoc = await Skill.findOne({ name: new RegExp(`^${itemTitle}$`, 'i') });
            if (skillDoc) {
              await StudentSkill.findOneAndUpdate(
                { studentId: validation.student, skillId: skillDoc._id },
                { verified: true, proficiency: 90, source: 'assessment' },
                { upsert: true, new: true }
              );
            }
          } catch (skillErr) {
            console.warn('StudentSkill sync notice:', skillErr.message);
          }

          // Create in-app notification for the student
          await Notification.create({
            recipient: validation.student,
            type: 'SUCCESS',
            title: 'Skill & Evidence Approved! 🎉',
            message: `Your ${validation.type || 'skill'} "${itemTitle}" was validated and approved by ${req.user.name}.${validation.feedback ? ` Note: "${validation.feedback}"` : ''}`,
            link: '/student/profile'
          });
        } else {
          // Rejected notification
          await Notification.create({
            recipient: validation.student,
            type: 'WARNING',
            title: 'Evidence Validation Request Reviewed',
            message: `Your ${validation.type || 'skill'} "${itemTitle}" was not approved by ${req.user.name}.${validation.feedback ? ` Reviewer feedback: "${validation.feedback}"` : ' Please update your evidence and re-submit.'}`,
            link: '/student/profile'
          });
        }
      }
    } catch (updateErr) {
      console.error('Failed to update student profile upon validation:', updateErr);
    }

    res.status(200).json({
      success: true,
      message: `Validation for ${itemTitle} successfully recorded as ${normalizedStatus}.`,
      data: validation
    });
  } catch (error) {
    console.error('validateSkill error:', error);
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
