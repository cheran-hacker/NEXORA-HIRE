import { Bounty } from '../models/Bounty.js';
import { User } from '../models/User.js';

/**
 * Create a new Bounty (Draft or Open)
 * Role: Alumni, Placement, Admin
 */
export const createBounty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      taskInstructions,
      rewardAmount,
      rewardCurrency,
      tags,
      requiredSkills,
      difficulty,
      category,
      eligibilityCriteria,
      deadline,
      status
    } = req.body;

    if (!title || !description || rewardAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and reward amount are required'
      });
    }

    const skillsList = requiredSkills || tags || [];
    const normalizedSkills = Array.isArray(skillsList)
      ? skillsList.map(s => String(s).trim()).filter(Boolean)
      : String(skillsList).split(',').map(s => s.trim()).filter(Boolean);

    const bounty = await Bounty.create({
      title: title.trim(),
      description: description.trim(),
      taskInstructions: taskInstructions ? taskInstructions.trim() : '',
      rewardAmount: Number(rewardAmount),
      rewardCurrency: rewardCurrency || 'USD',
      tags: normalizedSkills,
      requiredSkills: normalizedSkills,
      difficulty: difficulty || 'Intermediate',
      category: category || 'Software Development',
      eligibilityCriteria: eligibilityCriteria ? eligibilityCriteria.trim() : 'Open to all students with relevant skills',
      deadline: deadline ? new Date(deadline) : undefined,
      status: status || 'Open',
      poster: req.user.id
    });

    res.status(201).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Open / Published Bounties for Students and public listing
 * Filtering: search query, tags/skills, difficulty, sorting
 * Excludes Drafts, Cancelled, Deleted, and Expired (unless requested)
 */
export const getOpenBounties = async (req, res, next) => {
  try {
    const { search, skill, tag, difficulty, status, sort, includeExpired } = req.query;

    const query = {
      isDeleted: { $ne: true }
    };

    // By default, show active opportunities suitable for students to claim/apply
    if (status && status !== 'all') {
      query.status = status;
    } else {
      // Exclude bounties that are already claimed/applied for by any student
      query.status = 'Open';
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { applications: { $size: 0 } },
          { applications: { $exists: false } }
        ]
      });
      query.$and.push({
        $or: [
          { assignedTo: { $exists: false } },
          { assignedTo: null }
        ]
      });
    }

    // Exclude expired unless explicitly requested
    if (includeExpired !== 'true') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { deadline: { $exists: false } },
          { deadline: null },
          { deadline: { $gte: new Date() } }
        ]
      });
    }

    // Text search in title, description, and tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
          { requiredSkills: searchRegex },
          { category: searchRegex }
        ]
      });
    }

    // Skill or Tag filter
    const targetSkill = skill || tag;
    if (targetSkill && targetSkill.trim()) {
      const skillRegex = new RegExp(targetSkill.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { tags: skillRegex },
          { requiredSkills: skillRegex }
        ]
      });
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    // Sort order
    let sortOption = '-createdAt';
    if (sort === 'reward_high') sortOption = '-rewardAmount';
    if (sort === 'reward_low') sortOption = 'rewardAmount';
    if (sort === 'deadline_soon') sortOption = 'deadline';
    if (sort === 'oldest') sortOption = 'createdAt';

    const bounties = await Bounty.find(query)
      .populate('poster', 'name email avatar alumniProfile.company alumniProfile.designation alumniProfile.graduationYear')
      .populate('assignedTo', 'name email avatar studentProfile.skills')
      .sort(sortOption);

    // If student is logged in, attach helper flags
    const currentUserId = req.user?.id ? String(req.user.id) : null;
    const mappedBounties = bounties.map(b => {
      const doc = b.toObject();
      if (currentUserId) {
        const userApp = doc.applications?.find(a => String(a.student) === currentUserId || String(a.student?._id) === currentUserId);
        doc.hasApplied = !!userApp;
        doc.myApplicationStatus = userApp ? userApp.status : null;
        doc.isAssignedToMe = String(doc.assignedTo?._id || doc.assignedTo) === currentUserId;
      }
      return doc;
    });

    res.status(200).json({ success: true, count: mappedBounties.length, data: mappedBounties });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Bounties created by the logged-in Alumni
 * Populates full student profiles for applications & submissions
 */
export const getMyBounties = async (req, res, next) => {
  try {
    const bounties = await Bounty.find({
      poster: req.user.id,
      isDeleted: { $ne: true }
    })
      .populate('applications.student', 'name email avatar studentProfile')
      .populate('submissions.student', 'name email avatar studentProfile')
      .populate('assignedTo', 'name email avatar studentProfile')
      .populate('awardedTo', 'name email avatar studentProfile')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bounties.length, data: bounties });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Bounties the logged-in student has applied for, is assigned to, or submitted work for
 */
export const getMyStudentBounties = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const bounties = await Bounty.find({
      isDeleted: { $ne: true },
      $or: [
        { 'applications.student': studentId },
        { assignedTo: studentId },
        { 'submissions.student': studentId }
      ]
    })
      .populate('poster', 'name email avatar alumniProfile.company alumniProfile.designation')
      .populate('assignedTo', 'name email avatar studentProfile')
      .sort('-updatedAt');

    res.status(200).json({ success: true, count: bounties.length, data: bounties });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single bounty details
 */
export const getBountyById = async (req, res, next) => {
  try {
    const bounty = await Bounty.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true }
    })
      .populate('poster', 'name email avatar alumniProfile.company alumniProfile.designation alumniProfile.graduationYear')
      .populate('assignedTo', 'name email avatar studentProfile')
      .populate('applications.student', 'name email avatar studentProfile')
      .populate('submissions.student', 'name email avatar studentProfile')
      .populate('awardedTo', 'name email avatar studentProfile');

    if (!bounty) {
      return res.status(404).json({ success: false, message: 'Bounty not found' });
    }

    res.status(200).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};

/**
 * Update / Edit Bounty
 * Role: Poster (Alumni) or Admin
 */
export const updateBounty = async (req, res, next) => {
  try {
    const bounty = await Bounty.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true }
    });

    if (!bounty) {
      return res.status(404).json({ success: false, message: 'Bounty not found' });
    }

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this bounty' });
    }

    const {
      title,
      description,
      taskInstructions,
      rewardAmount,
      rewardCurrency,
      tags,
      requiredSkills,
      difficulty,
      category,
      eligibilityCriteria,
      deadline,
      status
    } = req.body;

    if (title !== undefined) bounty.title = title.trim();
    if (description !== undefined) bounty.description = description.trim();
    if (taskInstructions !== undefined) bounty.taskInstructions = taskInstructions.trim();
    if (rewardAmount !== undefined) bounty.rewardAmount = Number(rewardAmount);
    if (rewardCurrency !== undefined) bounty.rewardCurrency = rewardCurrency;

    const skillsList = requiredSkills !== undefined ? requiredSkills : tags;
    if (skillsList !== undefined) {
      const normalizedSkills = Array.isArray(skillsList)
        ? skillsList.map(s => String(s).trim()).filter(Boolean)
        : String(skillsList).split(',').map(s => s.trim()).filter(Boolean);
      bounty.tags = normalizedSkills;
      bounty.requiredSkills = normalizedSkills;
    }

    if (difficulty !== undefined) bounty.difficulty = difficulty;
    if (category !== undefined) bounty.category = category;
    if (eligibilityCriteria !== undefined) bounty.eligibilityCriteria = eligibilityCriteria.trim();
    if (deadline !== undefined) bounty.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) bounty.status = status;

    await bounty.save();

    res.status(200).json({ success: true, data: bounty });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Bounty (Soft delete)
 * Role: Poster (Alumni) or Admin
 */
export const deleteBounty = async (req, res, next) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) {
      return res.status(404).json({ success: false, message: 'Bounty not found' });
    }

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this bounty' });
    }

    bounty.isDeleted = true;
    bounty.status = 'Cancelled';
    await bounty.save();

    res.status(200).json({ success: true, message: 'Bounty deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Student applies or expresses interest in an Open bounty
 * Role: Student, Admin
 */
export const applyForBounty = async (req, res, next) => {
  try {
    const bountyId = req.params.id;
    const { pitch, relevantSkills, portfolioUrl } = req.body;

    const bounty = await Bounty.findOne({ _id: bountyId, isDeleted: { $ne: true } });
    if (!bounty) {
      return res.status(404).json({ success: false, message: 'Bounty not found' });
    }

    if (bounty.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `This bounty is currently ${bounty.status} and cannot accept new applications.`
      });
    }

    if (bounty.poster.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own bounty'
      });
    }

    // Check if another student has already claimed or applied for this bounty
    const hasApplication = bounty.applications && bounty.applications.length > 0;
    if (hasApplication || bounty.assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'This bounty has already been claimed by another student and is no longer available.'
      });
    }

    const skills = relevantSkills || req.user.studentProfile?.skills || [];
    const skillsArray = Array.isArray(skills)
      ? skills
      : String(skills).split(',').map(s => s.trim()).filter(Boolean);

    bounty.applications.push({
      student: req.user.id,
      pitch: pitch || '',
      relevantSkills: skillsArray,
      portfolioUrl: portfolioUrl || req.user.studentProfile?.portfolioUrl || req.user.studentProfile?.githubUrl || '',
      status: 'Approved',
      appliedAt: new Date()
    });

    // When one student applies, lock and assign the bounty to them so it is immediately removed for all other students
    bounty.assignedTo = req.user.id;
    bounty.assignedAt = new Date();
    bounty.status = 'In Progress';

    await bounty.save();

    res.status(200).json({
      success: true,
      message: 'Bounty claimed successfully! This task is now reserved for you and removed from other students\' listings.',
      data: bounty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Alumni reviews student application (Approve / Reject)
 * Approving an application assigns the bounty to the student and marks status as 'Assigned'
 * Role: Poster (Alumni) or Admin
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id: bountyId, appId } = req.params;
    const { status } = req.body; // 'Approved' | 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Approved or Rejected' });
    }

    const bounty = await Bounty.findOne({ _id: bountyId, isDeleted: { $ne: true } });
    if (!bounty) {
      return res.status(404).json({ success: false, message: 'Bounty not found' });
    }

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const application = bounty.applications.id(appId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.reviewedAt = new Date();

    if (status === 'Approved') {
      bounty.assignedTo = application.student;
      bounty.assignedAt = new Date();
      bounty.status = 'Assigned';
    } else if (status === 'Rejected') {
      // Reopen bounty so other students can apply!
      bounty.applications = [];
      bounty.assignedTo = null;
      bounty.assignedAt = null;
      bounty.status = 'Open';
    }

    await bounty.save();

    // Populate and return
    const populatedBounty = await Bounty.findById(bounty._id)
      .populate('applications.student', 'name email avatar studentProfile')
      .populate('submissions.student', 'name email avatar studentProfile')
      .populate('assignedTo', 'name email avatar studentProfile');

    res.status(200).json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      data: populatedBounty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign Bounty directly to an eligible student
 * Role: Poster (Alumni) or Admin
 */
export const assignBounty = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const bountyId = req.params.id;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const bounty = await Bounty.findOne({ _id: bountyId, isDeleted: { $ne: true } });
    if (!bounty) {
      return res.status(404).json({ success: false, message: 'Bounty not found' });
    }

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    bounty.assignedTo = studentId;
    bounty.assignedAt = new Date();
    bounty.status = 'Assigned';

    // If student has an application, mark it as Approved
    const studentApp = bounty.applications.find(a => a.student.toString() === studentId);
    if (studentApp) {
      studentApp.status = 'Approved';
      studentApp.reviewedAt = new Date();
    }

    await bounty.save();

    const populatedBounty = await Bounty.findById(bounty._id)
      .populate('applications.student', 'name email avatar studentProfile')
      .populate('submissions.student', 'name email avatar studentProfile')
      .populate('assignedTo', 'name email avatar studentProfile');

    res.status(200).json({
      success: true,
      message: 'Bounty successfully assigned to student',
      data: populatedBounty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Solution / Deliverables for a Bounty
 * Role: Student, Admin
 */
export const submitSolution = async (req, res, next) => {
  try {
    const { solutionUrl, message } = req.body;
    const bountyId = req.params.id;

    if (!solutionUrl) {
      return res.status(400).json({ success: false, message: 'Solution URL is required' });
    }

    const bounty = await Bounty.findOne({ _id: bountyId, isDeleted: { $ne: true } });
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found' });
    if (bounty.status === 'Completed') return res.status(400).json({ success: false, message: 'Bounty is already completed' });

    // Check if already submitted
    const existingSubmission = bounty.submissions.find(s => s.student && s.student.toString() === req.user.id);
    if (existingSubmission) {
      existingSubmission.solutionUrl = solutionUrl;
      existingSubmission.message = message || existingSubmission.message;
      existingSubmission.status = 'Pending';
      existingSubmission.submittedAt = new Date();
    } else {
      bounty.submissions.push({
        student: req.user.id,
        solutionUrl,
        message: message || '',
        status: 'Pending',
        submittedAt: new Date()
      });
    }

    // Update status to Submitted
    bounty.status = 'Submitted';

    await bounty.save();

    res.status(200).json({
      success: true,
      message: 'Deliverables submitted successfully! The alumni will review your work.',
      data: bounty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review Submission: Approve (Completed + Reward) or Request Revision or Reject
 * Role: Poster (Alumni) or Admin
 */
export const reviewSubmission = async (req, res, next) => {
  try {
    const { id: bountyId, submissionId } = req.params;
    const { action, feedback } = req.body; // action: 'approve' | 'revision' | 'reject'

    const bounty = await Bounty.findOne({ _id: bountyId, isDeleted: { $ne: true } });
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found' });

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const submission = bounty.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    submission.reviewedAt = new Date();
    if (feedback) submission.feedback = feedback;

    if (action === 'approve') {
      submission.status = 'Accepted';
      bounty.status = 'Completed';
      bounty.awardedTo = submission.student;

      // Reject other submissions
      bounty.submissions.forEach(sub => {
        if (sub._id.toString() !== submissionId) {
          sub.status = 'Rejected';
        }
      });

      // Award student karma points
      await User.findByIdAndUpdate(submission.student, {
        $inc: { 'studentProfile.karma': bounty.rewardAmount }
      });
    } else if (action === 'revision') {
      submission.status = 'Revision Requested';
      bounty.status = 'In Progress';
    } else if (action === 'reject') {
      submission.status = 'Rejected';
      bounty.status = 'Open';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be approve, revision, or reject' });
    }

    await bounty.save();

    const populatedBounty = await Bounty.findById(bounty._id)
      .populate('applications.student', 'name email avatar studentProfile')
      .populate('submissions.student', 'name email avatar studentProfile')
      .populate('assignedTo', 'name email avatar studentProfile')
      .populate('awardedTo', 'name email avatar studentProfile');

    res.status(200).json({
      success: true,
      message: action === 'approve'
        ? 'Bounty approved and awarded to student! Karma points transferred.'
        : action === 'revision'
          ? 'Revision requested. Student has been notified.'
          : 'Submission rejected.',
      data: populatedBounty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Award Bounty (Backward-compatible wrapper around review approve)
 * Role: Poster (Alumni) or Admin
 */
export const awardBounty = async (req, res, next) => {
  try {
    const { submissionId } = req.body;
    const bountyId = req.params.id;

    const bounty = await Bounty.findOne({ _id: bountyId, isDeleted: { $ne: true } });
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found' });

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const submission = bounty.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    submission.status = 'Accepted';
    submission.reviewedAt = new Date();
    bounty.status = 'Completed';
    bounty.awardedTo = submission.student;

    bounty.submissions.forEach(sub => {
      if (sub._id.toString() !== submissionId) {
        sub.status = 'Rejected';
      }
    });

    await User.findByIdAndUpdate(submission.student, {
      $inc: { 'studentProfile.karma': bounty.rewardAmount }
    });

    await bounty.save();

    res.status(200).json({
      success: true,
      message: 'Bounty awarded and payout transferred!',
      data: bounty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reopen a bounty that was claimed or assigned so other students can apply again
 * Role: Poster (Alumni) or Admin
 */
export const reopenBounty = async (req, res, next) => {
  try {
    const bounty = await Bounty.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found' });

    const isOwner = bounty.poster.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Unauthorized' });

    bounty.assignedTo = null;
    bounty.assignedAt = null;
    bounty.applications = [];
    bounty.status = 'Open';
    await bounty.save();

    const populatedBounty = await Bounty.findById(bounty._id)
      .populate('applications.student', 'name email avatar studentProfile')
      .populate('submissions.student', 'name email avatar studentProfile')
      .populate('assignedTo', 'name email avatar studentProfile');

    res.status(200).json({
      success: true,
      message: 'Bounty reopened! It is now visible and available for other students to apply.',
      data: populatedBounty
    });
  } catch (error) {
    next(error);
  }
};

