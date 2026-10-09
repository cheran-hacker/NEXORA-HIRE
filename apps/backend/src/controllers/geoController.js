import { GeoEvent } from '../models/GeoEvent.js';

export const getActiveEvents = async (req, res, next) => {
  try {
    const events = await GeoEvent.find({ isActive: true });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

export const createGeoEvent = async (req, res, next) => {
  try {
    const { title, description, coordinates, radiusMeters, eventType } = req.body;
    
    if (!title || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ success: false, message: 'Title and valid coordinates are required' });
    }

    const newEvent = await GeoEvent.create({
      title,
      description: description || '',
      coordinates,
      radiusMeters: radiusMeters || 50,
      eventType: eventType || 'FlashMob',
      isActive: true,
      activeParticipants: []
    });

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    next(error);
  }
};

export const checkInGeoEvent = async (req, res, next) => {
  try {
    const { eventId, lat, lng } = req.body;
    
    if (!eventId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'eventId, lat, and lng are required for check-in.' });
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ success: false, message: 'Coordinates must be valid numbers.' });
    }
    
    const event = await GeoEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isActive) return res.status(400).json({ message: 'Event is no longer active' });

    // Haversine formula to calculate distance in meters
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(event.coordinates.lat - lat);
    const dLng = toRad(event.coordinates.lng - lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat)) * Math.cos(toRad(event.coordinates.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance > event.radiusMeters) {
      return res.status(403).json({ 
        success: false, 
        message: `You are too far from the event. Distance: ${Math.round(distance)}m, Required: ${event.radiusMeters}m.` 
      });
    }

    if (!event.activeParticipants.includes(req.user.id)) {
      event.activeParticipants.push(req.user.id);
      await event.save();
    }

    res.status(200).json({ success: true, data: { eventId: event._id, message: 'Checked into event network' } });
  } catch (error) {
    next(error);
  }
};
