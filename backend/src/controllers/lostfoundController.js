import { FoundItem } from '../models/FoundItem.js';

export const getFoundItems = async (req, res, next) => {
  try {
    const query = { status: 'Unclaimed' };
    
    // Simulate AI Tag / Keyword search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { description: searchRegex },
        { aiTags: searchRegex }
      ];
    }

    const items = await FoundItem.find(query).populate('finder', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const createFoundItem = async (req, res, next) => {
  try {
    const { description, locationFound } = req.body;
    
    // Simulate AI Tagging based on description
    const aiTags = [];
    const descLower = description.toLowerCase();
    if (descLower.includes('bottle')) aiTags.push('Water Bottle');
    if (descLower.includes('blue')) aiTags.push('Color: Blue');
    if (descLower.includes('key')) aiTags.push('Keys');
    if (descLower.includes('phone') || descLower.includes('iphone')) aiTags.push('Electronics', 'Phone');
    
    const item = await FoundItem.create({
      finder: req.user.id,
      description,
      locationFound,
      aiTags
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const claimItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.status = 'Claimed';
    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
