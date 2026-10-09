import mongoose from 'mongoose';

const watercoolerSessionSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String, // e.g. "Ask me anything about SWE at Google"
    required: true
  },
  status: {
    type: String,
    enum: ['Listening', 'InCall', 'Ended'],
    default: 'Listening'
  },
  currentStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  callStartTime: {
    type: Date
  }
}, { timestamps: true });

export const WatercoolerSession = mongoose.models.WatercoolerSession || mongoose.model('WatercoolerSession', watercoolerSessionSchema);
