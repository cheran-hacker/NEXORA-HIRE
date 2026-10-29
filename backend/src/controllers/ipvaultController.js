import { IpVault } from '../models/IpVault.js';
import crypto from 'crypto';

export const getMyIPs = async (req, res, next) => {
  try {
    const ips = await IpVault.find({ student: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: ips });
  } catch (error) {
    next(error);
  }
};

export const secureIP = async (req, res, next) => {
  try {
    const { projectName, description } = req.body;
    
    // Simulate hashing the project files to create a unique fingerprint
    const fileHash = crypto.createHash('sha256').update(projectName + Date.now().toString()).digest('hex');
    const txId = '0x' + crypto.randomBytes(32).toString('hex'); // simulated blockchain tx

    const ip = await IpVault.create({
      student: req.user.id,
      projectName,
      description,
      fileHash,
      txId
    });

    res.status(201).json({ success: true, data: ip });
  } catch (error) {
    next(error);
  }
};
