import { ParkingLot } from '../models/ParkingLot.js';

export const getLots = async (req, res, next) => {
  try {
    const lots = await ParkingLot.find();
    res.status(200).json({ success: true, data: lots });
  } catch (error) {
    next(error);
  }
};

export const createLot = async (req, res, next) => {
  try {
    const lot = await ParkingLot.create(req.body);
    res.status(201).json({ success: true, data: lot });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const lot = await ParkingLot.findByIdAndUpdate(
      req.params.id, 
      { currentStatus: status, lastUpdatedBy: req.user.id },
      { new: true }
    );
    res.status(200).json({ success: true, data: lot });
  } catch (error) {
    next(error);
  }
};
