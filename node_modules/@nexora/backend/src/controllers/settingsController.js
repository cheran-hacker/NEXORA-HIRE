import { SystemSetting } from '../models/SystemSetting.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find();
    // Convert to a key-value object
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    res.status(200).json({ success: true, data: settingsObj });
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};
