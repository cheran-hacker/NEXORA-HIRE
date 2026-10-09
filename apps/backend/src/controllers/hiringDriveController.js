import { HiringDrive } from '../models/HiringDrive.js';

export const getHiringDrives = async (req, res, next) => {
  try {
    const drives = await HiringDrive.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    next(error);
  }
};

export const createHiringDrive = async (req, res, next) => {
  try {
    const drive = await HiringDrive.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
};

export const updateHiringDrive = async (req, res, next) => {
  try {
    const drive = await HiringDrive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
};

export const deleteHiringDrive = async (req, res, next) => {
  try {
    const drive = await HiringDrive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
