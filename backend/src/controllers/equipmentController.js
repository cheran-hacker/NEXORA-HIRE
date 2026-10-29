import { Equipment } from '../models/Equipment.js';

export const getEquipments = async (req, res, next) => {
  try {
    const equipments = await Equipment.find({ status: 'Available' })
      .populate('owner', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: equipments.length, data: equipments });
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    const equipment = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};

export const requestEquipment = async (req, res, next) => {
  try {
    const equipmentId = req.params.id;
    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    if (equipment.owner.toString() === req.user.id) return res.status(400).json({ message: 'You own this item' });
    if (equipment.status !== 'Available') return res.status(400).json({ message: 'Item is not currently available' });

    equipment.status = 'Pending Handoff';
    equipment.currentBorrower = req.user.id;
    await equipment.save();

    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};
