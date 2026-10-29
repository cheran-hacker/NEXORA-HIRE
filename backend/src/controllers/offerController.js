import { Offer } from '../models/Offer.js';

export const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create({ ...req.body, recruiter: req.user.id });
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

export const getMyOffers = async (req, res, next) => {
  try {
    // If student, get their offers. If recruiter, get offers they sent.
    const query = req.user.role === 'Student' ? { student: req.user.id } : { recruiter: req.user.id };
    const offers = await Offer.find(query)
      .populate('job', 'title company')
      .populate('student', 'name email')
      .populate('Placement', 'name company');
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

export const updateOfferStatus = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    // Only student can accept/reject their offer
    if (offer.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    offer.status = req.body.status;
    await offer.save();
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};
