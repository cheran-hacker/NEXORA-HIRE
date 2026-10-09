import { ProjectAutopsy } from '../models/ProjectAutopsy.js';

export const getAutopsies = async (req, res, next) => {
  try {
    const autopsies = await ProjectAutopsy.find().populate('author', 'name').sort('-createdAt');
    res.status(200).json({ success: true, data: autopsies });
  } catch (error) {
    next(error);
  }
};

export const createAutopsy = async (req, res, next) => {
  try {
    const { projectName, whatWentWrong, rootCause, lessonsLearned } = req.body;
    const autopsy = await ProjectAutopsy.create({
      author: req.user.id,
      projectName,
      whatWentWrong,
      rootCause,
      lessonsLearned
    });
    res.status(201).json({ success: true, data: autopsy });
  } catch (error) {
    next(error);
  }
};

export const upvoteAutopsy = async (req, res, next) => {
  try {
    const autopsy = await ProjectAutopsy.findById(req.params.id);
    if (!autopsy) return res.status(404).json({ message: 'Autopsy not found' });

    autopsy.upvotes += 1;
    await autopsy.save();
    res.status(200).json({ success: true, data: autopsy });
  } catch (error) {
    next(error);
  }
};
