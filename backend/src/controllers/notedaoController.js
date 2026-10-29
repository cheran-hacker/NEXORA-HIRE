import { NoteDao } from '../models/NoteDao.js';
import { User } from '../models/User.js';

export const getNotes = async (req, res, next) => {
  try {
    const notes = await NoteDao.find({ status: 'Active' }).populate('uploader', 'name');
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const uploadNote = async (req, res, next) => {
  try {
    const { courseCode, title, documentUrl } = req.body;
    const note = await NoteDao.create({
      uploader: req.user.id,
      courseCode,
      title,
      documentUrl
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const voteNote = async (req, res, next) => {
  try {
    const { action } = req.body; // 'upvote' or 'downvote'
    const note = await NoteDao.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Simple MVP toggle logic
    let karmaChange = 0;
    if (action === 'upvote') {
      if (!note.upvotes.includes(req.user.id)) {
        note.upvotes.push(req.user.id);
        karmaChange += 10;
      }
      // Remove from downvotes if there
      if (note.downvotes.includes(req.user.id)) {
        note.downvotes = note.downvotes.filter(id => id.toString() !== req.user.id);
        karmaChange += 5; // Revert the penalty
      }
    } else if (action === 'downvote') {
      if (!note.downvotes.includes(req.user.id)) {
        note.downvotes.push(req.user.id);
        karmaChange -= 5;
      }
      if (note.upvotes.includes(req.user.id)) {
        note.upvotes = note.upvotes.filter(id => id.toString() !== req.user.id);
        karmaChange -= 10; // Revert the reward
      }
    }

    if (karmaChange !== 0) {
      await User.findByIdAndUpdate(note.uploader, {
        $inc: { 'studentProfile.karma': karmaChange }
      });
    }

    // Slashing condition (e.g. 5 more downvotes than upvotes)
    if (note.downvotes.length - note.upvotes.length >= 5) {
      note.status = 'Slashed';
    }

    await note.save();
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};
