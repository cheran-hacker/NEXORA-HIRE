import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  audience: {
    type: String,
    enum: ['ALL', 'STUDENTS', 'ALUMNI', 'PLACEMENT', 'ADMIN'],
    default: 'ALL',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Published',
    index: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  authorName: {
    type: String,
    default: 'NEXORA Administration'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
