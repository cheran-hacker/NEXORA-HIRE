import { Reel } from '../models/Reel.js';

export const getReels = async (req, res, next) => {
  try {
    const reels = await Reel.find().populate('author', 'name').sort('-createdAt');
    res.status(200).json({ success: true, data: reels });
  } catch (error) {
    next(error);
  }
};

export const createReel = async (req, res, next) => {
  try {
    const { videoUrl, caption, category } = req.body;
    const reel = await Reel.create({
      author: req.user.id,
      videoUrl,
      caption,
      category
    });
    res.status(201).json({ success: true, data: reel });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const index = reel.likes.indexOf(req.user.id);
    if (index === -1) {
      reel.likes.push(req.user.id);
    } else {
      reel.likes.splice(index, 1);
    }

    await reel.save();
    res.status(200).json({ success: true, data: reel });
  } catch (error) {
    next(error);
  }
};
