import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // e.g. "09:00"
  end: { type: String, required: true },   // e.g. "10:00"
  enabled: { type: Boolean, default: true }
}, { _id: false });

const exceptionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, default: 'UNAVAILABLE' }, // UNAVAILABLE, CUSTOM
  reason: { type: String, default: 'Unavailable' }
}, { _id: false });

const mentorAvailabilitySchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  sessionDuration: {
    type: Number,
    default: 30, // in minutes
    min: 15,
    max: 120
  },
  bufferMinutes: {
    type: Number,
    default: 15, // buffer between sessions
    min: 0,
    max: 60
  },
  maxSessionsPerDay: {
    type: Number,
    default: 4,
    min: 1,
    max: 12
  },
  maxActiveMentees: {
    type: Number,
    default: 5,
    min: 1,
    max: 30
  },
  weeklySchedule: {
    monday: { type: [slotSchema], default: [{ start: "18:00", end: "20:00", enabled: true }] },
    tuesday: { type: [slotSchema], default: [] },
    wednesday: { type: [slotSchema], default: [{ start: "18:00", end: "20:00", enabled: true }] },
    thursday: { type: [slotSchema], default: [] },
    friday: { type: [slotSchema], default: [{ start: "18:00", end: "20:00", enabled: true }] },
    saturday: { type: [slotSchema], default: [{ start: "10:00", end: "13:00", enabled: true }] },
    sunday: { type: [slotSchema], default: [] }
  },
  exceptions: {
    type: [exceptionSchema],
    default: []
  },
  topics: {
    type: [String],
    default: ['Career Guidance', 'Resume Review', 'Mock Interview', 'Skill Gap Roadmapping', 'Technical System Design']
  }
}, { timestamps: true });

mentorAvailabilitySchema.index({ alumni: 1 });
mentorAvailabilitySchema.index({ isAvailable: 1 });

export const MentorAvailability = mongoose.models.MentorAvailability || mongoose.model('MentorAvailability', mentorAvailabilitySchema);
