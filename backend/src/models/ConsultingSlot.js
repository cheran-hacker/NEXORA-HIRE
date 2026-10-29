import mongoose from 'mongoose';

const consultingSlotSchema = new mongoose.Schema({
  facultyName: {
    type: String,
    required: true
  },
  expertise: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  availableTimes: [{
    date: Date,
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: String } // Company name
  }]
}, { timestamps: true });

export const ConsultingSlot = mongoose.models.ConsultingSlot || mongoose.model('ConsultingSlot', consultingSlotSchema);
