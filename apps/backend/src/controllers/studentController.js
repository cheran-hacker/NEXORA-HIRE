import { Application } from '../models/Application.js';
import { Assessment } from '../models/Assessment.js';
import { Job } from '../models/Job.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { PortfolioRule } from '../models/PortfolioRule.js';
import { MentorshipSession } from '../models/MentorshipSession.js';
import { Notification } from '../models/Notification.js';
import { SkillBadge } from '../models/SkillBadge.js';
import { Certificate } from '../models/Certificate.js';
import { RoleSkillMap } from '../models/RoleSkillMap.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { GeoEvent } from '../models/GeoEvent.js';
import { Skill } from '../models/Skill.js';
import { StudentSkill } from '../models/StudentSkill.js';
import { CareerTarget } from '../models/CareerTarget.js';
import { SavedJob } from '../models/SavedJob.js';
import { calculateReadinessScore } from '../utils/readinessEngine.js';
import { geminiService } from '../services/geminiService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentProfile = req.user.studentProfile || {};
    
    // Fetch normalized skills, fallback to old array if migrating
    const studentSkillDocs = await StudentSkill.find({ studentId: studentId }).populate('skillId');
    const userSkills = studentSkillDocs.length > 0 
      ? studentSkillDocs.map(ss => ss.skillId?.name || '').filter(Boolean)
      : (studentProfile.skills || []);

    // Fetch normalized career target
    const careerTargetDoc = await CareerTarget.findOne({ studentId: studentId });
    const targetRole = careerTargetDoc?.targetRole || studentProfile.targetCareerRole || '';

    
    // 1. Fetch real base data
    const applications = await Application.find({ studentId: studentId }).populate('jobId', 'title company location type skills');
    const assessmentsTaken = await Submission.countDocuments({ studentId: studentId, status: { $in: ['Submitted', 'Evaluated'] } });
    const recentJobs = await Job.find({ status: 'Open' })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title company location type salary skills');
      
    const badges = await SkillBadge.find({ student: studentId });
    const certificates = await Certificate.find({ student: studentId });

    // 2. Aggregate 4-Line Weekly Performance
    const activityLabels = [];
    const assessmentsPerf = [];
    const applicationsPerf = [];
    const interviewsPerf = [];
    const learningPerf = [];
    
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      
      activityLabels.push(days[d.getDay()]); // Mon, Tue...
      
      const subCount = await Submission.countDocuments({ studentId: studentId, createdAt: { $gte: startOfDay, $lte: endOfDay } });
      const appCount = await Application.countDocuments({ studentId: studentId, createdAt: { $gte: startOfDay, $lte: endOfDay } });
      const intCount = await Application.countDocuments({ studentId: studentId, status: 'Interview', updatedAt: { $gte: startOfDay, $lte: endOfDay } });
      
      const badgeCount = badges.filter(b => b.createdAt >= startOfDay && b.createdAt <= endOfDay).length;
      const certCount = certificates.filter(c => c.createdAt >= startOfDay && c.createdAt <= endOfDay).length;
      
      assessmentsPerf.push(subCount);
      applicationsPerf.push(appCount);
      interviewsPerf.push(intCount);
      learningPerf.push(badgeCount + certCount);
    }

    // 3. AI Skill Gap Algorithm
    let aiSkillGap = [];
    let overallMatch = 0;
    
    // targetRole is already fetched from CareerTarget or fallback

    let topRequiredSkills = [];
    
    if (targetRole) {
      const roleMap = await RoleSkillMap.findOne({ roleName: new RegExp(`^${targetRole}$`, 'i') });
      if (roleMap && roleMap.requiredSkills) {
        topRequiredSkills = roleMap.requiredSkills.slice(0, 5);
      }
    }
    
    // Fallback if no target role mapped
    if (topRequiredSkills.length === 0) {
      const skillFrequencies = {};
      recentJobs.forEach(job => {
        (job.skills || []).forEach(skill => {
          skillFrequencies[skill] = (skillFrequencies[skill] || 0) + 1;
        });
      });
      topRequiredSkills = Object.entries(skillFrequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    }
      
    if (topRequiredSkills.length > 0) {
      let totalMatch = 0;
      aiSkillGap = topRequiredSkills.map((reqSkill, idx) => {
        const hasSkill = userSkills.some(s => s.toLowerCase() === reqSkill.toLowerCase());
        const userLvl = hasSkill ? 100 : 0;
        const requiredLvl = 100; // Expected to have the skill
        
        totalMatch += (userLvl / requiredLvl);
        
        return {
          skill: reqSkill,
          yourLevel: userLvl,
          requiredLevel: requiredLvl,
          gap: requiredLvl - userLvl,
          recommendation: hasSkill ? 'Keep practicing' : `Learn ${reqSkill} concepts`
        };
      });
      overallMatch = Math.round((totalMatch / topRequiredSkills.length) * 100);
    }

    // 4. Formatting Upcoming & Recent Data
    const upcomingAssessments = await Assessment.find({ createdAt: { $lte: new Date() } }).limit(3).select('title duration createdAt');
    const interviews = applications.filter(app => app.status === 'Interview');
    
    const recentSubmissions = await Submission.find({ studentId: studentId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('assessmentId', 'title type');

    const combinedActivity = [
      ...applications.slice(0, 3).map(app => ({ action: `Applied to ${app.jobId?.company || 'a company'}`, time: app.createdAt, color: 'primary' })),
      ...recentSubmissions.map(sub => ({ action: `Completed ${sub.assessmentId?.title || 'Assessment'}`, time: sub.createdAt, color: 'success' }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    const formattedTimeline = combinedActivity.map(act => {
      const diff = Math.floor((new Date() - new Date(act.time)) / (1000 * 60 * 60));
      return { ...act, time: diff < 24 ? `${diff} hours ago` : `${Math.floor(diff/24)} days ago` };
    });

    // 5. Recommended Jobs Algorithm (Real Match)
    const recommendedJobs = recentJobs.slice(0, 5).map(job => {
      const jobSkills = job.skills || [];
      const matchCount = jobSkills.filter(js => userSkills.some(us => us.toLowerCase() === js.toLowerCase())).length;
      const matchPct = jobSkills.length > 0 ? Math.round((matchCount / jobSkills.length) * 100) : 0; // Use 0 instead of fake 75
      return {
        id: job._id,
        title: job.title,
        company: job.company,
        match: matchPct
      };
    }).sort((a, b) => b.match - a.match);

    const dynamicScore = calculateReadinessScore(studentProfile, {
      assessmentsTaken,
      badgesCount: badges.length,
      certificatesCount: certificates.length
    });

    // Update the readinessScore dynamically
    if (req.user.studentProfile) {
      req.user.studentProfile.readinessScore = dynamicScore;
      await req.user.save();
    }

    // Fetch Events
    const upcomingEvents = await GeoEvent.find({ isActive: true }).limit(3).select('title endTime');

    res.json({
      kpis: {
        applicationsSent: applications.length,
        assessmentsTaken: assessmentsTaken,
        profileScore: dynamicScore,
        interviewsScheduled: interviews.length,
        activeApplications: applications.filter(a => ['Applied', 'Shortlisted'].includes(a.status)).length
      },
      profileSummary: {
        name: req.user.name,
        role: req.user.role || "Student",
        regNo: studentProfile.regNo || "Not Set",
        branch: studentProfile.branch || "Not Set",
        batchYear: studentProfile.batchYear || "",
        readiness: dynamicScore,
        resumeScore: studentProfile.resumeScore || 0,
        aiSkillGap: aiSkillGap,
        skillMatch: overallMatch || 0
      },
      upcomingAssessments: upcomingAssessments.map(a => ({ title: a.title, duration: a.duration || 60, date: a.createdAt })),
      upcomingInterviews: interviews.map(i => ({ company: i.jobId?.company, role: i.jobId?.title, type: 'Technical', date: i.updatedAt })),
      events: upcomingEvents.map(e => ({ title: e.title, date: e.endTime })),
      recentActivityTimeline: formattedTimeline,
      skillsProgress: userSkills.slice(0, 4).map((skill, index) => ({
        name: skill,
        level: 80 + Math.floor(Math.random() * 20),
        color: ['primary', 'success', 'warning', 'info'][index % 4]
      })),
      weeklyPerformance: {
        labels: activityLabels,
        assessments: assessmentsPerf,
        applications: applicationsPerf,
        interviews: interviewsPerf,
        learning: learningPerf
      },
      recentApplications: applications.slice(0, 5).map(app => ({
        id: app._id,
        role: app.jobId?.title || 'Unknown Role',
        company: app.jobId?.company || 'Unknown Company',
        status: app.status,
        date: app.createdAt
      })),
      recommendedJobs: recommendedJobs
    });
  } catch (error) {
    console.error('Student Stats Error:', error);
    res.status(500).json({ message: 'Server error saving settings' });
  }
};

export const getMatchedAlumniNetwork = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Fetch Target Role
    const careerTargetDoc = await CareerTarget.findOne({ studentId });
    const targetRole = careerTargetDoc?.targetRole || student.studentProfile?.targetCareerRole || student.studentProfile?.preferredRoles || "";

    // 2. Fetch Student Skills
    const studentSkillDocs = await StudentSkill.find({ studentId }).populate('skillId');
    const studentSkillsArr = studentSkillDocs.length > 0 
      ? studentSkillDocs.map(ss => ss.skillId?.name || '').filter(Boolean)
      : (student.studentProfile?.skills || []);
    const studentSkills = Array.from(new Set(studentSkillsArr.map(s => s.toLowerCase().trim())));

    // 3. Fetch Skill Gaps (Career Digital Twin integration)
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

    // 4. Fetch Active Alumni
    const alumniList = await User.find({ role: 'Alumni', status: 'Active' })
      .select('-password -resetPasswordToken -resetPasswordExpire -twoFactorSecret')
      .lean();

    // Fetch existing connections to filter them or mark them
    const { AlumniConnection } = await import('../models/AlumniConnection.js');
    const existingConnections = await AlumniConnection.find({ student: studentId });
    const connectedAlumniIds = new Set(existingConnections.map(c => c.alumni.toString()));

    // 5. Match and Rank
    const recommendations = alumniList.map(alumni => {
      const profile = alumni.alumniProfile || {};
      const alumniRole = profile.designation || '';
      const alumniSkills = (profile.expertise || []).map(s => s.toLowerCase().trim());
      
      let score = 0;
      let reasons = [];
      let matchedSkills = [];
      let skillGapMatches = [];

      // A. Target Role Similarity (Exact or partial match)
      if (targetRole && alumniRole) {
        if (targetRole.toLowerCase() === alumniRole.toLowerCase()) {
          score += 40;
          reasons.push(`✓ Matches your target role (${targetRole}) directly`);
        } else if (alumniRole.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(alumniRole.toLowerCase())) {
          score += 25;
          reasons.push(`✓ Role is highly relevant to your target (${alumniRole})`);
        }
      }

      // B. Skill Overlap
      alumniSkills.forEach(skill => {
        if (studentSkills.includes(skill)) {
          matchedSkills.push(skill);
          score += 5; // +5 per matched skill
        }
      });
      if (matchedSkills.length > 0) {
        score = Math.min(score, score + 25); // Cap skill overlap score
        reasons.push(`✓ Shares ${matchedSkills.length} skills with your resume`);
      }

      // C. Skill Gap Relevance
      alumniSkills.forEach(skill => {
        if (missingSkills.includes(skill)) {
          skillGapMatches.push(skill);
          score += 15; // +15 per missing skill mentor has
        }
      });
      if (skillGapMatches.length > 0) {
        reasons.push(`✓ Can guide you on identified skill gaps (${skillGapMatches.join(', ')})`);
      }

      // D. Mentoring Relevance
      if (profile.contributionPreferences?.mentorship) {
        score += 10;
        reasons.push(`✓ Open to mentorship`);
      }
      
      // Connection Status
      const existingConn = existingConnections.find(c => c.alumni.toString() === alumni._id.toString());
      const connectionStatus = existingConn ? existingConn.status : null;

      // Normalize Score (Cap at 99 for realism)
      const finalScore = Math.min(99, Math.max(10, score));

      return {
        ...alumni,
        matchScore: finalScore,
        matchReasons: reasons,
        matchedSkills,
        relevantSkillGaps: skillGapMatches,
        connectionStatus
      };
    });

    // 6. Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Give intelligent labels to top matches
    if (recommendations.length > 0 && recommendations[0].matchScore >= 70) {
      recommendations[0].recommendationLabel = "Best Career Match";
    }
    
    // Find highest skill gap mentor
    const bestGapMentorIdx = recommendations.findIndex(r => r.relevantSkillGaps.length > 0 && !r.recommendationLabel);
    if (bestGapMentorIdx > -1) {
      recommendations[bestGapMentorIdx].recommendationLabel = "Skill Gap Mentor";
    }

    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    console.error('Alumni Matching Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const requestConnection = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { alumniId, message } = req.body;

    const { AlumniConnection } = await import('../models/AlumniConnection.js');
    
    // Check if already requested
    const existing = await AlumniConnection.findOne({ student: studentId, alumni: alumniId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Connection request already sent' });
    }

    const connection = await AlumniConnection.create({
      student: studentId,
      alumni: alumniId,
      message,
      status: 'Pending'
    });

    // Optionally create a notification here if Notification model is used
    try {
      if (Notification) {
        await Notification.create({
          user: alumniId,
          type: 'ConnectionRequest',
          title: 'New Connection Request',
          message: `${req.user.name} wants to connect with you.`,
          relatedId: connection._id
        });
      }
    } catch (e) {
      console.log('Notification skip', e.message);
    }

    res.status(201).json({ success: true, data: connection, message: 'Connection request sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCareerDigitalTwin = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile || {};
    const userSkills = studentProfile.skills || [];
    const targetRoleName = studentProfile.preferredRoles || '';

    // If no target role is set
    if (!targetRoleName) {
      return res.status(200).json({
        success: true,
        data: {
          targetRole: 'Not Set',
          matchPercentage: 0,
          existingSkills: userSkills,
          missingSkills: [],
          recommendations: ['Please set your Target Role in Settings to see your Digital Twin gap analysis.']
        }
      });
    }

    // Attempt to find the mapping (case-insensitive regex)
    const roleMap = await RoleSkillMap.findOne({ roleName: new RegExp('^' + targetRoleName + '$', 'i') });

    if (!roleMap) {
      // If the admin hasn't mapped this role, return a generic response
      return res.status(200).json({
        success: true,
        data: {
          targetRole: targetRoleName,
          matchPercentage: 0,
          existingSkills: userSkills,
          missingSkills: [],
          recommendations: ['Your target role is pending mapping by the administration. Keep building your general skills!']
        }
      });
    }

    const requiredSkills = roleMap.requiredSkills || [];
    const missingSkills = [];
    const existingMappedSkills = [];

    requiredSkills.forEach(reqSkill => {
      const hasSkill = userSkills.some(s => s.toLowerCase() === reqSkill.toLowerCase());
      if (hasSkill) existingMappedSkills.push(reqSkill);
      else missingSkills.push(reqSkill);
    });

    const matchPercentage = requiredSkills.length > 0 
      ? Math.round((existingMappedSkills.length / requiredSkills.length) * 100)
      : 100;

    const recommendations = missingSkills.map(s => `Acquire ${s} through courses or projects.`);
    if (matchPercentage >= 80) recommendations.push('You are highly qualified for this role! Start applying or completing challenges.');
    else if (matchPercentage >= 50) recommendations.push('You are on track. Focus on the missing skills.');
    else recommendations.push('Build foundational knowledge in the missing skills first.');

    res.status(200).json({
      success: true,
      data: {
        targetRole: targetRoleName,
        matchPercentage,
        existingSkills: existingMappedSkills,
        missingSkills,
        recommendations
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company } = req.query; // e.g. ?company=google

    const user = await User.findById(id).select('-password');
    if (!user || (user.role !== 'Student' && user.role !== 'Alumni')) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    let profileData = {
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      banner: user.role === 'Alumni' ? 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    };

    if (user.role === 'Student') {
      profileData.skills = user.studentProfile?.skills?.length ? user.studentProfile.skills : [];
      profileData.sections = {
        'Experience': user.studentProfile?.projects?.length ? user.studentProfile.projects.map(p => ({ title: p.name, company: p.stack, desc: p.desc })) : [],
        'Education': user.studentProfile?.course || user.studentProfile?.college ? [{ title: user.studentProfile.course || '', school: user.studentProfile.college || '' }] : [],
        'Certificates': user.studentProfile?.certificates?.length ? user.studentProfile.certificates.map(c => ({ title: c.name, issuer: c.issuer })) : []
      };
      profileData.social = {
        github: user.studentProfile?.githubUrl || '#',
        linkedin: user.studentProfile?.linkedinUrl || '#',
        website: user.studentProfile?.portfolioUrl || '#'
      };
      profileData.stats = {
        projects: user.studentProfile?.projects?.length || 0,
        followers: 0,
        following: 0
      };
    } else {
      // Alumni Logic
      profileData.skills = user.alumniProfile?.skills?.length ? user.alumniProfile.skills : (user.skills || []);
      profileData.sections = {
        'Experience': user.alumniProfile?.company ? [{ title: user.alumniProfile.designation || 'Alumni', company: user.alumniProfile.company, desc: `Graduated ${user.alumniProfile.graduationYear || 'N/A'}` }] : [],
        'Education': user.alumniProfile?.college ? [{ title: user.alumniProfile.department || '', school: user.alumniProfile.college }] : [],
        'Certificates': []
      };
      profileData.social = {
        github: '#',
        linkedin: user.linkedinUrl || user.alumniProfile?.linkedin || '#',
        website: '#'
      };
      profileData.stats = {
        projects: 0,
        followers: 0,
        following: 0
      };
    }

    // If there is a rule parameter (Smart Resume link)
    if (company && user.role === 'Student') {
      const rule = await PortfolioRule.findOne({ student: id, urlParameter: company });
      
      if (rule) {
        // Reorder skills to put highlighted skills first
        if (rule.highlightedSkills && rule.highlightedSkills.length > 0) {
          const highlighted = profileData.skills.filter(s => rule.highlightedSkills.includes(s));
          const others = profileData.skills.filter(s => !rule.highlightedSkills.includes(s));
          profileData.skills = [...highlighted, ...others];
        }
        
        // Hide specified sections
        if (rule.hiddenSections && rule.hiddenSections.length > 0) {
          rule.hiddenSections.forEach(section => {
            delete profileData.sections[section];
          });
        }
      }
    }

    res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res) => { res.status(200).json({ message: 'Feedback submitted' }); };

export const uploadStudentResume = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    // 1. Parse PDF
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the uploaded PDF.' });
    }

    // 2. Fetch User to get target role and current skills
    const user = await User.findById(studentId);
    if (!user || user.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const targetRole = user.studentProfile?.targetCareerRole || 'Software Engineer';
    const existingSkills = user.studentProfile?.skills || [];

    // 3. AI Analysis
    const prompt = `
      Act as an expert ATS (Applicant Tracking System) and senior recruiter.
      Analyze the following resume against the target role: "${targetRole}".
      
      Resume Text:
      ${resumeText}
      
      Return ONLY a valid JSON object (no markdown, no code blocks) with the following structure:
      {
        "atsScore": (number 0-100),
        "extractedSkills": [(array of strings, normalize variations e.g. "ReactJS" -> "React")],
        "missingSkills": [(array of strings, important skills for ${targetRole} missing from the resume)],
        "suggestions": [(array of strings for improvement)],
        "summary": (brief paragraph summary of candidate readiness),
        "experienceLevel": (string, e.g., "Entry", "Mid", "Senior")
      }
    `;

    // ── AI Analysis with graceful fallback ──────────────────────────────────
    let aiResult = null;
    let aiError = null;
    try {
      aiResult = await geminiService.generateJsonContent(prompt);
    } catch (e) {
      aiError = e.message;
      console.error('[Resume Upload] AI analysis failed:', e.message);
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: 'AI Service configuration error: ' + e.message });
      }
      // AI is temporarily down (503, overloaded, etc.) — fall through to regex fallback
    }

    // ── If AI returned null/undefined, ensure we have a safe object ──────────
    if (!aiResult || typeof aiResult !== 'object') {
      console.warn('[Resume Upload] AI returned no usable result. Using regex fallback for skill extraction.');
      // Regex-based skill extraction as fallback
      const KNOWN_SKILLS = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
        'React', 'React.js', 'Next.js', 'Angular', 'Vue.js', 'Svelte', 'Node.js', 'Express', 'Express.js', 'Nest.js',
        'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET', 'FastAPI',
        'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'Firebase', 'Supabase',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions',
        'Git', 'GitHub', 'GitLab', 'Linux', 'Bash', 'REST API', 'GraphQL', 'WebSockets', 'gRPC',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
        'HTML', 'CSS', 'SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Figma',
        'Agile', 'Scrum', 'Jira', 'Confluence', 'Postman', 'VS Code', 'IntelliJ'
      ];
      const lowerText = resumeText.toLowerCase();
      const regexExtracted = KNOWN_SKILLS.filter(skill => lowerText.includes(skill.toLowerCase()));

      // Simple ATS score based on content analysis
      const sections = ['education', 'experience', 'skills', 'projects', 'certifications', 'summary', 'objective'];
      const sectionCount = sections.filter(s => lowerText.includes(s)).length;
      const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
      const fallbackScore = Math.min(95, Math.max(30,
        (sectionCount * 10) +
        (regexExtracted.length > 10 ? 25 : regexExtracted.length * 2) +
        (wordCount > 300 ? 20 : Math.floor(wordCount / 15))
      ));

      aiResult = {
        atsScore: fallbackScore,
        extractedSkills: regexExtracted,
        missingSkills: [],
        suggestions: aiError ? [`AI analysis temporarily unavailable (${aiError.substring(0,80)}). Skills were extracted using pattern matching.`] : ['AI analysis was skipped.'],
        summary: `Resume processed using pattern matching. ${regexExtracted.length} skills detected. ATS score estimated at ${fallbackScore}/100.`,
        experienceLevel: 'Professional',
        fallback: true
      };
      console.log('[Resume Upload] Fallback extraction: skills =', regexExtracted, 'score =', fallbackScore);
    } else {
      console.log('[Resume Upload] AI extraction success: skills =', aiResult.extractedSkills?.length, 'score =', aiResult.atsScore);
    }

    // 4. Intelligently Merge Skills
    const extractedSkills = Array.isArray(aiResult.extractedSkills) ? aiResult.extractedSkills : [];
    const mergedSkillsSet = new Set(existingSkills.map(s => s.toLowerCase().trim()));
    const finalSkillsList = [...existingSkills];

    for (const skill of extractedSkills) {
      const normalizedSkill = skill.toLowerCase().trim();
      if (!mergedSkillsSet.has(normalizedSkill)) {
        mergedSkillsSet.add(normalizedSkill);
        finalSkillsList.push(skill.trim()); // Keep original case from extraction
      }
    }

    // 5. Update User Profile
    if (!user.studentProfile) user.studentProfile = {};
    user.studentProfile.skills = finalSkillsList;
    user.studentProfile.resumeScore = aiResult.atsScore || 0;
    // We will just store the filename for UI presentation
    user.studentProfile.resumeUrl = req.file.originalname;
    user.markModified('studentProfile');
    await user.save();

    // 6. Save ResumeAnalysis Document
    let analysis = await ResumeAnalysis.findOne({ studentId });
    if (!analysis) {
      analysis = new ResumeAnalysis({ studentId });
    }
    
    analysis.fileName = req.file.originalname;
    analysis.extractedText = resumeText.substring(0, 5000); // Save a portion to avoid huge docs if unnecessary
    analysis.atsScore = aiResult.atsScore || 0;
    analysis.skills = extractedSkills;
    analysis.missingSkills = Array.isArray(aiResult.missingSkills) ? aiResult.missingSkills : [];
    analysis.suggestions = Array.isArray(aiResult.suggestions) ? aiResult.suggestions : [];
    analysis.summary = aiResult.summary || '';
    analysis.experienceLevel = aiResult.experienceLevel || 'Professional';
    analysis.analyzedAt = new Date();
    
    await analysis.save();

    res.status(200).json({ 
      success: true, 
      message: 'Resume analyzed and skills updated successfully',
      data: {
        user,
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeAnalysis = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const analysis = await ResumeAnalysis.findOne({ studentId }).sort({ analyzedAt: -1 });
    
    if (!analysis) {
      return res.status(200).json({ success: true, data: null, message: 'No resume analysis found' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Comprehensive AI prompt for full profile extraction ────────────
const COMPREHENSIVE_RESUME_PROMPT = (resumeText, targetRole) => `You are an expert resume parser and ATS system. Analyze the resume below and extract ALL available information.

CRITICAL RULES:
- Return ONLY a valid JSON object, no markdown, no code fences, no extra text
- If a field is NOT in the resume, set it to null — NEVER invent data
- Normalize skill variants: "ReactJS" -> "React", "NodeJS" -> "Node.js"

Resume Text:
${resumeText.substring(0, 7000)}

Target Role: "${targetRole}"

Return this exact JSON (fill in values):
{"atsScore":75,"experienceLevel":"Entry","summary":"Candidate summary","extractedSkills":["JavaScript"],"missingSkills":[],"suggestions":["Add quantified achievements"],"profile":{"name":null,"email":null,"phone":null,"location":null,"bio":null,"college":null,"branch":null,"batchYear":null,"cgpa":null,"githubUrl":null,"linkedinUrl":null,"websiteUrl":null},"projects":[],"certificates":[],"experience":[]}
`;

// ─── Helper: Regex fallback when AI is unavailable ──────────────────────────
const regexFallbackExtraction = (resumeText) => {
  const KNOWN_SKILLS = [
    'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','PHP','Ruby','Swift','Kotlin',
    'React','React.js','Next.js','Angular','Vue.js','Svelte','Node.js','Express','Express.js','Nest.js',
    'Django','Flask','Spring Boot','Laravel','ASP.NET','FastAPI',
    'MongoDB','PostgreSQL','MySQL','SQLite','Redis','Elasticsearch','Firebase','Supabase',
    'Docker','Kubernetes','AWS','Azure','GCP','Terraform','CI/CD','Jenkins','GitHub Actions',
    'Git','GitHub','GitLab','Linux','Bash','REST API','GraphQL','WebSockets',
    'Machine Learning','Deep Learning','TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy',
    'HTML','CSS','SCSS','Tailwind CSS','Bootstrap','Material UI','Figma','Agile','Scrum','Jira','Postman'
  ];
  const lower = resumeText.toLowerCase();
  const skills = KNOWN_SKILLS.filter(s => lower.includes(s.toLowerCase()));
  const sections = ['education','experience','skills','projects','certifications','summary','objective'];
  const sectionCount = sections.filter(s => lower.includes(s)).length;
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const score = Math.min(95, Math.max(30,
    (sectionCount * 10) + (skills.length > 10 ? 25 : skills.length * 2) +
    (wordCount > 300 ? 20 : Math.floor(wordCount / 15))
  ));
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/(\+91[\s-]?)?[6-9]\d{9}|(\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const githubMatch = resumeText.match(/github\.com\/([A-Za-z0-9_.-]+)/i);
  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/([A-Za-z0-9_.-]+)/i);
  return {
    atsScore: score, experienceLevel: 'Professional',
    summary: `Resume analyzed via pattern matching. ${skills.length} skills detected.`,
    extractedSkills: skills, missingSkills: [], 
    suggestions: ['AI analysis temporarily unavailable. Skills extracted via pattern matching.'],
    profile: {
      name: null, email: emailMatch ? emailMatch[0] : null, phone: phoneMatch ? phoneMatch[0] : null,
      location: null, bio: null, college: null, branch: null, batchYear: null, cgpa: null,
      githubUrl: githubMatch ? `https://github.com/${githubMatch[1]}` : null,
      linkedinUrl: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null, websiteUrl: null
    },
    projects: [], certificates: [], experience: [], fallback: true
  };
};

// ─── NEW: Analyze resume for profile review — no DB profile update ──────────
export const analyzeResumeForProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    if (!req.file) return res.status(400).json({ success: false, message: 'No resume file uploaded' });

    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Ensure it is not a scanned/image PDF.' });
    }

    const user = await User.findById(studentId);
    if (!user || user.role !== 'Student') return res.status(404).json({ success: false, message: 'Student not found' });

    const targetRole = user.studentProfile?.targetCareerRole || 'Software Engineer';
    const existingSkills = user.studentProfile?.skills || [];

    let aiResult = null;
    try {
      aiResult = await geminiService.generateJsonContent(COMPREHENSIVE_RESUME_PROMPT(resumeText, targetRole));
    } catch (e) {
      console.error('[analyzeResumeForProfile] AI failed:', e.message);
      if (e.message.includes('not configured') || e.message.includes('authentication failed')) {
        return res.status(400).json({ success: false, message: 'AI Service error: ' + e.message });
      }
    }
    if (!aiResult || typeof aiResult !== 'object') {
      console.warn('[analyzeResumeForProfile] Using regex fallback');
      aiResult = regexFallbackExtraction(resumeText);
    }

    let analysis = await ResumeAnalysis.findOne({ studentId });
    if (!analysis) analysis = new ResumeAnalysis({ studentId, fileName: req.file.originalname });
    analysis.fileName = req.file.originalname;
    analysis.extractedText = resumeText.substring(0, 8000);
    analysis.atsScore = aiResult.atsScore || 0;
    analysis.skills = Array.isArray(aiResult.extractedSkills) ? aiResult.extractedSkills : [];
    analysis.missingSkills = Array.isArray(aiResult.missingSkills) ? aiResult.missingSkills : [];
    analysis.suggestions = Array.isArray(aiResult.suggestions) ? aiResult.suggestions : [];
    analysis.summary = aiResult.summary || '';
    analysis.experienceLevel = aiResult.experienceLevel || 'Professional';
    analysis.extractedProfile = aiResult.profile || {};
    analysis.extractedProjects = Array.isArray(aiResult.projects) ? aiResult.projects : [];
    analysis.extractedCertificates = Array.isArray(aiResult.certificates) ? aiResult.certificates : [];
    analysis.extractedExperience = Array.isArray(aiResult.experience) ? aiResult.experience : [];
    analysis.status = 'pending_review';
    analysis.analyzedAt = new Date();
    await analysis.save();

    res.status(200).json({
      success: true,
      message: aiResult.fallback ? 'Analyzed via pattern matching (AI temporarily unavailable)' : 'Resume analyzed successfully',
      data: {
        analysisId: analysis._id.toString(),
        atsScore: aiResult.atsScore || 0,
        experienceLevel: aiResult.experienceLevel || 'Professional',
        summary: aiResult.summary || '',
        extractedSkills: aiResult.extractedSkills || [],
        missingSkills: aiResult.missingSkills || [],
        suggestions: aiResult.suggestions || [],
        profile: aiResult.profile || {},
        projects: aiResult.projects || [],
        certificates: aiResult.certificates || [],
        experience: aiResult.experience || [],
        existingSkills, targetRole, fileName: req.file.originalname, fallback: !!aiResult.fallback
      }
    });
  } catch (error) { next(error); }
};

// ─── NEW: Apply student-confirmed profile from resume to MongoDB ─────────────
export const applyResumeProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { analysisId, profile = {}, skills = [], projects = [], certificates = [] } = req.body;

    const user = await User.findById(studentId);
    if (!user || user.role !== 'Student') return res.status(404).json({ success: false, message: 'Student not found' });

    if (!user.studentProfile) user.studentProfile = {};
    const sp = user.studentProfile;

    if (profile.name && profile.name.trim()) user.name = profile.name.trim();
    if (profile.phone) user.phone = profile.phone;
    if (profile.college !== undefined && profile.college !== null) sp.college = profile.college;
    if (profile.branch !== undefined && profile.branch !== null) sp.branch = profile.branch;
    if (profile.batchYear) sp.batchYear = Number(profile.batchYear);
    if (profile.cgpa) sp.cgpa = Number(profile.cgpa);
    if (profile.bio !== undefined && profile.bio !== null) sp.bio = profile.bio;
    if (profile.githubUrl !== undefined && profile.githubUrl !== null) sp.githubUrl = profile.githubUrl;
    if (profile.linkedinUrl !== undefined && profile.linkedinUrl !== null) sp.linkedinUrl = profile.linkedinUrl;
    if (profile.websiteUrl !== undefined && profile.websiteUrl !== null) sp.websiteUrl = profile.websiteUrl;

    // Merge skills — dedup by lowercase
    const existingSkills = sp.skills || [];
    const mergedSet = new Set(existingSkills.map(s => s.toLowerCase().trim()));
    const finalSkills = [...existingSkills];
    
    // Write to both legacy array and new normalized collections
    for (const skill of skills) {
      const n = skill.toLowerCase().trim();
      if (n && !mergedSet.has(n)) { 
        mergedSet.add(n); 
        finalSkills.push(skill.trim()); 
      }
      
      if (n) {
        let skillDoc = await Skill.findOne({ normalizedName: n });
        if (!skillDoc) {
          skillDoc = await Skill.create({ name: skill.trim(), normalizedName: n });
        }
        const existingMapping = await StudentSkill.findOne({ studentId: user._id, skillId: skillDoc._id });
        if (!existingMapping) {
          await StudentSkill.create({ studentId: user._id, skillId: skillDoc._id, source: 'resume', proficiency: 50 });
        }
      }
    }
    sp.skills = finalSkills;

    // Merge projects — dedup by name
    const existingProjNames = new Set((sp.projects || []).map(p => p.name?.toLowerCase().trim()));
    for (const proj of projects) {
      if (proj.name && !existingProjNames.has(proj.name.toLowerCase().trim())) {
        existingProjNames.add(proj.name.toLowerCase().trim());
        if (!sp.projects) sp.projects = [];
        sp.projects.push({ name: proj.name, stack: proj.stack || '', desc: proj.desc || '', github: proj.github || '' });
      }
    }

    // Merge certificates — dedup by name
    const existingCertNames = new Set((sp.certificates || []).map(c => c.name?.toLowerCase().trim()));
    for (const cert of certificates) {
      if (cert.name && !existingCertNames.has(cert.name.toLowerCase().trim())) {
        existingCertNames.add(cert.name.toLowerCase().trim());
        if (!sp.certificates) sp.certificates = [];
        sp.certificates.push({ name: cert.name, issuer: cert.issuer || '', date: cert.date || '' });
      }
    }

    // Update ATS score and mark analysis confirmed
    if (analysisId) {
      const analysis = await ResumeAnalysis.findById(analysisId);
      if (analysis) {
        sp.resumeScore = analysis.atsScore || sp.resumeScore || 0;
        sp.resumeUrl = analysis.fileName || sp.resumeUrl;
        await ResumeAnalysis.findByIdAndUpdate(analysisId, { status: 'confirmed' });
      }
    }

    user.markModified('studentProfile');
    await user.save();

    const updatedUser = await User.findById(studentId).select('-password');
    res.status(200).json({
      success: true,
      message: `Profile updated! ${finalSkills.length} skills, ${(sp.projects||[]).length} projects saved.`,
      data: { user: updatedUser }
    });
  } catch (error) { next(error); }
};

export const toggleSavedJob = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const jobId = req.params.id;

    const user = await User.findById(studentId);
    if (!user || user.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!user.studentProfile) user.studentProfile = {};
    if (!user.studentProfile.savedJobs) user.studentProfile.savedJobs = [];

    const savedIndex = user.studentProfile.savedJobs.findIndex(id => id.toString() === jobId);
    
    let isSaved = false;
    if (savedIndex > -1) {
      // Remove job
      user.studentProfile.savedJobs.splice(savedIndex, 1);
    } else {
      // Save job
      user.studentProfile.savedJobs.push(jobId);
      isSaved = true;
    }

    user.markModified('studentProfile.savedJobs');
    await user.save();

    res.status(200).json({ success: true, saved: isSaved, savedJobs: user.studentProfile.savedJobs });
  } catch (error) {
    next(error);
  }
};
