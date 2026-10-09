import { FoodRescue } from '../models/FoodRescue.js';

export const getRescues = async (req, res, next) => {
  try {
    const rescues = await FoodRescue.find({ status: 'Active' }).sort('-createdAt');
    res.status(200).json({ success: true, data: rescues });
  } catch (error) {
    next(error);
  }
};

export const triggerRescue = async (req, res, next) => {
  try {
    const { cafeteriaName, foodDescription, boxesAvailable } = req.body;
    const rescue = await FoodRescue.create({
      cafeteriaName,
      foodDescription,
      boxesAvailable
    });
    // In production: trigger WebSocket/Push notifications here
    res.status(201).json({ success: true, data: rescue });
  } catch (error) {
    next(error);
  }
};

export const claimBox = async (req, res, next) => {
  try {
    const rescue = await FoodRescue.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: 'Rescue alert not found' });
    if (rescue.status !== 'Active' || rescue.boxesAvailable <= 0) return res.status(400).json({ message: 'No boxes left' });

    if (rescue.claimedBy.includes(req.user.id)) return res.status(400).json({ message: 'You already claimed a box' });

    rescue.claimedBy.push(req.user.id);
    rescue.boxesAvailable -= 1;
    
    if (rescue.boxesAvailable === 0) {
      rescue.status = 'SoldOut';
    }

    await rescue.save();
    res.status(200).json({ success: true, data: rescue });
  } catch (error) {
    next(error);
  }
};
