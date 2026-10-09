import mongoose from 'mongoose';

const anonymousChatSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Waiting', 'Active', 'Closed'],
    default: 'Waiting'
  },
  messages: [{
    senderAlias: String, // e.g., 'Listener', 'Speaker'
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto-delete after 24 hours
  }
}, { timestamps: true });

export const AnonymousChat = mongoose.models.AnonymousChat || mongoose.model('AnonymousChat', anonymousChatSchema);
