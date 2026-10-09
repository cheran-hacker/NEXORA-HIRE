import { SpatialNode } from '../models/SpatialNode.js';

export const getNodes = async (req, res, next) => {
  try {
    const nodes = await SpatialNode.find();
    res.status(200).json({ success: true, count: nodes.length, data: nodes });
  } catch (error) {
    next(error);
  }
};

export const createNode = async (req, res, next) => {
  try {
    const { name, description, category, location, arContent } = req.body;
    const node = await SpatialNode.create({
      name,
      description,
      category,
      location,
      arContent
    });
    res.status(201).json({ success: true, data: node });
  } catch (error) {
    next(error);
  }
};
