import Job from '../recruitment/models/job.model.js';
import Application from '../applications/application.model.js';
import AppError from '../../core/errors/AppError.js';
import { APPLICATION_STATUSES } from '../../../../../packages/shared-constants/index.js';

// ─── Create Job Post ────────────────────────────────────────────────────────
export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, recruiter: req.user._id });
    res.status(201).json({ status: 'success', data: job });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Jobs (Public / Student filtered) ───────────────────────────────
export const getAllJobs = async (req, res, next) => {
  try {
    const { type, remote, search } = req.query;
    const filter = { status: 'active' };

    if (type) filter.jobType = type;
    if (remote === 'true') filter.isRemote = true;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('company', 'name logoUrl industry')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ status: 'success', results: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Job ─────────────────────────────────────────────────────────
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('Placement', 'name email');

    if (!job) return next(new AppError('Job not found', 404));
    res.status(200).json({ status: 'success', data: job });
  } catch (error) {
    next(error);
  }
};

// ─── Student: Apply to Job ──────────────────────────────────────────────────
export const applyToJob = async (req, res, next) => {
  try {
    const { resumeUrl, coverLetter } = req.body;

    const existing = await Application.findOne({ job: req.params.id, student: req.user._id });
    if (existing) return next(new AppError('You have already applied to this job', 409));

    const application = await Application.create({
      job: req.params.id,
      student: req.user._id,
      resumeUrl,
      coverLetter
    });

    res.status(201).json({ status: 'success', data: application });
  } catch (error) {
    next(error);
  }
};

// ─── Recruiter: Update Application Status ──────────────────────────────────
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!Object.values(APPLICATION_STATUSES).includes(status)) {
      return next(new AppError('Invalid application status', 400));
    }

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status },
      { new: true }
    ).populate('student', 'name email');

    if (!application) return next(new AppError('Application not found', 404));
    res.status(200).json({ status: 'success', data: application });
  } catch (error) {
    next(error);
  }
};

// ─── Student: My Applications ───────────────────────────────────────────────
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({ path: 'job', populate: { path: 'company', select: 'name logoUrl' } });

    res.status(200).json({ status: 'success', results: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};
