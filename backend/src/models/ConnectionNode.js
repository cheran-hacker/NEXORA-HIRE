import mongoose from 'mongoose';

const connectionNodeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  company: {
    type: String // Populated for alumni to make searching easier
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

export const ConnectionNode = mongoose.models.ConnectionNode || mongoose.model('ConnectionNode', connectionNodeSchema);
