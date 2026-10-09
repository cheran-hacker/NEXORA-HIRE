import { LivingHabitProfile } from '../models/LivingHabitProfile.js';

export const getProfiles = async (req, res, next) => {
  try {
    // Basic recommendation engine: return profiles excluding self
    const profiles = await LivingHabitProfile.find({ student: { $ne: req.user.id } }).populate('student', 'name');
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req, res, next) => {
  try {
    const { sleepSchedule, cleanliness, socialMeter, bio } = req.body;
    
    let profile = await LivingHabitProfile.findOne({ student: req.user.id });
    
    if (profile) {
      profile.sleepSchedule = sleepSchedule;
      profile.cleanliness = cleanliness;
      profile.socialMeter = socialMeter;
      profile.bio = bio;
      await profile.save();
    } else {
      profile = await LivingHabitProfile.create({
        student: req.user.id,
        sleepSchedule,
        cleanliness,
        socialMeter,
        bio
      });
    }
    
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const swipeProfile = async (req, res, next) => {
  try {
    const { action } = req.body; // 'like' or 'pass'
    // Simplified matching logic for MVP. 
    // In a real app, this would check if the other person liked back.
    if (action === 'like') {
      const myProfile = await LivingHabitProfile.findOne({ student: req.user.id });
      if (myProfile && !myProfile.matches.includes(req.params.id)) {
        myProfile.matches.push(req.params.id);
        await myProfile.save();
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
