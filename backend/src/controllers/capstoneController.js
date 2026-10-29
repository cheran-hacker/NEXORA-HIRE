import { CapstoneProject } from '../models/CapstoneProject.js';

export const getCapstones = async (req, res, next) => {
  try {
    let capstones = await CapstoneProject.find();
    res.status(200).json({ success: true, data: capstones });
  } catch (error) {
    next(error);
  }
};

export const investInCapstone = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const capstone = await CapstoneProject.findById(req.params.id);
    if (!capstone) return res.status(404).json({ message: 'Capstone not found' });
    
    capstone.investors.push({ alumniId: req.user.id, amount });
    capstone.currentFunding += amount;
    await capstone.save();
    
    res.status(200).json({ success: true, data: capstone });
  } catch (error) {
    next(error);
  }
};

export const createCapstone = async (req, res, next) => {
  try {
    const { title, pitch, fundingGoal, equityOffered, teamMembers, milestones } = req.body;
    
    const capstone = await CapstoneProject.create({
      title, pitch, fundingGoal, equityOffered,
      teamMembers: teamMembers || [req.user.id],
      milestones: milestones || [],
      status: 'Pending Approval'
    });

    res.status(201).json({ success: true, data: capstone });
  } catch (error) {
    next(error);
  }
};

export const approveCapstone = async (req, res, next) => {
  try {
    const capstone = await CapstoneProject.findById(req.params.id);
    if (!capstone) return res.status(404).json({ message: 'Capstone not found' });

    capstone.status = req.body.status || 'Approved';
    capstone.advisorId = req.user.id;
    await capstone.save();

    res.status(200).json({ success: true, data: capstone });
  } catch (error) {
    next(error);
  }
};
