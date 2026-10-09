import { Scholarship } from '../models/Scholarship.js';

export const getScholarships = async (req, res, next) => {
  try {
    const scholarships = await Scholarship.find();
    res.status(200).json({ success: true, data: scholarships });
  } catch (error) {
    next(error);
  }
};

export const autoApply = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });

    // In production, this would trigger an external API or Puppeteer script
    res.status(200).json({ success: true, message: 'Auto-application submitted successfully via API' });
  } catch (error) {
    next(error);
  }
};
