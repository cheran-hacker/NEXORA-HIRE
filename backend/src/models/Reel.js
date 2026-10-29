import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String, // In MVP this can be a simulated ID or mock URL
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    enum: ['DayInTheLife', 'TechTaps', 'CampusNews', 'Humor'],
    default: 'DayInTheLife'
  }
}, { timestamps: true });

export const Reel = mongoose.models.Reel || mongoose.model('Reel', reelSchema);
