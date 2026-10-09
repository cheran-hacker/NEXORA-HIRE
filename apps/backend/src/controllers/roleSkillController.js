import { RoleSkillMap } from '../models/RoleSkillMap.js';

export const getRoleSkillMaps = async (req, res, next) => {
  try {
    const maps = await RoleSkillMap.find().sort('roleName');
    res.status(200).json({ success: true, count: maps.length, data: maps });
  } catch (error) {
    next(error);
  }
};

export const getRoleSkillMap = async (req, res, next) => {
  try {
    const map = await RoleSkillMap.findById(req.params.id);
    if (!map) return res.status(404).json({ success: false, message: 'RoleSkillMap not found' });
    res.status(200).json({ success: true, data: map });
  } catch (error) {
    next(error);
  }
};

export const createRoleSkillMap = async (req, res, next) => {
  try {
    const map = await RoleSkillMap.create(req.body);
    res.status(201).json({ success: true, data: map });
  } catch (error) {
    next(error);
  }
};

export const updateRoleSkillMap = async (req, res, next) => {
  try {
    const map = await RoleSkillMap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!map) return res.status(404).json({ success: false, message: 'RoleSkillMap not found' });
    res.status(200).json({ success: true, data: map });
  } catch (error) {
    next(error);
  }
};

export const deleteRoleSkillMap = async (req, res, next) => {
  try {
    const map = await RoleSkillMap.findByIdAndDelete(req.params.id);
    if (!map) return res.status(404).json({ success: false, message: 'RoleSkillMap not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
