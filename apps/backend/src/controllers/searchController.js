import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Club } from '../models/Club.js';
import { Bounty } from '../models/Bounty.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, data: { users: [], jobs: [], clubs: [], bounties: [] } });
    }

    const regex = new RegExp(q, 'i');

    const [users, jobs, clubs, bounties] = await Promise.all([
      User.find({
        $or: [
          { name: regex },
          { email: regex },
          { role: regex }
        ]
      }).select('name email role avatar').limit(5),
      
      Job.find({
        $or: [
          { title: regex },
          { company: regex },
          { location: regex },
          { 'skillsRequired': regex }
        ],
        status: 'Active'
      }).select('title company type location').limit(5),

      Club.find({
        $or: [
          { name: regex },
          { description: regex },
          { category: regex }
        ]
      }).select('name category memberCount').limit(5),

      Bounty.find({
        $or: [
          { title: regex },
          { description: regex },
          { category: regex }
        ],
        status: 'Open'
      }).select('title reward category status').limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        jobs,
        clubs,
        bounties
      }
    });

  } catch (error) {
    next(error);
  }
};
