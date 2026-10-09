import { StartupSprint } from '../models/StartupSprint.js';
import { User } from '../models/User.js';

export const getSprints = async (req, res, next) => {
  try {
    const sprints = await StartupSprint.find().sort('-createdAt');
    res.status(200).json({ success: true, data: sprints });
  } catch (error) {
    next(error);
  }
};

export const createSprint = async (req, res, next) => {
  try {
    const { companyName, projectBrief, bountyAmount, requiredRoles, deadline, goals } = req.body;
    const sprint = await StartupSprint.create({
      companyName,
      projectBrief,
      bountyAmount,
      requiredRoles,
      deadline,
      goals: goals || []
    });
    res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    next(error);
  }
};

export const lockInSprint = async (req, res, next) => {
  try {
    const sprint = await StartupSprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    if (sprint.status !== 'Open') return res.status(400).json({ message: 'Sprint is already locked or completed' });

    sprint.status = 'Locked_In';
    sprint.sprintStartTime = new Date();
    // For MVP, simulating the current user joining as the first team member
    sprint.team.push({ student: req.user.id, role: sprint.requiredRoles[0] });

    await sprint.save();
    res.status(200).json({ success: true, data: sprint });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const { goalId, completed } = req.body;
    const sprint = await StartupSprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    
    const goal = sprint.goals.id(goalId);
    if (goal) goal.completed = completed;
    
    await sprint.save();
    res.status(200).json({ success: true, data: sprint });
  } catch (error) {
    next(error);
  }
};

export const failSprint = async (req, res, next) => {
  try {
    const sprint = await StartupSprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    
    sprint.status = 'Completed';
    await sprint.save();

    // Deduct karma from all team members
    for (const member of sprint.team) {
      await User.findByIdAndUpdate(member.student, {
        $inc: { 'studentProfile.karma': -20 } // -20 karma for failing
      });
    }

    res.status(200).json({ success: true, message: 'Sprint failed. Karma deducted.', data: sprint });
  } catch (error) {
    next(error);
  }
};
