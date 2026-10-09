import { Club } from '../models/Club.js';

export const getClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('president', 'name email');
    res.status(200).json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    next(error);
  }
};

export const createClub = async (req, res, next) => {
  try {
    const club = await Club.create({ ...req.body, president: req.user.id });
    res.status(201).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

export const joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    
    // Check if already a member
    const isMember = club.members.find(m => m.user.toString() === req.user.id);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    club.members.push({ user: req.user.id, role: 'Member', status: 'Pending' });
    await club.save();
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

export const approveMember = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    
    // Only president or Admin can approve
    if (club.president.toString() !== req.user.id) {
      // simplified check, ideally check role too
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { userId, status } = req.body;
    const member = club.members.find(m => m.user.toString() === userId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    member.status = status; // 'Approved' or 'Rejected'
    await club.save();
    
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

export const getMyClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find({ 'members.user': req.user.id }).populate('president', 'name');
    res.status(200).json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    next(error);
  }
};
