import { ConsultingSlot } from '../models/ConsultingSlot.js';

export const getSlots = async (req, res, next) => {
  try {
    const slots = await ConsultingSlot.find();
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

export const addSlot = async (req, res, next) => {
  try {
    const { facultyName, expertise, hourlyRate, date } = req.body;
    let slot = await ConsultingSlot.findOne({ facultyName });
    
    if (!slot) {
      slot = await ConsultingSlot.create({
        facultyName,
        expertise,
        hourlyRate,
        availableTimes: [{ date }]
      });
    } else {
      slot.availableTimes.push({ date });
      await slot.save();
    }
    
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    next(error);
  }
};

export const bookSlot = async (req, res, next) => {
  try {
    const { companyName, timeId } = req.body;
    const slot = await ConsultingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Faculty slot not found' });

    const timeEntry = slot.availableTimes.id(timeId);
    if (!timeEntry) return res.status(404).json({ message: 'Time slot not found' });
    if (timeEntry.isBooked) return res.status(400).json({ message: 'Already booked' });

    timeEntry.isBooked = true;
    timeEntry.bookedBy = companyName;
    
    await slot.save();
    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    next(error);
  }
};
