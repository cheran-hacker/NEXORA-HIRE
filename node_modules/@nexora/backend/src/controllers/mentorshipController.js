import { User } from '../models/User.js';
import { MentorAvailability } from '../models/MentorAvailability.js';
import { MentorshipRequest } from '../models/MentorshipRequest.js';
import { MentorshipSession } from '../models/MentorshipSession.js';
import { Notification } from '../models/Notification.js';
import { CareerTarget } from '../models/CareerTarget.js';
import { StudentSkill } from '../models/StudentSkill.js';
import { RoleSkillMap } from '../models/RoleSkillMap.js';

// Helper to get or create availability document for an alumni
const getOrCreateAvailability = async (alumniId) => {
  let availability = await MentorAvailability.findOne({ alumni: alumniId });
  if (!availability) {
    const user = await User.findById(alumniId);
    const profileSchedule = user?.alumniProfile?.schedule || {};
    const defaultSchedule = {
      monday: [{ start: "18:00", end: "20:00", enabled: true }],
      tuesday: [],
      wednesday: [{ start: "18:00", end: "20:00", enabled: true }],
      thursday: [],
      friday: [{ start: "18:00", end: "20:00", enabled: true }],
      saturday: [{ start: "10:00", end: "13:00", enabled: true }],
      sunday: []
    };

    availability = await MentorAvailability.create({
      alumni: alumniId,
      timezone: user?.alumniProfile?.timezone || 'Asia/Kolkata',
      isAvailable: user?.alumniProfile?.available ?? user?.alumniProfile?.availability ?? true,
      weeklySchedule: Object.keys(profileSchedule).length > 0 ? profileSchedule : defaultSchedule,
      sessionDuration: 30,
      bufferMinutes: 15,
      maxSessionsPerDay: 4,
      maxActiveMentees: user?.alumniProfile?.mentoringInterests?.maxActiveMentorships || 5,
      topics: user?.alumniProfile?.mentoringInterests?.topics?.length > 0 
        ? user.alumniProfile.mentoringInterests.topics 
        : ['Career Guidance', 'Resume Review', 'Mock Interview', 'Skill Gap Roadmapping', 'Technical System Design']
    });
  }
  return availability;
};

// ─── OVERVIEW METRICS (ALUMNI & STUDENT) ────────────────────────────────────
export const getMentorshipOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAlumni = req.user.role === 'Alumni';

    if (isAlumni) {
      const activeMentorshipsCount = await MentorshipSession.countDocuments({
        mentor: userId,
        status: { $in: ['Active', 'InProgress', 'Confirmed', 'Scheduled'] }
      });

      const pendingRequestsCount = await MentorshipRequest.countDocuments({
        alumni: userId,
        status: 'Pending'
      });

      const upcomingSessionsCount = await MentorshipSession.countDocuments({
        mentor: userId,
        status: { $in: ['Scheduled', 'Confirmed', 'Approved'] },
        $or: [
          { scheduledStart: { $gte: new Date() } },
          { scheduledDate: { $gte: new Date() } }
        ]
      });

      const completedSessionsCount = await MentorshipSession.countDocuments({
        mentor: userId,
        status: 'Completed'
      });

      const availability = await getOrCreateAvailability(userId);

      // Calculate distinct students mentored
      const distinctMentees = await MentorshipSession.distinct('mentee', {
        mentor: userId,
        status: { $in: ['Completed', 'Active', 'InProgress', 'Confirmed'] }
      });

      // Calculate approximate available weekly hours
      let weeklyMinutes = 0;
      if (availability.isAvailable && availability.weeklySchedule) {
        Object.values(availability.weeklySchedule).forEach(slots => {
          if (Array.isArray(slots)) {
            slots.forEach(slot => {
              if (slot.enabled !== false && slot.start && slot.end) {
                const [sH, sM] = slot.start.split(':').map(Number);
                const [eH, eM] = slot.end.split(':').map(Number);
                const diff = (eH * 60 + eM) - (sH * 60 + sM);
                if (diff > 0) weeklyMinutes += diff;
              }
            });
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          role: 'Alumni',
          kpis: {
            activeMentorships: activeMentorshipsCount,
            pendingRequests: pendingRequestsCount,
            upcomingSessions: upcomingSessionsCount,
            completedSessions: completedSessionsCount,
            availableHours: (weeklyMinutes / 60).toFixed(1),
            studentsMentored: distinctMentees.length
          },
          availability: {
            isAvailable: availability.isAvailable,
            timezone: availability.timezone,
            sessionDuration: availability.sessionDuration
          }
        }
      });
    } else {
      // Student view
      const activeMentorshipsCount = await MentorshipSession.countDocuments({
        mentee: userId,
        status: { $in: ['Active', 'InProgress', 'Confirmed', 'Scheduled'] }
      });

      const pendingRequestsCount = await MentorshipRequest.countDocuments({
        student: userId,
        status: 'Pending'
      });

      const upcomingSessionsCount = await MentorshipSession.countDocuments({
        mentee: userId,
        status: { $in: ['Scheduled', 'Confirmed', 'Approved'] },
        $or: [
          { scheduledStart: { $gte: new Date() } },
          { scheduledDate: { $gte: new Date() } }
        ]
      });

      const completedSessionsCount = await MentorshipSession.countDocuments({
        mentee: userId,
        status: 'Completed'
      });

      const distinctMentors = await MentorshipSession.distinct('mentor', {
        mentee: userId,
        status: { $in: ['Completed', 'Active', 'Confirmed'] }
      });

      return res.status(200).json({
        success: true,
        data: {
          role: 'Student',
          kpis: {
            activeMentors: distinctMentors.length,
            activeMentorships: activeMentorshipsCount,
            pendingRequests: pendingRequestsCount,
            upcomingSessions: upcomingSessionsCount,
            completedSessions: completedSessionsCount
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─── DISCOVER MENTORS ────────────────────────────────────────────────────────
export const getMentors = async (req, res, next) => {
  try {
    const alumniList = await User.find({
      role: { $regex: /^alumni$/i }
    })
      .select('name avatar avatarUrl email alumniProfile')
      .lean();

    const formattedMentors = await Promise.all(alumniList.map(async (alum) => {
      const profile = alum.alumniProfile || {};
      const availability = await MentorAvailability.findOne({ alumni: alum._id }).lean();
      
      const isAvailable = availability 
        ? availability.isAvailable 
        : (profile.available !== false && profile.availability !== false);

      const rating = profile.rating || 4.8;
      const completedSessions = profile.sessionsCompleted || 0;

      return {
        _id: alum._id,
        id: alum._id,
        name: alum.name,
        avatar: alum.avatarUrl || alum.avatar,
        image: alum.avatarUrl || alum.avatar,
        role: profile.designation || profile.currentRole || 'Industry Leader',
        company: profile.company || 'Tech Leader',
        industry: profile.industry || 'Technology',
        department: profile.department || 'Engineering',
        graduationYear: profile.graduationYear || '',
        experienceYears: profile.experienceYears || 3,
        bio: profile.bio || `Alumni mentor at ${profile.company || 'top organization'}, passionate about helping students crack technical roles.`,
        skills: profile.expertise?.length > 0 ? profile.expertise : (profile.skills || []),
        rating: typeof rating === 'number' ? rating.toFixed(1) : rating,
        sessionsCompleted: completedSessions,
        isAvailable,
        timezone: availability?.timezone || profile.timezone || 'Asia/Kolkata',
        sessionDuration: availability?.sessionDuration || 30,
        topics: availability?.topics || profile.mentoringInterests?.topics || [
          'Career Guidance', 'Resume Review', 'Mock Interview', 'Skill Gap Roadmapping'
        ]
      };
    }));

    res.status(200).json({ success: true, count: formattedMentors.length, data: formattedMentors });
  } catch (error) {
    next(error);
  }
};

// ─── INTELLIGENT MENTOR MATCHING ─────────────────────────────────────────────
export const getRecommendedMentors = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    // 1. Fetch Target Role
    const careerTargetDoc = await CareerTarget.findOne({ studentId });
    const targetRole = careerTargetDoc?.targetRole || student?.studentProfile?.targetCareerRole || student?.studentProfile?.preferredRoles || "";

    // 2. Fetch Student Skills
    const studentSkillDocs = await StudentSkill.find({ studentId }).populate('skillId');
    const studentSkillsArr = studentSkillDocs.length > 0
      ? studentSkillDocs.map(ss => ss.skillId?.name || '').filter(Boolean)
      : (student?.studentProfile?.skills || []);
    const studentSkills = Array.from(new Set(studentSkillsArr.map(s => String(s).toLowerCase().trim())));

    // 3. Fetch Skill Gaps
    let missingSkills = [];
    if (targetRole) {
      const roleMap = await RoleSkillMap.findOne({ roleName: new RegExp(`^${targetRole}$`, 'i') });
      if (roleMap && roleMap.requiredSkills) {
        roleMap.requiredSkills.forEach(reqSkill => {
          if (!studentSkills.includes(reqSkill.toLowerCase().trim())) {
            missingSkills.push(reqSkill.toLowerCase().trim());
          }
        });
      }
    }

    // 4. Fetch Alumni
    const alumniList = await User.find({ role: { $regex: /^alumni$/i } })
      .select('name avatar avatarUrl email alumniProfile')
      .lean();

    // 5. Existing requests / sessions
    const existingRequests = await MentorshipRequest.find({ student: studentId });
    const existingSessions = await MentorshipSession.find({ mentee: studentId });

    const recommendations = await Promise.all(alumniList.map(async (alum) => {
      const profile = alum.alumniProfile || {};
      const alumniRole = profile.designation || profile.currentRole || '';
      const alumniSkills = (profile.expertise || profile.skills || []).map(s => String(s).toLowerCase().trim());
      const availability = await MentorAvailability.findOne({ alumni: alum._id }).lean();

      let score = 55;
      let reasons = [];
      let matchedSkills = [];
      let skillGapMatches = [];

      // A. Target Role Alignment
      if (targetRole && alumniRole) {
        if (targetRole.toLowerCase() === alumniRole.toLowerCase()) {
          score += 30;
          reasons.push(`Direct alignment with your target role: ${targetRole}`);
        } else if (alumniRole.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(alumniRole.toLowerCase())) {
          score += 20;
          reasons.push(`Relevant domain experience as ${alumniRole}`);
        }
      } else {
        reasons.push(`Experienced leader at ${profile.company || 'prominent tech organization'}`);
      }

      // B. Skill Overlap
      alumniSkills.forEach(skill => {
        if (studentSkills.includes(skill)) {
          matchedSkills.push(skill);
          score += 5;
        }
      });
      if (matchedSkills.length > 0) {
        reasons.push(`Shares ${matchedSkills.length} key skill${matchedSkills.length > 1 ? 's' : ''}: ${matchedSkills.slice(0, 3).join(', ')}`);
      }

      // C. Skill Gap Match
      alumniSkills.forEach(skill => {
        if (missingSkills.includes(skill)) {
          skillGapMatches.push(skill);
          score += 10;
        }
      });
      if (skillGapMatches.length > 0) {
        reasons.push(`Can guide you through critical skill gap: ${skillGapMatches.slice(0, 2).join(', ')}`);
      }

      // D. Department Alignment
      if (student?.studentProfile?.department && profile.department && 
          student.studentProfile.department.toLowerCase() === profile.department.toLowerCase()) {
        score += 5;
        reasons.push(`Graduated from your department (${profile.department})`);
      }

      // Calculate reliable match score or indicate insufficient data
      let finalScore = null;
      let matchLabel = null;
      if (targetRole || studentSkills.length > 0) {
        finalScore = Math.min(98, Math.max(65, score));
      } else {
        matchLabel = 'Insufficient student career data for personalized scoring';
      }

      // Active request / session check
      const pendingReq = existingRequests.find(r => r.alumni.toString() === alum._id.toString() && r.status === 'Pending');
      const activeSess = existingSessions.find(s => s.mentor.toString() === alum._id.toString() && ['Scheduled', 'Confirmed', 'Active'].includes(s.status));

      const isAvailable = availability ? availability.isAvailable : (profile.available !== false);

      return {
        _id: alum._id,
        id: alum._id,
        name: alum.name,
        avatar: alum.avatarUrl || alum.avatar,
        role: profile.designation || profile.currentRole || 'Industry Leader',
        company: profile.company || 'Tech Firm',
        department: profile.department || '',
        graduationYear: profile.graduationYear || '',
        skills: profile.expertise?.length > 0 ? profile.expertise : (profile.skills || []),
        matchScore: finalScore,
        matchLabel: matchLabel || `${finalScore}% Career Match`,
        matchReasons: reasons.slice(0, 3),
        matchedSkills,
        relevantSkillGaps: skillGapMatches,
        isAvailable,
        pendingRequestId: pendingReq ? pendingReq._id : null,
        activeSessionId: activeSess ? activeSess._id : null,
        hasPendingRequest: !!pendingReq,
        hasActiveSession: !!activeSess
      };
    }));

    // Sort descending by matchScore
    recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
};

// ─── AVAILABILITY: GET MENTOR SCHEDULE & SLOTS ──────────────────────────────
export const getMentorAvailability = async (req, res, next) => {
  try {
    const { alumniId } = req.params;
    const { date } = req.query; // optional YYYY-MM-DD

    const mentor = await User.findById(alumniId);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    const availability = await getOrCreateAvailability(alumniId);

    // If a specific date is requested, compute concrete available slots
    let daySlots = [];
    let isBlocked = false;
    let blockedReason = '';

    if (date) {
      const targetDate = new Date(date);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = days[targetDate.getDay()];

      // Check exceptions / blocked dates
      const dateStr = targetDate.toISOString().split('T')[0];
      const exception = (availability.exceptions || []).find(e => {
        const exDateStr = new Date(e.date).toISOString().split('T')[0];
        return exDateStr === dateStr;
      });

      if (exception) {
        isBlocked = true;
        blockedReason = exception.reason || 'Mentor is unavailable on this date';
      } else {
        const rawWindows = (availability.weeklySchedule && availability.weeklySchedule[dayName]) || [];
        const sessionDuration = availability.sessionDuration || 30;
        const buffer = availability.bufferMinutes || 15;
        const step = sessionDuration + buffer;

        // Fetch existing bookings on this date
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedSessions = await MentorshipSession.find({
          mentor: alumniId,
          status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved'] },
          $or: [
            { scheduledStart: { $gte: startOfDay, $lte: endOfDay } },
            { scheduledDate: { $gte: startOfDay, $lte: endOfDay } }
          ]
        });

        // Also check approved requests that haven't expired
        const bookedRequests = await MentorshipRequest.find({
          alumni: alumniId,
          status: { $in: ['Accepted', 'Pending'] },
          requestedDate: { $gte: startOfDay, $lte: endOfDay }
        });

        rawWindows.forEach(window => {
          if (window.enabled !== false && window.start && window.end) {
            const [sH, sM] = window.start.split(':').map(Number);
            const [eH, eM] = window.end.split(':').map(Number);
            let currentMinutes = sH * 60 + sM;
            const windowEndMinutes = eH * 60 + eM;

            while (currentMinutes + sessionDuration <= windowEndMinutes) {
              const slotStartHour = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
              const slotStartMin = String(currentMinutes % 60).padStart(2, '0');
              const slotStartTime = `${slotStartHour}:${slotStartMin}`;

              const slotEndMinutes = currentMinutes + sessionDuration;
              const slotEndHour = String(Math.floor(slotEndMinutes / 60)).padStart(2, '0');
              const slotEndMin = String(slotEndMinutes % 60).padStart(2, '0');
              const slotEndTime = `${slotEndHour}:${slotEndMin}`;

              // Check if booked by session
              const isBookedBySession = bookedSessions.some(s => {
                const sDate = s.scheduledStart || s.scheduledDate;
                if (!sDate) return false;
                const d = new Date(sDate);
                const sTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                return sTime === slotStartTime;
              });

              // Check if booked by pending or accepted request
              const isBookedByRequest = bookedRequests.some(r => r.requestedStartTime === slotStartTime);

              const booked = isBookedBySession || isBookedByRequest;

              // Check if in the past for today
              const now = new Date();
              const isToday = now.toISOString().split('T')[0] === dateStr;
              let isPast = false;
              if (isToday) {
                const currentDayMinutes = now.getHours() * 60 + now.getMinutes();
                if (currentMinutes <= currentDayMinutes) {
                  isPast = true;
                }
              }

              daySlots.push({
                startTime: slotStartTime,
                endTime: slotEndTime,
                durationMinutes: sessionDuration,
                isAvailable: !booked && !isPast && availability.isAvailable,
                isBooked: booked,
                isPast
              });

              currentMinutes += step;
            }
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        alumniId,
        mentorName: mentor.name,
        timezone: availability.timezone,
        isAvailable: availability.isAvailable,
        sessionDuration: availability.sessionDuration,
        bufferMinutes: availability.bufferMinutes,
        weeklySchedule: availability.weeklySchedule,
        exceptions: availability.exceptions,
        topics: availability.topics,
        queryDate: date || null,
        isBlocked,
        blockedReason,
        slots: daySlots
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── AVAILABILITY: GET LOGGED-IN ALUMNI AVAILABILITY ────────────────────────
export const getMyAvailability = async (req, res, next) => {
  try {
    const availability = await getOrCreateAvailability(req.user.id);
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

// ─── AVAILABILITY: UPDATE LOGGED-IN ALUMNI AVAILABILITY ─────────────────────
export const updateMyAvailability = async (req, res, next) => {
  try {
    const alumniId = req.user.id;
    const {
      isAvailable,
      timezone,
      sessionDuration,
      bufferMinutes,
      maxSessionsPerDay,
      maxActiveMentees,
      weeklySchedule,
      exceptions,
      topics
    } = req.body;

    let availability = await MentorAvailability.findOne({ alumni: alumniId });
    if (!availability) {
      availability = new MentorAvailability({ alumni: alumniId });
    }

    if (typeof isAvailable === 'boolean') availability.isAvailable = isAvailable;
    if (timezone) availability.timezone = timezone;
    if (sessionDuration) availability.sessionDuration = sessionDuration;
    if (typeof bufferMinutes === 'number') availability.bufferMinutes = bufferMinutes;
    if (typeof maxSessionsPerDay === 'number') availability.maxSessionsPerDay = maxSessionsPerDay;
    if (typeof maxActiveMentees === 'number') availability.maxActiveMentees = maxActiveMentees;
    if (weeklySchedule) availability.weeklySchedule = weeklySchedule;
    if (exceptions) availability.exceptions = exceptions;
    if (topics) availability.topics = topics;

    await availability.save();

    // Sync with User.alumniProfile
    const user = await User.findById(alumniId);
    if (user) {
      if (!user.alumniProfile) user.alumniProfile = {};
      user.alumniProfile.available = availability.isAvailable;
      user.alumniProfile.availability = availability.isAvailable;
      user.alumniProfile.schedule = availability.weeklySchedule;
      user.alumniProfile.timezone = availability.timezone;
      if (!user.alumniProfile.mentoringInterests) user.alumniProfile.mentoringInterests = {};
      user.alumniProfile.mentoringInterests.maxActiveMentorships = availability.maxActiveMentees;
      user.alumniProfile.mentoringInterests.topics = availability.topics;
      user.markModified('alumniProfile');
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Mentorship availability updated and persisted successfully',
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

// ─── REQUEST MENTORSHIP (STUDENT) ───────────────────────────────────────────
export const createMentorshipRequest = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const {
      alumniId,
      mentorId,
      topic,
      careerGoal,
      targetRole,
      skillGaps,
      message,
      requestedDate,
      requestedStartTime,
      requestedEndTime,
      durationMinutes,
      timezone
    } = req.body;

    const targetAlumniId = alumniId || mentorId;
    if (!targetAlumniId) {
      return res.status(400).json({ success: false, message: 'Mentor ID is required' });
    }

    if (!topic || !requestedDate || !requestedStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Topic, requested date, and start time are required'
      });
    }

    // 1. Verify mentor existence
    const mentor = await User.findOne({ _id: targetAlumniId, role: { $regex: /^alumni$/i } });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Alumni mentor profile not found' });
    }

    const availability = await getOrCreateAvailability(targetAlumniId);
    if (!availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This mentor is currently not accepting new mentees.'
      });
    }

    // 2. Check maximum active mentees capacity
    const activeMenteesCount = await MentorshipSession.countDocuments({
      mentor: targetAlumniId,
      status: { $in: ['Active', 'InProgress', 'Scheduled', 'Confirmed'] }
    });
    if (activeMenteesCount >= (availability.maxActiveMentees || 5)) {
      return res.status(400).json({
        success: false,
        message: `Mentor has reached their active mentee capacity (${availability.maxActiveMentees}). Please check back soon.`
      });
    }

    // 3. Prevent duplicate pending requests
    const existingPending = await MentorshipRequest.findOne({
      student: studentId,
      alumni: targetAlumniId,
      status: 'Pending'
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending mentorship request with this mentor.'
      });
    }

    // 4. Double booking / Slot conflict validation
    const dateObj = new Date(requestedDate);
    const dateStr = dateObj.toISOString().split('T')[0];
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Check exceptions
    const isException = (availability.exceptions || []).some(e => {
      return new Date(e.date).toISOString().split('T')[0] === dateStr;
    });
    if (isException) {
      return res.status(400).json({
        success: false,
        message: 'The selected date is marked as unavailable by the mentor.'
      });
    }

    // Check existing confirmed sessions on that slot
    const conflictingSession = await MentorshipSession.findOne({
      mentor: targetAlumniId,
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved'] },
      $or: [
        { scheduledStart: { $gte: startOfDay, $lte: endOfDay } },
        { scheduledDate: { $gte: startOfDay, $lte: endOfDay } }
      ]
    });
    if (conflictingSession) {
      const sDate = conflictingSession.scheduledStart || conflictingSession.scheduledDate;
      if (sDate) {
        const d = new Date(sDate);
        const sTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        if (sTime === requestedStartTime) {
          return res.status(409).json({
            success: false,
            message: 'This time slot was just booked by another student. Please select another slot.'
          });
        }
      }
    }

    // Calculate endTime if not provided
    const dur = durationMinutes || availability.sessionDuration || 30;
    let endTime = requestedEndTime;
    if (!endTime && requestedStartTime) {
      const [h, m] = requestedStartTime.split(':').map(Number);
      const endTotal = h * 60 + m + dur;
      endTime = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
    }

    const request = await MentorshipRequest.create({
      student: studentId,
      alumni: targetAlumniId,
      topic,
      careerGoal: careerGoal || req.user.studentProfile?.targetCareerRole || 'Professional Growth',
      targetRole: targetRole || req.user.studentProfile?.targetCareerRole || '',
      skillGaps: skillGaps || [],
      message: message || `Hi ${mentor.name}, I would love 1-on-1 guidance on ${topic}.`,
      requestedDate: dateObj,
      requestedStartTime,
      requestedEndTime: endTime,
      durationMinutes: dur,
      timezone: timezone || availability.timezone || 'Asia/Kolkata',
      status: 'Pending'
    });

    // Notify Alumni
    try {
      await Notification.create({
        recipient: targetAlumniId,
        type: 'INFO',
        title: 'New Mentorship Request',
        message: `${req.user.name} requested a 1-on-1 mentorship session on "${topic}".`,
        link: '/alumni/mentorship'
      });
    } catch (notifErr) {
      console.warn('Notification creation error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Mentorship request sent to ${mentor.name} successfully!`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET MENTORSHIP REQUESTS (FOR ALUMNI OR STUDENT) ────────────────────────
export const getMentorshipRequests = async (req, res, next) => {
  try {
    const isAlumni = req.user.role === 'Alumni';
    const query = isAlumni ? { alumni: req.user.id } : { student: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const requests = await MentorshipRequest.find(query)
      .populate('student', 'name email avatar avatarUrl studentProfile')
      .populate('alumni', 'name email avatar avatarUrl alumniProfile')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// ─── ACCEPT MENTORSHIP REQUEST (ALUMNI) ──────────────────────────────────────
export const acceptMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alumniId = req.user.id;

    const request = await MentorshipRequest.findById(id).populate('student', 'name email');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found' });
    }

    if (request.alumni.toString() !== alumniId) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This request is already ${request.status.toLowerCase()}`
      });
    }

    // Build scheduled start and end timestamps
    const [sH, sM] = request.requestedStartTime.split(':').map(Number);
    const scheduledStart = new Date(request.requestedDate);
    scheduledStart.setHours(sH, sM, 0, 0);

    const scheduledEnd = new Date(scheduledStart.getTime() + (request.durationMinutes || 30) * 60000);

    // Double-booking check
    const existingConflict = await MentorshipSession.findOne({
      mentor: alumniId,
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved'] },
      $or: [
        { scheduledStart: { $lt: scheduledEnd, $gt: scheduledStart } },
        { scheduledStart: scheduledStart }
      ]
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'A session is already scheduled at this time. Please propose a reschedule.'
      });
    }

    // Create real MentorshipSession
    const session = await MentorshipSession.create({
      mentor: alumniId,
      mentee: request.student._id,
      requestId: request._id,
      scheduledDate: scheduledStart,
      scheduledStart: scheduledStart,
      scheduledEnd: scheduledEnd,
      durationMinutes: request.durationMinutes || 30,
      timezone: request.timezone || 'Asia/Kolkata',
      topic: request.topic,
      careerGoal: request.careerGoal,
      targetRole: request.targetRole,
      skillGaps: request.skillGaps,
      message: request.message,
      status: 'Confirmed',
      meetingProvider: 'InternalRoom',
      meetingLink: `/mentorship/session/PENDING_ID`,
      agenda: [request.topic],
      sharedNotes: '',
      privateMentorNotes: '',
      studentNotes: '',
      actionItems: []
    });

    // Update meeting room link with real generated sessionId
    session.meetingLink = `/mentorship/session/${session._id}`;
    await session.save();

    // Update Request status
    request.status = 'Accepted';
    request.respondedAt = new Date();
    request.sessionId = session._id;
    await request.save();

    // Notify Student
    try {
      await Notification.create({
        recipient: request.student._id,
        type: 'SUCCESS',
        title: 'Mentorship Request Accepted! 🎉',
        message: `${req.user.name} accepted your 1-on-1 mentorship session on "${request.topic}".`,
        link: `/mentorship/session/${session._id}`
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Mentorship request accepted and 1-on-1 session scheduled!',
      data: { request, session }
    });
  } catch (error) {
    next(error);
  }
};

// ─── REJECT MENTORSHIP REQUEST (ALUMNI) ──────────────────────────────────────
export const rejectMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const alumniId = req.user.id;

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found' });
    }

    if (request.alumni.toString() !== alumniId) {
      return res.status(403).json({ success: false, message: 'Not authorized to decline this request' });
    }

    request.status = 'Rejected';
    request.rejectionReason = reason || 'Mentor schedule conflict or capacity reached';
    request.respondedAt = new Date();
    await request.save();

    // Notify Student
    try {
      await Notification.create({
        recipient: request.student,
        type: 'WARNING',
        title: 'Mentorship Request Update',
        message: `${req.user.name} was unable to accept your request at this time: ${request.rejectionReason}`,
        link: '/student/mentorship'
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Mentorship request declined',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// ─── CANCEL MENTORSHIP REQUEST (STUDENT) ────────────────────────────────────
export const cancelMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found' });
    }

    if (request.student.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    request.status = 'Cancelled';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Mentorship request cancelled successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SESSIONS (UPCOMING, COMPLETED, ALL) ─────────────────────────────────
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAlumni = req.user.role === 'Alumni';

    const query = isAlumni ? { mentor: userId } : { mentee: userId };

    if (req.query.status) {
      if (req.query.status === 'upcoming') {
        query.status = { $in: ['Scheduled', 'Confirmed', 'Approved', 'Active', 'InProgress'] };
      } else if (req.query.status === 'completed') {
        query.status = 'Completed';
      } else {
        query.status = req.query.status;
      }
    }

    const sessions = await MentorshipSession.find(query)
      .populate('mentor', 'name avatar avatarUrl email alumniProfile')
      .populate('mentee', 'name avatar avatarUrl email studentProfile')
      .sort({ scheduledStart: 1, scheduledDate: 1 });

    // Format for ease of UI rendering
    const formatted = sessions.map(sess => {
      const sObj = sess.toObject();
      // Protect private mentor notes from student
      if (req.user.role === 'Student') {
        delete sObj.privateMentorNotes;
      }
      return {
        ...sObj,
        studentName: sess.mentee?.name || 'Student',
        mentorName: sess.mentor?.name || 'Mentor',
        dateFormatted: new Date(sess.scheduledStart || sess.scheduledDate).toLocaleDateString(),
        timeFormatted: new Date(sess.scheduledStart || sess.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};

// ─── GET SESSION BY ID (1-ON-1 ROOM) ─────────────────────────────────────────
export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id)
      .populate('mentor', 'name avatar avatarUrl email alumniProfile')
      .populate('mentee', 'name avatar avatarUrl email studentProfile');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Mentorship session not found' });
    }

    const isMentor = session.mentor._id.toString() === userId;
    const isMentee = session.mentee._id.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isMentor && !isMentee && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this session room' });
    }

    const sessionData = session.toObject();

    // STRICT SECURITY: privateMentorNotes is hidden from student
    if (!isMentor && !isAdmin) {
      delete sessionData.privateMentorNotes;
    }

    res.status(200).json({
      success: true,
      data: sessionData,
      roleInSession: isMentor ? 'Mentor' : 'Mentee'
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE SESSION STATUS (START, COMPLETE, CANCEL) ─────────────────────────
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason, meetingLink } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isMentor = session.mentor.toString() === userId;
    const isMentee = session.mentee.toString() === userId;

    if (!isMentor && !isMentee && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this session' });
    }

    if (status) {
      session.status = status;
      if (status === 'Completed') {
        session.completedAt = new Date();
        // Increment mentor's completed sessions count
        await User.findByIdAndUpdate(session.mentor, {
          $inc: { 'alumniProfile.sessionsCompleted': 1 }
        });
      }
      if (status === 'Cancelled') {
        session.cancelledAt = new Date();
        session.cancelledBy = userId;
        session.cancellationReason = cancellationReason || 'Session cancelled by participant';
      }
    }

    if (meetingLink) {
      session.meetingLink = meetingLink;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: `Session status updated to ${session.status}`,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE SESSION NOTES ───────────────────────────────────────────────────
export const updateSessionNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sharedNotes, privateMentorNotes, studentNotes } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isMentor = session.mentor.toString() === userId;
    const isMentee = session.mentee.toString() === userId;

    if (!isMentor && !isMentee && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (typeof sharedNotes === 'string') {
      session.sharedNotes = sharedNotes;
      session.notes = sharedNotes;
    }

    if (isMentor && typeof privateMentorNotes === 'string') {
      session.privateMentorNotes = privateMentorNotes;
    }

    if (isMentee && typeof studentNotes === 'string') {
      session.studentNotes = studentNotes;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session notes saved successfully',
      data: {
        sharedNotes: session.sharedNotes,
        studentNotes: session.studentNotes,
        privateMentorNotes: isMentor ? session.privateMentorNotes : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── ACTION ITEMS (ADD & UPDATE) ────────────────────────────────────────────
export const addActionItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.mentor.toString() !== userId && session.mentee.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.actionItems.push({
      title,
      description: description || '',
      assignedTo: assignedTo || 'Student',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'TODO'
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Action item created',
      data: session.actionItems
    });
  } catch (error) {
    next(error);
  }
};

export const updateActionItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const { status, title, dueDate } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const item = session.actionItems.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Action item not found' });
    }

    if (status) item.status = status;
    if (title) item.title = title;
    if (dueDate) item.dueDate = new Date(dueDate);

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Action item updated',
      data: session.actionItems
    });
  } catch (error) {
    next(error);
  }
};

// ─── SUBMIT FEEDBACK (STUDENT & MENTOR) ──────────────────────────────────────
export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review, mentorFeedback } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isMentor = session.mentor.toString() === userId;
    const isMentee = session.mentee.toString() === userId;

    if (!isMentor && !isMentee) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (isMentee) {
      if (typeof rating === 'number') session.rating = Math.max(1, Math.min(5, rating));
      if (review) session.review = review;
      session.status = 'Completed';
      session.completedAt = session.completedAt || new Date();
      await session.save();

      // Recalculate mentor's average rating in MongoDB
      const ratedSessions = await MentorshipSession.find({
        mentor: session.mentor,
        rating: { $exists: true, $ne: null }
      });
      if (ratedSessions.length > 0) {
        const sum = ratedSessions.reduce((acc, s) => acc + (s.rating || 0), 0);
        const avg = (sum / ratedSessions.length).toFixed(1);
        await User.findByIdAndUpdate(session.mentor, {
          'alumniProfile.rating': parseFloat(avg)
        });
      }
    }

    if (isMentor && mentorFeedback) {
      session.mentorFeedback = mentorFeedback;
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
};
