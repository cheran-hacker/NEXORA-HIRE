import { ApiKey } from '../models/ApiKey.js';
import crypto from 'crypto';

export const getMyKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find({ student: req.user.id });
    res.status(200).json({ success: true, data: keys });
  } catch (error) {
    next(error);
  }
};

export const generateKey = async (req, res, next) => {
  try {
    const { appName } = req.body;
    
    // Generate a random mock API key string
    const keyString = 'nx_' + crypto.randomBytes(24).toString('hex');
    
    const key = await ApiKey.create({
      student: req.user.id,
      appName,
      keyString
    });
    
    res.status(201).json({ success: true, data: key });
  } catch (error) {
    next(error);
  }
};

export const revokeKey = async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, student: req.user.id });
    if (!key) return res.status(404).json({ message: 'Key not found' });
    
    key.status = 'Revoked';
    await key.save();
    
    res.status(200).json({ success: true, data: key });
  } catch (error) {
    next(error);
  }
};
