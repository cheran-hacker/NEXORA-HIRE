import { User } from '../models/User.js';
import { MentorAvailability } from '../models/MentorAvailability.js';
import { MentorshipRequest } from '../models/MentorshipRequest.js';
import { MentorshipSession } from '../models/MentorshipSession.js';
import { Notification } from '../models/Notification.js';
import { CareerTarget } from '../models/CareerTarget.js';
import { StudentSkill } from '../models/StudentSkill.js';
import { RoleSkillMap } from '../models/RoleSkillMap.js';

export const VALID_SCHEDULE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

export const normalizeSchedule = (rawSchedule = {}) => {
  const normalized = {};
  for (const day of VALID_SCHEDULE_DAYS) {
    const rawSlots = Array.isArray(rawSchedule[day]) ? rawSchedule[day] : [];
    normalized[day] = rawSlots.map((slot, idx) => ({
      id: slot.id || `${day}-slot-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      start: slot.start || "18:00",
      end: slot.end || "20:00",
      enabled: slot.enabled !== false,
      sessionType: slot.sessionType || '1:1 Mentorship',
      duration: Number(slot.duration) || 30,
      notes: slot.notes || ''
    }));
  }
  return normalized;
};

// Helper to get or create availability document for an alumni
const getOrCreateAvailability = async (alumniId) => {
  let availability = await MentorAvailability.findOne({ alumni: alumniId });
  if (!availability) {
    const user = await User.findById(alumniId);
    const profileSchedule = user?.alumniProfile?.schedule || {};
    const defaultSchedule = {
      monday: [{ id: `mon-1`, start: "18:00", end: "20:00", enabled: true, sessionType: '1:1 Mentorship', duration: 30, notes: '' }],
      tuesday: [],
      wednesday: [{ id: `wed-1`, start: "18:00", end: "20:00", enabled: true, sessionType: '1:1 Mentorship', duration: 30, notes: '' }],
      thursday: [],
      friday: [{ id: `fri-1`, start: "18:00", end: "20:00", enabled: true, sessionType: '1:1 Mentorship', duration: 30, notes: '' }],
      saturday: [{ id: `sat-1`, start: "10:00", end: "13:00", enabled: true, sessionType: '1:1 Mentorship', duration: 30, notes: '' }],
      sunday: []
    };

    const initialSchedule = Object.keys(profileSchedule).length > 0 ? profileSchedule : defaultSchedule;

    availability = await MentorAvailability.create({
      alumni: alumniId,
      timezone: user?.alumniProfile?.timezone || 'Asia/Kolkata',
      isAvailable: user?.alumniProfile?.available ?? user?.alumniProfile?.availability ?? true,
      weeklySchedule: normalizeSchedule(initialSchedule),
      sessionDuration: 30,
      bufferMinutes: 15,
      maxSessionsPerDay: 4,
      maxActiveMentees: user?.alumniProfile?.mentoringInterests?.maxActiveMentorships || 5,
      topics: user?.alumniProfile?.mentoringInterests?.topics?.length > 0 
        ? user.alumniProfile.mentoringInterests.topics 
        : ['Career Guidance', 'Resume Review', 'Mock Interview', 'Skill Gap Roadmapping', 'Technical System Design']
    });
  } else {
    // Ensure all 7 days exist and slots have IDs
    let modified = false;
    if (!availability.weeklySchedule) {
      availability.weeklySchedule = normalizeSchedule({});
      modified = true;
    } else {
      for (const day of VALID_SCHEDULE_DAYS) {
        if (!Array.isArray(availability.weeklySchedule[day])) {
          availability.weeklySchedule[day] = [];
          modified = true;
        } else {
          availability.weeklySchedule[day].forEach((slot, idx) => {
            if (!slot.id) {
              slot.id = `${day}-slot-${Date.now()}-${idx}`;
              modified = true;
            }
            if (!slot.sessionType) {
              slot.sessionType = '1:1 Mentorship';
              modified = true;
            }
            if (!slot.duration) {
              slot.duration = availability.sessionDuration || 30;
              modified = true;
            }
          });
        }
      }
    }
    if (modified) {
      availability.markModified('weeklySchedule');
      await availability.save();
    }
  }
  return availability;
};

// ─── OVERVIEW METRICS (ALUMNI & STUDENT) ────────────────────────────────────
export const getMentorshipOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAlumni = req.user.role === 'Alumni';

    if (isAlumni) {
      // 1. Active Mentees: Distinct students who have had or have active/confirmed/completed sessions
      const distinctMentees = await MentorshipSession.distinct('mentee', {
        mentor: userId,
        status: { $in: ['Completed', 'Active', 'InProgress', 'Confirmed', 'Scheduled', 'Rescheduled'] }
      });

      // 2. Pending Inquiries: Pending MentorshipRequests
      const pendingRequestsCount = await MentorshipRequest.countDocuments({
        alumni: userId,
        status: 'Pending'
      });

      // 3. Scheduled 1:1s: Active, confirmed, scheduled, or rescheduled sessions
      const scheduledSessionsCount = await MentorshipSession.countDocuments({
        mentor: userId,
        status: { $in: ['Scheduled', 'Confirmed', 'Approved', 'Active', 'InProgress', 'Rescheduled'] }
      });

      // 4. Completed Sessions: Sessions with status 'Completed'
      const completedSessionsCount = await MentorshipSession.countDocuments({
        mentor: userId,
        status: 'Completed'
      });

      const availability = await getOrCreateAvailability(userId);

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
            activeMentees: distinctMentees.length,
            activeMentorships: distinctMentees.length,
            pendingInquiries: pendingRequestsCount,
            pendingRequests: pendingRequestsCount,
            scheduledSessions: scheduledSessionsCount,
            upcomingSessions: scheduledSessionsCount,
            completedSessions: completedSessionsCount,
            sessionsCompleted: completedSessionsCount,
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
      const distinctMentors = await MentorshipSession.distinct('mentor', {
        mentee: userId,
        status: { $in: ['Completed', 'Active', 'Confirmed', 'Scheduled', 'Rescheduled'] }
      });

      const pendingRequestsCount = await MentorshipRequest.countDocuments({
        student: userId,
        status: 'Pending'
      });

      const scheduledSessionsCount = await MentorshipSession.countDocuments({
        mentee: userId,
        status: { $in: ['Scheduled', 'Confirmed', 'Approved', 'Active', 'InProgress', 'Rescheduled'] }
      });

      const completedSessionsCount = await MentorshipSession.countDocuments({
        mentee: userId,
        status: 'Completed'
      });

      return res.status(200).json({
        success: true,
        data: {
          role: 'Student',
          kpis: {
            activeMentors: distinctMentors.length,
            activeMentorships: scheduledSessionsCount,
            pendingInquiries: pendingRequestsCount,
            pendingRequests: pendingRequestsCount,
            scheduledSessions: scheduledSessionsCount,
            upcomingSessions: scheduledSessionsCount,
            completedSessions: completedSessionsCount,
            sessionsCompleted: completedSessionsCount
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

    // Helper function to generate concrete slots for a specific target date
    const generateSlotsForDate = async (targetDate) => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = days[targetDate.getDay()];
      const dateStr = targetDate.toISOString().split('T')[0];

      // Check exceptions / blocked dates
      const exception = (availability.exceptions || []).find(e => {
        const exDateStr = new Date(e.date).toISOString().split('T')[0];
        return exDateStr === dateStr;
      });

      if (exception) {
        return { isBlocked: true, blockedReason: exception.reason || 'Mentor is unavailable on this date', slots: [] };
      }

      const rawWindows = (availability.weeklySchedule && availability.weeklySchedule[dayName]) || [];
      const sessionDuration = availability.sessionDuration || 30;
      const buffer = availability.bufferMinutes || 15;
      const step = sessionDuration + buffer;

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

      const bookedRequests = await MentorshipRequest.find({
        alumni: alumniId,
        status: { $in: ['Accepted', 'Pending'] },
        requestedDate: { $gte: startOfDay, $lte: endOfDay }
      });

      const slots = [];
      const now = new Date();
      const isToday = now.toISOString().split('T')[0] === dateStr;
      const currentDayMinutes = now.getHours() * 60 + now.getMinutes();

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

            const isBookedBySession = bookedSessions.some(s => {
              const sDate = s.scheduledStart || s.scheduledDate;
              if (!sDate) return false;
              const d = new Date(sDate);
              const sTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              return sTime === slotStartTime;
            });

            const isBookedByRequest = bookedRequests.some(r => r.requestedStartTime === slotStartTime);
            const booked = isBookedBySession || isBookedByRequest;
            const isPast = isToday && currentMinutes <= currentDayMinutes;

            const dateFormatted = targetDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });

            slots.push({
              id: `${dateStr}_${slotStartTime}`,
              date: dateStr,
              dateFormatted,
              startTime: slotStartTime,
              endTime: slotEndTime,
              time: `${slotStartTime} - ${slotEndTime}`,
              sessionType: window.sessionType || '1:1 Mentorship',
              durationMinutes: sessionDuration,
              isAvailable: !booked && !isPast && availability.isAvailable,
              isBooked: booked,
              isPast
            });

            currentMinutes += step;
          }
        }
      });

      return { isBlocked: false, blockedReason: '', slots };
    };

    let daySlots = [];
    let isBlocked = false;
    let blockedReason = '';

    if (date) {
      const result = await generateSlotsForDate(new Date(date));
      daySlots = result.slots;
      isBlocked = result.isBlocked;
      blockedReason = result.blockedReason;
    }

    // Generate upcoming concrete available slots for the next 7 days
    const upcomingSlots = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const resDate = await generateSlotsForDate(d);
      if (!resDate.isBlocked) {
        resDate.slots.forEach(s => {
          if (s.isAvailable && upcomingSlots.length < 24) {
            upcomingSlots.push(s);
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
        slots: daySlots,
        upcomingSlots
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
      available, // backward-compatibility alias
      timezone,
      sessionDuration,
      bufferMinutes,
      maxSessionsPerDay,
      maxActiveMentees,
      weeklySchedule,
      schedule, // backward-compatibility alias
      exceptions,
      topics
    } = req.body;

    let availability = await MentorAvailability.findOne({ alumni: alumniId });
    if (!availability) {
      availability = new MentorAvailability({ alumni: alumniId });
    }

    const targetAvailable = typeof isAvailable === 'boolean' 
      ? isAvailable 
      : (typeof available === 'boolean' ? available : undefined);

    if (typeof targetAvailable === 'boolean') {
      availability.isAvailable = targetAvailable;
    }

    if (timezone && typeof timezone === 'string') availability.timezone = timezone.trim();
    if (sessionDuration && Number(sessionDuration) > 0) availability.sessionDuration = Number(sessionDuration);
    if (typeof bufferMinutes === 'number') availability.bufferMinutes = bufferMinutes;
    if (typeof maxSessionsPerDay === 'number') availability.maxSessionsPerDay = maxSessionsPerDay;
    if (typeof maxActiveMentees === 'number') availability.maxActiveMentees = maxActiveMentees;
    if (Array.isArray(exceptions)) availability.exceptions = exceptions;
    if (Array.isArray(topics)) availability.topics = topics;

    const rawSchedule = weeklySchedule || schedule;
    if (rawSchedule && typeof rawSchedule === 'object') {
      const validatedSchedule = {};

      for (const day of VALID_SCHEDULE_DAYS) {
        const slots = Array.isArray(rawSchedule[day]) ? rawSchedule[day] : [];
        const cleanDaySlots = [];

        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          if (!slot || !slot.start || !slot.end) {
            return res.status(400).json({
              success: false,
              message: `Slot #${i + 1} on ${day} is missing start or end time.`
            });
          }

          const startMins = parseTimeToMinutes(slot.start);
          const endMins = parseTimeToMinutes(slot.end);

          if (startMins === null || endMins === null) {
            return res.status(400).json({
              success: false,
              message: `Invalid time format "${slot.start}" - "${slot.end}" on ${day}. Use 24-hour HH:mm format.`
            });
          }

          if (endMins <= startMins) {
            return res.status(400).json({
              success: false,
              message: `End time (${slot.end}) must be strictly later than start time (${slot.start}) on ${day}.`
            });
          }

          const slotDuration = Number(slot.duration) || (endMins - startMins) || (availability.sessionDuration || 30);

          cleanDaySlots.push({
            id: slot.id || `${day}-slot-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            start: slot.start.trim(),
            end: slot.end.trim(),
            enabled: slot.enabled !== false,
            sessionType: slot.sessionType || '1:1 Mentorship',
            duration: slotDuration,
            notes: typeof slot.notes === 'string' ? slot.notes.trim() : ''
          });
        }

        // Validate non-overlapping slots among enabled slots on the same day
        const enabledSlots = cleanDaySlots
          .map((s, originalIndex) => ({
            ...s,
            originalIndex,
            startMins: parseTimeToMinutes(s.start),
            endMins: parseTimeToMinutes(s.end)
          }))
          .sort((a, b) => a.startMins - b.startMins);

        for (let j = 0; j < enabledSlots.length - 1; j++) {
          const current = enabledSlots[j];
          const next = enabledSlots[j + 1];

          // If both slots are enabled and next.start < current.end, that's an overlap!
          if (current.enabled && next.enabled && next.startMins < current.endMins) {
            return res.status(400).json({
              success: false,
              message: `Overlapping availability slots detected on ${day.toUpperCase()}: [${current.start} - ${current.end}] conflicts with [${next.start} - ${next.end}]. Please adjust times.`
            });
          }
        }

        validatedSchedule[day] = cleanDaySlots;
      }

      availability.weeklySchedule = validatedSchedule;
      availability.markModified('weeklySchedule');
    }

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
      data: availability,
      available: availability.isAvailable,
      schedule: availability.weeklySchedule
    });
  } catch (error) {
    next(error);
  }
};

// ─── REQUEST MENTORSHIP (STUDENT) ───────────────────────────────────────────
export const createMentorshipRequest = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    let {
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
      preferredDate,
      preferredSlot,
      date,
      time,
      slot,
      durationMinutes,
      timezone
    } = req.body;

    const targetAlumniId = alumniId || mentorId;
    if (!targetAlumniId) {
      return res.status(400).json({ success: false, message: 'Mentor ID is required' });
    }

    // Flexible topic fallback
    topic = (topic || message || '1-on-1 Mentorship & Career Guidance').trim();

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

    // Normalize date
    let rawDate = requestedDate || preferredDate || date;
    let dateObj;
    if (rawDate) {
      dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + 1);
      }
    } else {
      dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + 1);
    }

    // Helper: convert 12h AM/PM or time string to 24-hr HH:mm
    const convertTo24Hour = (tStr) => {
      if (!tStr || typeof tStr !== 'string') return '18:00';
      const clean = tStr.trim();
      const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${m}`;
      }
      return clean.length === 5 ? clean : '18:00';
    };

    // Normalize start & end time
    let rawTime = requestedStartTime || preferredSlot || slot || time || '18:00';
    if (typeof rawTime === 'string' && rawTime.includes('-')) {
      const parts = rawTime.split('-');
      rawTime = parts[0].trim();
      if (!requestedEndTime && parts[1]) {
        requestedEndTime = convertTo24Hour(parts[1].trim());
      }
    }
    requestedStartTime = convertTo24Hour(rawTime);

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

    if (request.alumni.toString() !== alumniId && req.user.role !== 'Admin') {
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

    const dur = request.durationMinutes || 30;
    let scheduledEnd;
    if (request.requestedEndTime) {
      const [eH, eM] = request.requestedEndTime.split(':').map(Number);
      scheduledEnd = new Date(request.requestedDate);
      scheduledEnd.setHours(eH, eM, 0, 0);
    } else {
      scheduledEnd = new Date(scheduledStart.getTime() + dur * 60000);
    }

    // Confirm date and time against alumnus's saved availability & blocked exceptions
    const availability = await MentorAvailability.findOne({ alumni: alumniId });
    if (availability) {
      const dateStr = scheduledStart.toISOString().split('T')[0];
      const isBlocked = (availability.exceptions || []).some(e => {
        return new Date(e.date).toISOString().split('T')[0] === dateStr && (e.type === 'UNAVAILABLE' || !e.type);
      });
      if (isBlocked) {
        return res.status(400).json({
          success: false,
          message: 'The requested date is marked as unavailable in your calendar exceptions. Please reschedule.'
        });
      }
    }

    // Double-booking check: strict interval overlap check [S1 < E2 && E1 > S2]
    const existingConflict = await MentorshipSession.findOne({
      mentor: alumniId,
      _id: { $ne: request.sessionId },
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved', 'InProgress', 'Rescheduled'] },
      scheduledStart: { $lt: scheduledEnd },
      scheduledEnd: { $gt: scheduledStart }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'A session is already scheduled during this overlapping time. Please propose a reschedule.'
      });
    }

    // Check student conflict
    const studentConflict = await MentorshipSession.findOne({
      mentee: request.student._id,
      _id: { $ne: request.sessionId },
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved', 'InProgress', 'Rescheduled'] },
      scheduledStart: { $lt: scheduledEnd },
      scheduledEnd: { $gt: scheduledStart }
    });
    if (studentConflict) {
      return res.status(409).json({
        success: false,
        message: 'The student already has another conflicting session scheduled during this time window.'
      });
    }

    // Prevent duplicate session records: reuse existing linked session if available
    let session = null;
    if (request.sessionId) {
      session = await MentorshipSession.findById(request.sessionId);
    }

    if (!session) {
      session = await MentorshipSession.create({
        mentor: alumniId,
        mentee: request.student._id,
        requestId: request._id,
        scheduledDate: scheduledStart,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
        durationMinutes: dur,
        timezone: request.timezone || availability?.timezone || 'Asia/Kolkata',
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
      session.meetingLink = `/mentorship/session/${session._id}`;
      await session.save();
    } else {
      session.status = 'Confirmed';
      session.scheduledDate = scheduledStart;
      session.scheduledStart = scheduledStart;
      session.scheduledEnd = scheduledEnd;
      session.durationMinutes = dur;
      session.topic = request.topic;
      session.meetingLink = `/mentorship/session/${session._id}`;
      await session.save();
    }

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

    if (request.alumni.toString() !== alumniId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to decline this request' });
    }

    request.status = 'Rejected';
    request.rejectionReason = reason || 'Mentor schedule conflict or capacity reached';
    request.respondedAt = new Date();
    await request.save();

    // If session was pre-created, mark it cancelled
    if (request.sessionId) {
      await MentorshipSession.findByIdAndUpdate(request.sessionId, {
        status: 'Cancelled',
        cancelledAt: new Date(),
        cancellationReason: request.rejectionReason
      });
    }

    // Notify Student
    try {
      await Notification.create({
        recipient: request.student,
        type: 'WARNING',
        title: 'Mentorship Request Update',
        message: `${req.user.name} was unable to accept your request at this time: ${request.rejectionReason}`,
        link: '/student/mentorship-sessions'
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

// ─── CANCEL MENTORSHIP REQUEST (STUDENT OR ALUMNI) ───────────────────────────
export const cancelMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found' });
    }

    const isStudent = request.student.toString() === userId;
    const isAlumni = request.alumni.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isStudent && !isAlumni && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    request.status = 'Cancelled';
    request.respondedAt = new Date();
    await request.save();

    // If linked to a session, cancel the session too
    if (request.sessionId) {
      await MentorshipSession.findByIdAndUpdate(request.sessionId, {
        status: 'Cancelled',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: 'Cancelled via mentorship request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mentorship request cancelled successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// ─── RESCHEDULE SESSION ─────────────────────────────────────────────────────
export const rescheduleSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, newEndTime, durationMinutes, reason } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isMentor = session.mentor.toString() === userId;
    const isMentee = session.mentee.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isMentor && !isMentee && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this session' });
    }

    if (!newDate || !newStartTime) {
      return res.status(400).json({ success: false, message: 'Please provide new date and start time' });
    }

    const [sH, sM] = newStartTime.split(':').map(Number);
    const scheduledStart = new Date(newDate);
    scheduledStart.setHours(sH, sM, 0, 0);

    const dur = Number(durationMinutes) || session.durationMinutes || 30;
    let scheduledEnd;
    if (newEndTime) {
      const [eH, eM] = newEndTime.split(':').map(Number);
      scheduledEnd = new Date(newDate);
      scheduledEnd.setHours(eH, eM, 0, 0);
    } else {
      scheduledEnd = new Date(scheduledStart.getTime() + dur * 60000);
    }

    // Verify mentor exceptions
    const availability = await MentorAvailability.findOne({ alumni: session.mentor });
    if (availability) {
      const dateStr = scheduledStart.toISOString().split('T')[0];
      const isBlocked = (availability.exceptions || []).some(e => {
        return new Date(e.date).toISOString().split('T')[0] === dateStr && (e.type === 'UNAVAILABLE' || !e.type);
      });
      if (isBlocked) {
        return res.status(400).json({
          success: false,
          message: 'The selected reschedule date is blocked on the mentor availability calendar.'
        });
      }
    }

    // Overlap conflict check for mentor
    const conflict = await MentorshipSession.findOne({
      mentor: session.mentor,
      _id: { $ne: session._id },
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved', 'InProgress', 'Rescheduled'] },
      scheduledStart: { $lt: scheduledEnd },
      scheduledEnd: { $gt: scheduledStart }
    });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'The mentor already has another session booked in this overlapping time window.'
      });
    }

    // Overlap conflict check for mentee
    const menteeConflict = await MentorshipSession.findOne({
      mentee: session.mentee,
      _id: { $ne: session._id },
      status: { $in: ['Scheduled', 'Confirmed', 'Active', 'Approved', 'InProgress', 'Rescheduled'] },
      scheduledStart: { $lt: scheduledEnd },
      scheduledEnd: { $gt: scheduledStart }
    });
    if (menteeConflict) {
      return res.status(409).json({
        success: false,
        message: 'The student already has another session booked in this overlapping time window.'
      });
    }

    session.scheduledDate = scheduledStart;
    session.scheduledStart = scheduledStart;
    session.scheduledEnd = scheduledEnd;
    session.durationMinutes = dur;
    session.status = 'Rescheduled';
    await session.save();

    // If linked to MentorshipRequest, synchronize it
    if (session.requestId) {
      await MentorshipRequest.findByIdAndUpdate(session.requestId, {
        requestedDate: scheduledStart,
        requestedStartTime: newStartTime,
        requestedEndTime: newEndTime || `${String(scheduledEnd.getHours()).padStart(2, '0')}:${String(scheduledEnd.getMinutes()).padStart(2, '0')}`,
        durationMinutes: dur
      });
    }

    // Notify the other party
    const targetUserId = isMentor ? session.mentee : session.mentor;
    try {
      await Notification.create({
        recipient: targetUserId,
        type: 'INFO',
        title: 'Mentorship Session Rescheduled',
        message: `${req.user.name} rescheduled your session on "${session.topic}" to ${scheduledStart.toLocaleDateString()} at ${newStartTime}.${reason ? ` Reason: ${reason}` : ''}`,
        link: `/mentorship/session/${session._id}`
      });
    } catch (ne) {
      console.warn('Notification error on reschedule:', ne.message);
    }

    res.status(200).json({
      success: true,
      message: 'Session rescheduled successfully',
      data: session
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
        query.status = { $in: ['Scheduled', 'Confirmed', 'Approved', 'Active', 'InProgress', 'Rescheduled'] };
      } else if (req.query.status === 'completed') {
        query.status = 'Completed';
      } else if (req.query.status === 'cancelled') {
        query.status = { $in: ['Cancelled', 'Rejected'] };
      } else {
        query.status = req.query.status;
      }
    }

    const sessions = await MentorshipSession.find(query)
      .populate('mentor', 'name avatar avatarUrl email alumniProfile')
      .populate('mentee', 'name avatar avatarUrl email studentProfile')
      .populate('requestId')
      .sort({ scheduledStart: 1, scheduledDate: 1, createdAt: -1 });

    // Format for ease of UI rendering
    const formatted = sessions.map(sess => {
      const sObj = sess.toObject();
      // Protect private mentor notes from student
      if (req.user.role === 'Student') {
        delete sObj.privateMentorNotes;
      }

      const sDate = sess.scheduledStart || sess.scheduledDate || sess.createdAt;
      const validDate = sDate ? new Date(sDate) : new Date();
      const isValid = !isNaN(validDate.getTime());

      const eDate = sess.scheduledEnd ? new Date(sess.scheduledEnd) : (isValid ? new Date(validDate.getTime() + (sess.durationMinutes || 30) * 60000) : null);
      const isEndValid = eDate && !isNaN(eDate.getTime());

      const dateFormatted = isValid ? validDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible';
      const startTime = isValid ? validDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '10:00 AM';
      const endTime = isEndValid ? eDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '10:30 AM';

      return {
        ...sObj,
        studentName: sess.mentee?.name || 'Student',
        mentorName: sess.mentor?.name || 'Mentor',
        dateFormatted,
        scheduledDateFormatted: dateFormatted,
        startTime,
        endTime,
        timeFormatted: `${startTime} - ${endTime}`,
        durationMinutes: sess.durationMinutes || 30
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
    const userRole = (req.user.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';
    const isPlacement = userRole === 'placement';

    if (!isMentor && !isMentee && !isAdmin && !isPlacement) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this session room' });
    }

    const sessionData = session.toObject();

    // STRICT SECURITY: privateMentorNotes is hidden from student
    if (!isMentor && !isAdmin && !isPlacement) {
      delete sessionData.privateMentorNotes;
    }

    res.status(200).json({
      success: true,
      data: sessionData,
      roleInSession: isMentor ? 'Mentor' : (isMentee ? 'Mentee' : (isPlacement ? 'Placement' : 'Admin'))
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE SESSION STATUS (START, COMPLETE, CANCEL) ─────────────────────────
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason, meetingLink, mentorFeedback } = req.body;
    const userId = req.user.id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isMentor = session.mentor.toString() === userId;
    const isMentee = session.mentee.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isMentor && !isMentee && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this session' });
    }

    if (status) {
      if (status === 'Completed') {
        // Enforce RBAC: only mentor or admin can mark completed
        if (!isMentor && !isAdmin) {
          return res.status(403).json({ success: false, message: 'Only the alumni mentor can mark a session as completed' });
        }
        session.status = 'Completed';
        session.completedAt = new Date();
        if (mentorFeedback) {
          session.mentorFeedback = mentorFeedback;
        }
        // Increment mentor's completed sessions count
        await User.findByIdAndUpdate(session.mentor, {
          $inc: { 'alumniProfile.sessionsCompleted': 1 }
        });

        // Notify mentee to leave review & rating
        try {
          await Notification.create({
            recipient: session.mentee,
            type: 'SUCCESS',
            title: 'Mentorship Session Completed! 🎉',
            message: `Your 1-on-1 session on "${session.topic}" has been marked as completed. Please take a moment to leave a review.`,
            link: '/student/mentorship-sessions'
          });
        } catch (ne) {
          console.warn('Notification error on completion:', ne.message);
        }
      } else if (status === 'Cancelled') {
        session.status = 'Cancelled';
        session.cancelledAt = new Date();
        session.cancelledBy = userId;
        session.cancellationReason = cancellationReason || 'Session cancelled by participant';

        // Synchronize linked request if present
        if (session.requestId) {
          await MentorshipRequest.findByIdAndUpdate(session.requestId, {
            status: 'Cancelled'
          });
        }

        // Notify other party
        const notifyTarget = isMentor ? session.mentee : session.mentor;
        try {
          await Notification.create({
            recipient: notifyTarget,
            type: 'WARNING',
            title: 'Mentorship Session Cancelled',
            message: `${req.user.name} cancelled the session on "${session.topic}". Reason: ${session.cancellationReason}`,
            link: isMentor ? '/student/mentorship-sessions' : '/alumni/sessions'
          });
        } catch (ne) {
          console.warn('Notification error on cancellation:', ne.message);
        }
      } else {
        session.status = status;
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
