import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';

// Get all jobs (with basic filtering and text search)
export const getJobs = async (req, res, next) => {
  try {
    const { search, type, location, status, source, approvalStatus } = req.query;
    
    let query = {};
    
    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, 'i');
    if (status) query.status = status;
    else query.status = 'Open';

    if (source) query.source = source;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const jobs = await Job.find(query)
      .populate('recruiterId', 'name avatar recruiterProfile.companyName')
      .sort('-createdAt')
      .lean();

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

// Get single job
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'name avatar recruiterProfile.companyName recruiterProfile.companyWebsite');
    
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    // Increment view count safely
    job.metrics.views += 1;
    await job.save();

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// Create a new job (Recruiters only)
export const createJob = async (req, res, next) => {
  try {
    // Inject current user as recruiter
    req.body.recruiterId = req.user.id;
    
    const job = await Job.create({
      ...req.body,
      recruiterId: req.user.id
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_job', { title: job.title, company: job.company });
    }

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// Update an existing job
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedJob });
  } catch (error) {
    next(error);
  }
};

// Get recruiter's own jobs
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id }).sort('-createdAt').lean();
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

// Student applies to a job
export const applyJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user.id;

    // Check if already applied
    const existing = await Application.findOne({ jobId, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Fetch the job to check eligibility
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Check deadline
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check Eligibility Criteria
    const profile = req.user.studentProfile;
    
    // CGPA Check
    if (job.minimumCGPA && job.minimumCGPA > 0) {
      const studentCGPA = profile?.cgpa;
      if (!studentCGPA || studentCGPA <= 0) {
        return res.status(400).json({ success: false, message: 'Please update your CGPA in your student profile before applying to this opportunity.' });
      }
      if (studentCGPA < job.minimumCGPA) {
        return res.status(400).json({ success: false, message: `Your CGPA (${studentCGPA}) does not meet the minimum requirement of ${job.minimumCGPA} for this opportunity.` });
      }
    }

    // Batch Check
    if (job.eligibleBatches && job.eligibleBatches.length > 0) {
      const studentBatch = profile?.batchYear;
      if (!studentBatch) {
        return res.status(400).json({ success: false, message: 'Please update your batch year in your student profile before applying.' });
      }
      if (!job.eligibleBatches.includes(Number(studentBatch))) {
        return res.status(400).json({ success: false, message: `Your batch (${studentBatch}) is not eligible for this opportunity. Eligible batches: ${job.eligibleBatches.join(', ')}` });
      }
    }

    // Branch Check
    if (job.eligibleBranches && job.eligibleBranches.length > 0) {
      const studentBranch = profile?.branch;
      if (!studentBranch) {
        return res.status(400).json({ success: false, message: 'Please update your branch in your student profile before applying.' });
      }
      if (!job.eligibleBranches.includes(studentBranch)) {
        return res.status(400).json({ success: false, message: `Your branch (${studentBranch}) is not eligible for this opportunity.` });
      }
    }

    const resumeUrl = req.body.resumeUrl || (profile && profile.resumeUrl);
    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a resume in your profile before applying' });
    }

    const application = await Application.create({
      jobId,
      studentId,
      resumeUrl: resumeUrl,
      status: 'Applied'
    });

    // Update job metrics
    await Job.findByIdAndUpdate(jobId, { $inc: { 'metrics.applications': 1 } });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_application', { jobId: job._id, title: job.title });
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Get student's own applications
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId', 'title company location type salary isRemote status recruiterId')
      .sort('-createdAt')
      .lean();
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

// ATS: Get all applications for a specific job
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    // Ensure the user is the recruiter who owns the job
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('studentId', 'name email studentProfile')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

// ATS: Update application status via Kanban drag-and-drop
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Valid statuses based on the model
    const validStatuses = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Ensure the user owns the job associated with this application
    const job = await Job.findById(application.jobId);
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Delete a job
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }
    await job.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// ATS: Schedule an interview for an application
export const scheduleInterview = async (req, res, next) => {
  try {
    const { title, scheduledAt, interviewer, duration, type } = req.body;
    
    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const job = await Job.findById(application.jobId);
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.interviewRounds.push({
      title: title || type || 'Interview',
      scheduledAt: scheduledAt || new Date(),
      interviewer: interviewer || req.user.name,
      result: 'Pending'
    });
    
    // Automatically update status
    application.status = 'Interview';
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// ATS: Get all upcoming interviews for the recruiter
export const getMyInterviews = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id }).select('_id title company');
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ 
      jobId: { $in: jobIds },
      'interviewRounds.0': { $exists: true }
    }).populate('studentId', 'name email').populate('jobId', 'title company');

    let interviews = [];
    applications.forEach(app => {
      app.interviewRounds.forEach((round, index) => {
        interviews.push({
          id: `${app._id}-${index}`,
          appId: app._id,
          candidate: app.studentId?.name || 'Unknown',
          role: app.jobId?.title || 'Job Role',
          company: app.jobId?.company || 'Company',
          time: new Date(round.scheduledAt).toLocaleString(),
          scheduledAt: round.scheduledAt,
          type: round.title,
          status: round.result === 'Pending' ? (app.status === 'Offered' || app.status === 'Rejected' ? 'Completed' : 'Pending') : round.result,
          interviewer: round.interviewer
        });
      });
    });

    // Sort by scheduled time
    interviews.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

export const shareOpportunity = async (req, res, next) => {
  try {
    const { title, company, location, type, skills, url } = req.body;
    
    const newJob = await Job.create({
      title,
      company,
      location: location || 'Remote',
      type: type || 'Full-Time',
      skills: Array.isArray(skills) ? skills : [],
      description: `Vacancy shared by Alumni via external link: ${url}`,
      requirements: [],
      salary: { min: 0, max: 0, currency: 'INR' },
      status: 'Open',
      source: 'Alumni',
      approvalStatus: 'Pending',
      recruiterId: req.user.id // use recruiterId since Job model links it
    });

    res.status(201).json({ success: true, message: 'Opportunity shared and pending approval', job: newJob });
  } catch (error) {
    console.error('Share Opportunity Error:', error);
    next(error);
  }
};

// Placement/Admin approve an alumni vacancy
export const approveVacancy = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    job.approvalStatus = 'Approved';
    await job.save();

    // Trigger Notifications for matched students
    const matchRegex = new RegExp(`(${job.skills.join('|')}|^${job.title}$)`, 'i');
    
    const { User } = await import('../models/User.js');
    const matchedStudents = await User.find({
      role: 'Student',
      status: 'Active',
      $or: [
        { 'studentProfile.targetCareerRole': { $regex: matchRegex } },
        { 'studentProfile.preferredRoles': { $regex: matchRegex } },
        { 'studentProfile.skills': { $in: job.skills.map(s => new RegExp(s, 'i')) } }
      ]
    });

    const notifications = matchedStudents.map(student => ({
      recipient: student._id,
      type: 'info',
      title: 'New Alumni Job Opportunity',
      message: `${job.company} is hiring for ${job.title}. Shared by an Alumni network contact.`,
      link: `/student/jobs`
    }));

    if (notifications.length > 0) {
      const { Notification } = await import('../models/Notification.js');
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, data: job, matchedStudentsCount: matchedStudents.length });
  } catch (error) {
    next(error);
  }
};
