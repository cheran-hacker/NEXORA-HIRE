import { PivotRecord } from '../models/PivotRecord.js';

export const getPivotRecords = async (req, res, next) => {
  try {
    const records = await PivotRecord.find()
      .populate('student', 'name studentProfile.education')
      .sort('-dateOfFailure');
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

export const createPivotRecord = async (req, res, next) => {
  try {
    const { failureTitle, context, whatWentWrong, keyTakeaway } = req.body;
    
    if (!failureTitle || !context || !whatWentWrong || !keyTakeaway) {
      return res.status(400).json({ success: false, message: 'failureTitle, context, whatWentWrong, and keyTakeaway are required to create a pivot record.' });
    }

    req.body.student = req.user.id;
    const record = await PivotRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
