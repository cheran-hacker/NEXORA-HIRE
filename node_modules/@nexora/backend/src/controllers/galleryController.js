import { PortfolioGallery } from '../models/PortfolioGallery.js';

export const getMyGallery = async (req, res, next) => {
  try {
    let gallery = await PortfolioGallery.findOne({ student: req.user.id });
    if (!gallery) {
      gallery = await PortfolioGallery.create({
        student: req.user.id,
        sceneConfig: { walls: 'concrete', lighting: 'neon' },
        projects: [
          { title: 'AI Chess Bot', image: 'https://picsum.photos/400/300?1', link: '#' },
          { title: 'React E-Commerce', image: 'https://picsum.photos/400/300?2', link: '#' }
        ]
      });
    }
    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

export const updateGallery = async (req, res, next) => {
  try {
    const { sceneConfig, projects } = req.body;
    const gallery = await PortfolioGallery.findOneAndUpdate(
      { student: req.user.id },
      { sceneConfig, projects },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};
