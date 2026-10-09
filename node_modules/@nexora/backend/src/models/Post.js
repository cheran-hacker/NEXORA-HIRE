import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Hidden', 'Archived'], default: 'Active' }
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
