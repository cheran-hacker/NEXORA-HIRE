import { KarmaLog } from '../models/KarmaLog.js';
import { User } from '../models/User.js';

export const getKarmaLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await KarmaLog.aggregate([
      {
        $group: {
          _id: '$user',
          totalKarma: { $sum: '$points' },
          recentAction: { $last: '$action' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          totalKarma: 1,
          recentAction: 1,
          name: '$userDetails.name',
          role: '$userDetails.role'
        }
      },
      { $sort: { totalKarma: -1 } },
      { $limit: 50 }
    ]);

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
};

export const logKarma = async (req, res, next) => {
  try {
    const { action, points } = req.body;
    const log = await KarmaLog.create({
      user: req.user.id,
      action,
      points
    });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
