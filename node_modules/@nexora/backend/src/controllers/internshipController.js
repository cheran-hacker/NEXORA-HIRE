import { Internship } from '../models/Internship.js';

export const getInternships = async (req, res, next) => {
  try {
    const { skills, type, search } = req.query;
    let filter = { status: 'Open' };
    if (type) filter.type = type;
    if (skills) filter.skills = { $in: skills.split(',').map(s => s.trim()) };
    if (search) filter.$text = { $search: search };

    const internships = await Internship.find(filter).sort('-createdAt');
    res.status(200).json({ success: true, count: internships.length, data: internships });
  } catch (error) { next(error); }
};

export const getInternshipById = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('recruiterId', 'name avatar recruiterProfile.companyName');
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
    res.status(200).json({ success: true, data: internship });
  } catch (error) { next(error); }
};

export const createInternship = async (req, res, next) => {
  try {
    const internship = await Internship.create({ ...req.body, recruiterId: req.user.id });
    res.status(201).json({ success: true, data: internship });
  } catch (error) { next(error); }
};
