import { PeerReview } from '../models/PeerReview.js';

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await PeerReview.find({ recipient: req.user.id }).populate('reviewer', 'name');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const { recipientId, sharedProject, endorsementText, rating } = req.body;
    
    // In MVP, we just trust they worked together
    const review = await PeerReview.create({
      recipient: recipientId,
      reviewer: req.user.id,
      sharedProject,
      endorsementText,
      rating
    });
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
