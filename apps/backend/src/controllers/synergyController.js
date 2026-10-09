import { SynergyProfile } from '../models/SynergyProfile.js';
import { User } from '../models/User.js';

export const createOrUpdateProfile = async (req, res, next) => {
  try {
    const { primaryRole, lookingFor, personalityArchetype, topSkills, ideaStage, pitchIdea, commitmentLevel } = req.body;
    
    let profile = await SynergyProfile.findOne({ user: req.user.id });

    if (profile) {
      profile.primaryRole = primaryRole || profile.primaryRole;
      profile.lookingFor = lookingFor || profile.lookingFor;
      profile.personalityArchetype = personalityArchetype || profile.personalityArchetype;
      profile.topSkills = topSkills || profile.topSkills;
      profile.ideaStage = ideaStage || profile.ideaStage;
      profile.pitchIdea = pitchIdea || profile.pitchIdea;
      profile.commitmentLevel = commitmentLevel || profile.commitmentLevel;
      await profile.save();
    } else {
      profile = await SynergyProfile.create({
        user: req.user.id,
        primaryRole,
        lookingFor,
        personalityArchetype,
        topSkills,
        ideaStage,
        pitchIdea,
        commitmentLevel
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await SynergyProfile.findOne({ user: req.user.id });
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (req, res, next) => {
  try {
    const myProfile = await SynergyProfile.findOne({ user: req.user.id });
    
    if (!myProfile) {
      return res.status(200).json({ success: true, data: { project: [], roommate: [] } });
    }

    // Find profiles that match what I'm looking for AND they are looking for what I am
    const matches = await SynergyProfile.find({
      user: { $ne: req.user.id },
      primaryRole: { $in: myProfile.lookingFor },
      lookingFor: myProfile.primaryRole
    }).populate('user', 'name studentProfile.education');

    res.status(200).json({ success: true, count: matches.length, data: { project: matches, roommate: [] } });
  } catch (error) {
    next(error);
  }
};
