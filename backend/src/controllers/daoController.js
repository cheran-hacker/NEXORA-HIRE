import { EventProposal } from '../models/EventProposal.js';

export const getProposals = async (req, res, next) => {
  try {
    const proposals = await EventProposal.find().populate('proposer', 'name').sort('-totalStake');
    res.status(200).json({ success: true, data: proposals });
  } catch (error) {
    next(error);
  }
};

export const createProposal = async (req, res, next) => {
  try {
    const { title, description, estimatedCost } = req.body;
    const proposal = await EventProposal.create({
      proposer: req.user.id,
      title,
      description,
      estimatedCost
    });
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

export const stakeOnProposal = async (req, res, next) => {
  try {
    const { stakeAmount } = req.body;
    const proposal = await EventProposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.status !== 'Voting') return res.status(400).json({ message: 'Voting is closed for this proposal' });

    // Check if user already voted
    const existingVote = proposal.votes.find(v => v.student.toString() === req.user.id);
    if (existingVote) {
      return res.status(400).json({ message: 'You have already staked on this event' });
    }

    proposal.votes.push({ student: req.user.id, stakeAmount: Number(stakeAmount) || 1 });
    proposal.totalStake += (Number(stakeAmount) || 1);
    
    // Auto fund if threshold reached (Simulated for MVP: threshold 100)
    if (proposal.totalStake >= 100) {
      proposal.status = 'Funded';
    }

    await proposal.save();
    res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

export const claimTicket = async (req, res, next) => {
  try {
    const proposal = await EventProposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.status !== 'Funded') return res.status(400).json({ message: 'Event is not funded yet' });

    // Check if user already claimed
    if (proposal.ticketsClaimed.includes(req.user.id)) {
      return res.status(400).json({ message: 'Ticket already claimed' });
    }

    proposal.ticketsClaimed.push(req.user.id);
    await proposal.save();
    
    // Simulate QR code generation with a dummy string
    const simulatedQrCode = `QR-EVENT-${proposal._id.toString().substring(0, 5).toUpperCase()}-${req.user.id.substring(0,5).toUpperCase()}`;
    
    res.status(200).json({ success: true, data: { ...proposal.toJSON(), qrCode: simulatedQrCode } });
  } catch (error) {
    next(error);
  }
};
