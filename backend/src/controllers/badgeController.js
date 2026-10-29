import { SkillBadge } from '../models/SkillBadge.js';
import crypto from 'crypto';

export const getMyBadges = async (req, res, next) => {
  try {
    const badges = await SkillBadge.find({ student: req.user.id });
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
};

export const issueBadge = async (req, res, next) => {
  try {
    const { badgeName, issuer } = req.body;
    // Simulate smart contract generation
    const contractAddress = '0x' + crypto.randomBytes(20).toString('hex');
    
    const badge = await SkillBadge.create({
      student: req.user.id,
      badgeName,
      issuer,
      contractAddress
    });
    
    res.status(201).json({ success: true, data: badge });
  } catch (error) {
    next(error);
  }
};
