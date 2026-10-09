import { HackathonEvent } from '../models/HackathonEvent.js';

export const getHackathons = async (req, res, next) => {
  try {
    const hackathons = await HackathonEvent.find().populate('organizer', 'name').sort('startDate');
    res.status(200).json({ success: true, data: hackathons });
  } catch (error) {
    next(error);
  }
};

export const generateHackathonBox = async (req, res, next) => {
  try {
    const { eventName, theme, startDate, endDate } = req.body;
    
    const hackathon = await HackathonEvent.create({
      organizer: req.user.id,
      eventName,
      theme,
      startDate,
      endDate,
      isBoxGenerated: true // Instantly spins up registration, teams, etc.
    });
    
    res.status(201).json({ success: true, data: hackathon });
  } catch (error) {
    next(error);
  }
};

export const joinHackathon = async (req, res, next) => {
  try {
    const hackathon = await HackathonEvent.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Event not found' });
    if (hackathon.participants.includes(req.user.id)) return res.status(400).json({ message: 'Already registered' });

    hackathon.participants.push(req.user.id);
    await hackathon.save();
    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    next(error);
  }
};

export const formTeams = async (req, res, next) => {
  try {
    const hackathon = await HackathonEvent.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Event not found' });
    
    const participants = [...hackathon.participants];
    // Shuffle array
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    const teamSize = 4;
    const teams = [];
    for (let i = 0; i < participants.length; i += teamSize) {
      teams.push({
        name: `Team ${String.fromCharCode(65 + Math.floor(i / teamSize))}`,
        members: participants.slice(i, i + teamSize)
      });
    }

    hackathon.teams = teams;
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    next(error);
  }
};
