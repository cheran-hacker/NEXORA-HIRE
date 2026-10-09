import { EscapeRoomTask } from '../models/EscapeRoomTask.js';

export const getTasks = async (req, res, next) => {
  try {
    let tasks = await EscapeRoomTask.find().sort('level');
    
    // Hide answers from the client
    const safeTasks = tasks.map(t => ({ _id: t._id, level: t.level, title: t.title, riddle: t.riddle, rewardBadge: t.rewardBadge }));
    
    res.status(200).json({ success: true, data: safeTasks });
  } catch (error) {
    next(error);
  }
};

export const verifyAnswer = async (req, res, next) => {
  try {
    const { taskId, answer } = req.body;
    const task = await EscapeRoomTask.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.answer.toLowerCase() === answer.toLowerCase().trim()) {
      res.status(200).json({ success: true, correct: true, rewardBadge: task.rewardBadge });
    } else {
      res.status(200).json({ success: true, correct: false });
    }
  } catch (error) {
    next(error);
  }
};
