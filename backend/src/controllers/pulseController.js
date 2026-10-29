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

const ZONE_COORDINATES = {
  'Library': [77.5946, 12.9716],
  'Engineering': [77.5950, 12.9720],
  'Business': [77.5940, 12.9710],
  'Cafeteria': [77.5960, 12.9730],
  'Quad': [77.5955, 12.9725],
  'Sports Complex': [77.5970, 12.9740],
  'Admin': [77.5930, 12.9700]
};

export const checkInPulse = async (req, res, next) => {
  try {
    const { zone, activityType } = req.body;
    const coords = ZONE_COORDINATES[zone] || [77.5946, 12.9716];
    const ping = await LocationPing.create({
      user: req.user.id,
      zone,
      activityType,
      location: {
        type: 'Point',
        coordinates: coords
      }
    });
    res.status(201).json({ success: true, data: ping });
  } catch (error) {
    next(error);
  }
};
