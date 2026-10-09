import { SyllabusTopic } from '../models/SyllabusTopic.js';

export const getTopics = async (req, res, next) => {
  try {
    const topics = await SyllabusTopic.find().sort('-industryDemandScore');
    res.status(200).json({ success: true, count: topics.length, data: topics });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const { topicName, department, currentStatus } = req.body;
    const topic = await SyllabusTopic.create({
      topicName,
      department,
      currentStatus
    });
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

export const voteTopic = async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const topicId = req.params.id;
    const recruiterId = req.user.id;

    const topic = await SyllabusTopic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // Check if already voted
    const existingVote = topic.voters.find(v => v.recruiterId.toString() === recruiterId);
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        return res.status(400).json({ message: 'You already voted this way.' });
      } else {
        // Reverse vote
        if (voteType === 'up') {
          topic.upvotes += 1;
          topic.downvotes -= 1;
        } else {
          topic.upvotes -= 1;
          topic.downvotes += 1;
        }
        existingVote.voteType = voteType;
      }
    } else {
      // New vote
      topic.voters.push({ recruiterId, voteType });
      if (voteType === 'up') topic.upvotes += 1;
      else topic.downvotes += 1;
    }

    // Recalculate score (simple algorithm for now: base 50 + (upvotes - downvotes) * 5)
    // Capped between 0 and 100
    let score = 50 + ((topic.upvotes - topic.downvotes) * 5);
    score = Math.max(0, Math.min(100, score));
    topic.industryDemandScore = score;

    await topic.save();
    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};
