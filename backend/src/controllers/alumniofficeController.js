import { AlumniOfficeHour } from '../models/AlumniOfficeHour.js';

export const getLiveRooms = async (req, res, next) => {
  try {
    let rooms = await AlumniOfficeHour.find({ isLive: true });

    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};
