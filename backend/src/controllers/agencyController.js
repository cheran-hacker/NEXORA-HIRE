import { StudentAgency } from '../models/StudentAgency.js';

export const getAgencies = async (req, res, next) => {
  try {
    const agencies = await StudentAgency.find().populate('founders', 'name');
    res.status(200).json({ success: true, data: agencies });
  } catch (error) {
    next(error);
  }
};

export const createAgency = async (req, res, next) => {
  try {
    const { agencyName, tagline, specialties } = req.body;
    
    // Check if user is already a founder of another active agency
    const existing = await StudentAgency.findOne({ founders: req.user.id, status: 'Active' });
    if (existing) return res.status(400).json({ message: 'You are already in an active agency.' });

    const agency = await StudentAgency.create({
      agencyName,
      tagline,
      specialties,
      founders: [req.user.id] // Initially just the creator
    });
    
    res.status(201).json({ success: true, data: agency });
  } catch (error) {
    next(error);
  }
};

export const addFounder = async (req, res, next) => {
  try {
    const agency = await StudentAgency.findById(req.params.id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });
    
    if (!agency.founders.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.body;
    if (agency.founders.includes(userId)) return res.status(400).json({ message: 'User is already a founder' });
    
    if (agency.founders.length >= 5) return res.status(400).json({ message: 'Agency is full (Max 5)' });

    agency.founders.push(userId);
    await agency.save();

    res.status(200).json({ success: true, data: agency });
  } catch (error) {
    next(error);
  }
};
