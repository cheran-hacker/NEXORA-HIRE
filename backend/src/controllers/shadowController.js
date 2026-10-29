import { ShadowProgram } from '../models/ShadowProgram.js';

export const getShadowPrograms = async (req, res, next) => {
  try {
    let programs = await ShadowProgram.find();
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

export const joinShadowProgram = async (req, res, next) => {
  try {
    const program = await ShadowProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    if (!program.participants.includes(req.user.id)) {
      program.participants.push(req.user.id);
      await program.save();
    }
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};
