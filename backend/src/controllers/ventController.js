import { VentPost } from '../models/VentPost.js';

export const getVents = async (req, res, next) => {
  try {
    // Only return vents that have not expired
    const vents = await VentPost.find({ expiresAt: { $gt: new Date() } }).sort('-createdAt').limit(50);
    res.status(200).json({ success: true, data: vents });
  } catch (error) {
    next(error);
  }
};

export const createVent = async (req, res, next) => {
  try {
    const { content, color } = req.body;
    const vent = await VentPost.create({
      content,
      color: color || '#e2e8f0'
    });
    
    // Broadcast real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new_vent', vent);
    }

    res.status(201).json({ success: true, data: vent });
  } catch (error) {
    next(error);
  }
};
