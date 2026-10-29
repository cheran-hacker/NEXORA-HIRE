import { HardwarePool } from '../models/HardwarePool.js';

export const getAvailableHardware = async (req, res, next) => {
  try {
    let items = await HardwarePool.find().populate('owner', 'name');

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const borrowHardware = async (req, res, next) => {
  try {
    const item = await HardwarePool.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status === 'Borrowed') return res.status(400).json({ message: 'Item already borrowed' });

    item.status = 'Borrowed';
    item.borrower = req.user.id;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
export const listHardware = async (req, res, next) => {
  try {
    const { itemName, category, collateralKarma } = req.body;
    
    if (!itemName || !category || collateralKarma === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const item = await HardwarePool.create({
      owner: req.user.id,
      itemName,
      category,
      collateralKarma,
      status: 'Available'
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
