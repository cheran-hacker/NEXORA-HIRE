import express from 'express';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Post } from '../models/Post.js';

const router = express.Router();

// GET /api/health/stats - Returns real live data counts for the landing page
router.get('/stats', async (req, res) => {
  try {
    const [userCount, jobCount, postCount] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Post.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      users: userCount,
      jobs: jobCount,
      posts: postCount,
      status: 'operational'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/health - Basic server health
router.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

export default router;
