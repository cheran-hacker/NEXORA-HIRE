import { Certificate } from '../models/Certificate.js';

export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id }).sort('-issueDate');
    res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error) { next(error); }
};

export const addCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: certificate });
  } catch (error) { next(error); }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
