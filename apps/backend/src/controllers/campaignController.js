import { Campaign } from '../models/Campaign.js';
import { User } from '../models/User.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('creator', 'name avatarUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Error in getCampaigns:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { title, description, goalAmount, category, deadline } = req.body;
    
    if (!title || !description || !goalAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const campaign = await Campaign.create({
      creator: req.user.id,
      title,
      description,
      goalAmount,
      category: category || 'Other',
      deadline,
      status: 'Active'
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error in createCampaign:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const donateToCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid donation amount' });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Campaign is not active' });
    }

    // Process donation
    campaign.donations.push({
      donor: req.user.id,
      amount,
      timestamp: new Date()
    });

    await campaign.save(); // The pre-save hook handles currentAmount and status

    res.json({ success: true, data: campaign, message: 'Donation successful!' });
  } catch (error) {
    console.error('Error in donateToCampaign:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
