import { LocationPing } from '../models/LocationPing.js';

export const getPulseMap = async (req, res, next) => {
  try {
    // Aggregate pings by zone to get the "heat" of each zone
    const heatmap = await LocationPing.aggregate([
      {
        $group: {
          _id: '$zone',
          count: { $sum: 1 },
          recentActivity: { $last: '$activityType' }
        }
      },
      {
        $project: {
          zone: '$_id',
          intensity: '$count',
          recentActivity: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({ success: true, data: heatmap });
  } catch (error) {
    next(error);
  }
};

export const checkInPulse = async (req, res, next) => {
  try {
    const { zone, activityType } = req.body;
    const ping = await LocationPing.create({
      user: req.user.id,
      zone,
      activityType
    });
    res.status(201).json({ success: true, data: ping });
  } catch (error) {
    next(error);
  }
};
