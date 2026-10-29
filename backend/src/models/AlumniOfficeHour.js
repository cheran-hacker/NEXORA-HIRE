import mongoose from 'mongoose';

const alumniOfficeHourSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // e.g. "14:00 - 15:00"
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  meetingLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Completed', 'Cancelled'],
    default: 'Available'
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

export const AlumniOfficeHour = mongoose.models.AlumniOfficeHour || mongoose.model('AlumniOfficeHour', alumniOfficeHourSchema);
