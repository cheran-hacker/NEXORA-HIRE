import { EmergencyAlert } from '../models/EmergencyAlert.js';

export const getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'Active' }).populate('reportedBy', 'name');
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

export const triggerSOS = async (req, res, next) => {
  try {
    const { location } = req.body;
    const alert = await EmergencyAlert.create({
      reportedBy: req.user.id,
      location
    });
    // In production, this would fire a WebSocket broadcast and SMS to campus security
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Resolved' or 'FalseAlarm'
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.status = status;
    alert.resolvedBy = req.user.id;
    await alert.save();

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};
