import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';

// Apply for a job
export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, resumeUrl, coverLetter, aiAnalysis } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    // Check for existing application
    const existing = await Application.findOne({ jobId, studentId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      jobId,
      studentId: req.user.id,
      resumeUrl,
      coverLetter,
      aiAnalysis
    });

    // Update job metrics
    job.metrics.applications += 1;
    await job.save();

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }
    next(error);
  }
};

// Get my applications (Student)
export const getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ studentId: req.user.id })
      .populate('jobId', 'title company location type status')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (error) {
    next(error);
  }
};

// Get applicants for a job (Recruiter)
export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    // Verify job belongs to recruiter
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applicants = await Application.find({ jobId })
      .populate('studentId', 'name email avatar studentProfile.college studentProfile.branch studentProfile.cgpa')
      .sort('-aiAnalysis.atsScore'); // Sort by ATS score by default!

    res.status(200).json({ success: true, count: applicants.length, data: applicants });
  } catch (error) {
    next(error);
  }
};

// Update application status
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const app = await Application.findById(req.params.id).populate('jobId');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    
    if (app.jobId.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    app.status = status;
    app.updatedAt = new Date();
    await app.save();

    // If shortlisted or offered, update job metrics
    if (status === 'Shortlisted') {
      app.jobId.metrics.shortlisted += 1;
      await app.jobId.save();
    } else if (status === 'Offered') {
      app.jobId.metrics.offers += 1;
      await app.jobId.save();
    }

    res.status(200).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};
