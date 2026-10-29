import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appName: {
    type: String,
    required: true
  },
  keyString: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Active', 'Revoked'],
    default: 'Active'
  },
  requestsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);
