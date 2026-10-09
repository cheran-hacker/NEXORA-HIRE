import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';

export const getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // 1. Get total jobs posted by recruiter
    const activeJobs = await Job.countDocuments({ recruiterId: recruiterId, status: 'Open' });

    // 2. Get all jobs to find related applications
    const jobs = await Job.find({ recruiterId: recruiterId });
    const jobIds = jobs.map(j => j._id);

    // 3. Get total applicants for those jobs
    const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });

    // 4. Calculate Pipeline data (Shortlisted, Interviewing, Offered, Rejected)
    const shortlisted = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'Shortlisted' });
    const interviewing = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'Interview' });
    const offered = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'Offered' });
    const rejected = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'Rejected' });

    // Get active job postings details
    const activeJobsList = await Job.find({ recruiterId: recruiterId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title status metrics');

    // 5. Get recent applications (Top AI matches)
    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ aiScore: -1, createdAt: -1 })
      .limit(4)
      .populate('studentId', 'name email')
      .populate('jobId', 'title');

    // Calculate top matches accurately (applications with aiScore > 80)
    const topMatchesCount = await Application.countDocuments({ jobId: { $in: jobIds }, aiScore: { $gt: 80 } });

    res.json({
      companyOverview: {
        name: req.user.recruiterProfile?.company || "Company Profile Not Setup",
        role: "Recruiter",
        openPositions: activeJobs,
        totalHires: 0,
        timeToHire: "N/A",
        acceptanceRate: 0
      },
      kpis: {
        activeJobs: activeJobs,
        totalApplicants: totalApplicants,
        aiTopMatches: topMatchesCount,
        interviewsToday: interviewing,
      },
      pipeline: {
        labels: ['Applied', 'Screening', 'Interviewing', 'Offered', 'Hired'],
        data: [totalApplicants, shortlisted, interviewing, offered, 0]
      },
      activeJobsList: activeJobsList.length > 0 ? activeJobsList.map(j => ({
        id: j._id,
        role: j.title,
        status: j.status,
        applicants: j.metrics?.applications || 0,
        matches: 0
      })) : [],
      recentApplications: recentApplications.length > 0 ? recentApplications.map(app => ({
        id: app._id,
        name: app.studentId?.name || 'Unknown',
        role: app.jobId?.title || 'Unknown Role',
        matchScore: app.aiScore || 0,
        status: app.status,
        time: app.createdAt
      })) : [],
      upcomingInterviews: [],
      offerStatistics: {
        labels: [],
        offersSent: [],
        offersAccepted: []
      },
      notifications: []
    });
  } catch (error) {
    console.error('Recruiter Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching recruiter stats' });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    
    // Find all jobs owned by this recruiter
    const jobs = await Job.find({ recruiterId: recruiterId });
    const jobIds = jobs.map(j => j._id);

    // Find all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('studentId', 'name email studentProfile')
      .populate('jobId', 'title');

    // Map to the format the frontend expects
    const candidates = applications.map(app => {
      // Optional chaining for safety
      const student = app.studentId || {};
      const profile = student.studentProfile || {};
      
      return {
        _id: app._id,
        name: student.name || 'Unknown Candidate',
        email: student.email || '',
        college: profile.college || 'Unknown College',
        status: app.status,
        score: app.aiScore || 0,
        appliedRole: app.jobId?.title || 'Unknown Role',
        appliedDate: new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
    });

    res.json({ success: true, data: candidates });
  } catch (error) {
    console.error('Get Candidates Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching candidates' });
  }
};
