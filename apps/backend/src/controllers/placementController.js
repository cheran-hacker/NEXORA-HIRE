import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { CapstoneProject as Capstone } from '../models/CapstoneProject.js';
import { Assessment } from '../models/Assessment.js';

export const getPlacementStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activePlacementOfficersCount = await User.countDocuments({ role: 'Placement' });

    // Placement Rate calculation
    const offeredApplications = await Application.find({ status: 'Offered' }).populate('jobId');
    const offeredStudents = new Set(offeredApplications.map(a => a.studentId.toString()));
    const placementRate = totalStudents > 0 ? Math.round((offeredStudents.size / totalStudents) * 100) : 0;

    // Highest and Avg Package
    let highestPackage = 0;
    let totalPackage = 0;
    let packageCount = 0;

    offeredApplications.forEach(app => {
      if (app.jobId && app.jobId.salary && app.jobId.salary.max) {
        highestPackage = Math.max(highestPackage, app.jobId.salary.max);
        totalPackage += app.jobId.salary.max;
        packageCount++;
      }
    });

    const avgPackage = packageCount > 0 ? Math.round(totalPackage / packageCount) : 0;

    // Upcoming Drives (Jobs with deadlines in the future)
    const upcomingDrives = await Job.find({ deadline: { $gte: new Date() }, status: 'Open' })
      .select('title company location deadline')
      .sort({ deadline: 1 })
      .limit(5);

    // Pipeline Data
    const pipelineData = {
      labels: ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offered'],
      data: [
        totalApplications,
        await Application.countDocuments({ status: 'Screening' }),
        await Application.countDocuments({ status: 'Shortlisted' }),
        await Application.countDocuments({ status: 'Interview' }),
        offeredApplications.length
      ]
    };

    // Recent Applications
    const recentApps = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('jobId', 'title company')
      .populate('studentId', 'name studentProfile')
      .lean();

    const formattedRecentApps = recentApps.map(app => {
      let matchPct = 0;
      if (app.jobId?.skills && app.studentId?.studentProfile?.skills) {
        const reqSkills = app.jobId.skills;
        const userSkills = app.studentId.studentProfile.skills;
        const matchCount = reqSkills.filter(js => userSkills.some(us => us.toLowerCase() === js.toLowerCase())).length;
        matchPct = reqSkills.length > 0 ? Math.round((matchCount / reqSkills.length) * 100) : 0;
      }
      return {
        id: app._id,
        candidate: app.studentId?.name || 'Unknown Candidate',
        role: app.jobId?.title || 'Unknown Role',
        company: app.jobId?.company || 'Unknown Company',
        matchScore: matchPct,
        status: app.status
      };
    });

    const highMatches = formattedRecentApps.filter(app => app.matchScore > 70).length;

    res.json({
      success: true,
      data: {
        adminProfile: {
          name: req.user.name || 'Placement Officer'
        },
        kpis: {
          totalApplicants: totalStudents,
          activeJobs: totalJobs,
          aiTopMatches: highMatches, // Dynamically calculated from recent applications
          interviewsToday: await Application.countDocuments({ status: 'Interview' }) // Ideally filter by today's date
        },
        pipeline: pipelineData,
        recentApplications: formattedRecentApps,
        // Keep the old ones just in case other parts of the app use them
        placementRate,
        activeCompanies: await Job.distinct('company').length,
        activeRecruiters: activePlacementOfficersCount,
        placementDrives: totalJobs,
        applications: totalApplications,
        offers: offeredApplications.length,
        averagePackage: avgPackage,
        highestPackage: highestPackage,
        upcomingDrives
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

export const getRecruitmentPipeline = async (req, res) => {
  try {
    const applied = await Application.countDocuments({ status: 'Applied' });
    const screening = await Application.countDocuments({ status: 'Screening' });
    const shortlisted = await Application.countDocuments({ status: 'Shortlisted' });
    const interview = await Application.countDocuments({ status: 'Interview' });
    const offered = await Application.countDocuments({ status: 'Offered' });
    const rejected = await Application.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      data: {
        applied, screening, shortlisted, interview, offered, rejected
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching pipeline' });
  }
};

export const getPlacementStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' })
      .select('name email avatar studentProfile')
      .lean();
    
    // Add application stats
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      const apps = await Application.find({ studentId: student._id });
      const offers = apps.filter(a => a.status === 'Offered').length;
      return { 
        ...student, 
        applicationsCount: apps.length,
        offersCount: offers,
        placementStatus: offers > 0 ? 'Placed' : 'Unplaced'
      };
    }));

    res.json({ success: true, data: enrichedStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
};

export const getPlacementCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'Placement' })
      .select('name email avatar recruiterProfile')
      .lean();
    
    const enrichedCompanies = await Promise.all(companies.map(async (company) => {
      const jobsCount = await Job.countDocuments({ recruiterId: company._id, status: 'Open' });
      const hiredCount = await Application.countDocuments({ 
        status: 'Offered', 
        jobId: { $in: await Job.find({ recruiterId: company._id }).distinct('_id') } 
      });
      return { ...company, jobsCount, hiredCount };
    }));

    res.json({ success: true, data: enrichedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching companies' });
  }
};

export const getStudentProjects = async (req, res) => {
  try {
    const projects = await Capstone.find().populate('members', 'name email').populate('mentors', 'name');
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching projects' });
  }
};

export const evaluateProject = async (req, res) => {
  try {
    const { status, grade } = req.body;
    const project = await Capstone.findByIdAndUpdate(req.params.id, { status, grade }, { new: true });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error evaluating project' });
  }
};

export const getCareerGuidance = async (req, res) => {
  try {
    // Identify students needing attention (0 applications or low assessment scores)
    const students = await User.find({ role: 'Student' }).select('name email avatar studentProfile').lean();
    
    const guidanceData = await Promise.all(students.map(async (student) => {
      const apps = await Application.countDocuments({ studentId: student._id });
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        skills: student.studentProfile?.skills || [],
        applications: apps,
        needsAttention: apps === 0,
        skillGap: apps === 0 ? ['Soft Skills', 'Interview Prep'] : []
      };
    }));

    res.json({ 
      success: true, 
      data: {
        attentionRequired: guidanceData.filter(g => g.needsAttention),
        allStudents: guidanceData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching guidance data' });
  }
};

export const getPlacementTracking = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('studentId', 'name email avatar')
      .populate('jobId', 'title company')
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching tracking data' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('studentId', 'name')
      .populate('jobId', 'title');
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
};

export const getAnalyticsReports = async (req, res) => {
  try {
    // Generate placement trend
    const placementTrend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);
      const offers = await Application.countDocuments({ status: 'Offered', updatedAt: { $gte: start, $lte: end } });
      placementTrend.push({ month: start.toLocaleString('default', { month: 'short' }), offers });
    }

    res.json({
      success: true,
      data: {
        placementTrend,
        departmentBreakdown: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching reports' });
  }
};
