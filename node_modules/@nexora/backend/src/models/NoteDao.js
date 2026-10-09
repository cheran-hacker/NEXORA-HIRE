import mongoose from 'mongoose';

const noteDaoSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Active', 'Slashed'],
    default: 'Active'
  }
}, { timestamps: true });

export const NoteDao = mongoose.models.NoteDao || mongoose.model('NoteDao', noteDaoSchema);
