import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  topic: { type: String, trim: true, default: 'General' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Hidden', 'Archived'], default: 'Active' }
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1 });

if (mongoose.models.Post) {
  delete mongoose.models.Post;
}

export const Post = mongoose.model('Post', postSchema);
