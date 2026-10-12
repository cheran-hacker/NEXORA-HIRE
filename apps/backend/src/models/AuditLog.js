import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    email: { type: String, default: '' },
    role: { type: String, default: 'System' }
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  entity: {
    type: String,
    required: true,
    index: true
  },
  entityId: {
    type: String,
    default: null
  },
  severity: {
    type: String,
    enum: ['Info', 'Warning', 'High'],
    default: 'Info',
    index: true
  },
  ip: {
    type: String,
    default: '127.0.0.1'
  },
  details: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
