import { PortfolioRule } from '../models/PortfolioRule.js';

export const getRules = async (req, res, next) => {
  try {
    const rules = await PortfolioRule.find({ student: req.user.id });
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const { ruleName, urlParameter, highlightedSkills, hiddenSections } = req.body;
    
    const rule = await PortfolioRule.create({
      student: req.user.id,
      ruleName,
      urlParameter,
      highlightedSkills,
      hiddenSections
    });
    
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const rule = await PortfolioRule.findOneAndDelete({ _id: req.params.id, student: req.user.id });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
