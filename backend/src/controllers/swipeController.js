import { Swipe } from '../models/Swipe.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';

export const getJobsForStudent = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Find all jobs this student has already swiped on
    const previousSwipes = await Swipe.find({ swiperId: studentId, targetModel: 'Job' }).select('targetId');
    const swipedJobIds = previousSwipes.map(s => s.targetId);

    // Find active jobs not in the swiped list
    const jobs = await Job.find({
      status: 'Active',
      _id: { $nin: swipedJobIds }
    }).populate('company', 'name profile.logo profile.location').limit(20);

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getCandidatesForRecruiter = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    // We want to return students who have swiped right (liked) jobs posted by this recruiter.
    // For simplicity of this demo, we'll return a mix of students who applied and general active students.

    const previousSwipes = await Swipe.find({ swiperId: recruiterId, targetModel: 'User' }).select('targetId');
    const swipedStudentIds = previousSwipes.map(s => s.targetId);

    // Find students not yet swiped by this recruiter
    const students = await User.find({
      role: 'Student',
      _id: { $nin: swipedStudentIds }
    })
      .select('studentProfile.skills studentProfile.education studentProfile.cgpa studentProfile.projects') // DO NOT SELECT NAME/EMAIL TO REMOVE BIAS
      .limit(20);

    // Map to anonymize structure completely
    const anonymized = students.map(s => ({
      _id: s._id,
      skills: s.studentProfile?.skills || [],
      cgpa: s.studentProfile?.cgpa || 'N/A',
      education: s.studentProfile?.education || [],
      projects: s.studentProfile?.projects || []
    }));

    res.status(200).json({ success: true, count: anonymized.length, data: anonymized });
  } catch (error) {
    next(error);
  }
};

export const recordSwipe = async (req, res, next) => {
  try {
    const { targetId, targetModel, action } = req.body;
    const swiperId = req.user.id;
    const swiperRole = req.user.role;

    // 1. Record the swipe
    const newSwipe = await Swipe.create({
      swiperId,
      swiperRole,
      targetId,
      targetModel,
      action
    });

    let isMatch = false;

    // 2. Check for match if action is 'right'
    if (action === 'right') {
      if (swiperRole === 'Placement' && targetModel === 'User') {
        // Did the student swipe right on ANY of this recruiter's jobs?
        const recruiterJobs = await Job.find({ recruiter: swiperId }).select('_id');
        const recruiterJobIds = recruiterJobs.map(j => j._id);

        const studentSwipe = await Swipe.findOne({
          swiperId: targetId,
          targetId: { $in: recruiterJobIds },
          action: 'right'
        });

        if (studentSwipe) isMatch = true;
      }
      else if (swiperRole === 'Student' && targetModel === 'Job') {
        // Did the recruiter (owner of this job) swipe right on this student?
        const job = await Job.findById(targetId);
        if (job) {
          const recruiterSwipe = await Swipe.findOne({
            swiperId: job.recruiter,
            targetId: swiperId,
            action: 'right'
          });
          if (recruiterSwipe) isMatch = true;
        }
      }
    }

    if (isMatch) {
      newSwipe.isMatch = true;
      await newSwipe.save();
      // You could also update the reciprocal swipe to isMatch = true here if desired.
    }

    res.status(201).json({ success: true, isMatch });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already swiped on this profile.' });
    }
    next(error);
  }
};
