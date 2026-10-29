import { ScavengerNode } from '../models/ScavengerNode.js';

export const getNodes = async (req, res, next) => {
  try {
    const nodes = await ScavengerNode.find();
    res.status(200).json({ success: true, data: nodes });
  } catch (error) {
    next(error);
  }
};

export const scanNode = async (req, res, next) => {
  try {
    const { nodeId } = req.body;
    
    const node = await ScavengerNode.findOne({ nodeId });
    if (!node) return res.status(404).json({ message: 'Invalid QR Code / Node ID' });

    // In a real system, we'd log that the user unlocked this node.
    res.status(200).json({ success: true, data: node });
  } catch (error) {
    next(error);
  }
};
