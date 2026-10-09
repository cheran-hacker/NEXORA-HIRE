import { ResearchPaper } from '../models/ResearchPaper.js';

export const getPapers = async (req, res, next) => {
  try {
    let papers = await ResearchPaper.find();
    
    // Filter out ones already swiped
    papers = papers.filter(p => !p.swipedRightBy.includes(req.user.id));

    // Fetch real skills from student profile
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.user.id);
    const userSkills = user?.studentProfile?.skills || [];
    const papersWithScores = papers.map(p => {
      const pObj = p.toObject();
      let matchCount = 0;
      if (pObj.tags && pObj.tags.length > 0) {
        matchCount = pObj.tags.filter(tag => userSkills.includes(tag)).length;
      }
      pObj.matchScore = Math.min(100, Math.round((matchCount / Math.max(1, pObj.tags.length)) * 100));
      return pObj;
    });

    papersWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, data: papersWithScores });
  } catch (error) {
    next(error);
  }
};

export const swipePaper = async (req, res, next) => {
  try {
    const { action } = req.body; // 'right' or 'left'
    const paper = await ResearchPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    if (action === 'right') {
      paper.swipedRightBy.push(req.user.id);
      await paper.save();
    }

    res.status(200).json({ success: true, message: `Swiped ${action}` });
  } catch (error) {
    next(error);
  }
};
