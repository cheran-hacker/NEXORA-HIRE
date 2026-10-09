import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'APPLICATION_UPDATE',     // Job application status changed
        'ASSESSMENT_SCHEDULED',   // New assessment assigned
        'DRIVE_ANNOUNCED',        // Placement drive announced
        'MESSAGE_RECEIVED',       // Forum reply / direct message
        'JOB_MATCHED',            // AI matched a new job
        'INTERVIEW_REMINDER',     // Interview scheduled reminder
        'OFFER_RECEIVED',         // Offer letter received
        'SYSTEM'                  // Platform announcement
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: String,          // Frontend deep-link (e.g. /student/jobs/123)
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
