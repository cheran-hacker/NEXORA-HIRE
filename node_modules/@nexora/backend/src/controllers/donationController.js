import { Donation } from '../models/Donation.js';

export const createDonation = async (req, res, next) => {
  try {
    const donation = await Donation.create({ ...req.body, alumni: req.user.id });
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ alumni: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    next(error);
  }
};

export const getAllDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find()
      .populate('alumni', 'name email avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    next(error);
  }
};
