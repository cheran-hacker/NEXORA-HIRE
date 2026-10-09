import { StockProfile, Investment } from '../models/StockProfile.js';

export const getMarketOverview = async (req, res, next) => {
  try {
    const profiles = await StockProfile.find().populate('student', 'name').sort('-currentPrice').limit(10);
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

export const getMyPortfolio = async (req, res, next) => {
  try {
    const investments = await Investment.find({ investor: req.user.id })
      .populate({
        path: 'stockProfile',
        populate: { path: 'student', select: 'name' }
      });
    res.status(200).json({ success: true, data: investments });
  } catch (error) {
    next(error);
  }
};

export const investInStudent = async (req, res, next) => {
  try {
    const { stockProfileId, shares } = req.body;
    
    const profile = await StockProfile.findById(stockProfileId);
    if (!profile) return res.status(404).json({ message: 'Stock profile not found' });

    // Simulate price increase based on demand
    const newPrice = profile.currentPrice + (shares * 0.1);
    profile.currentPrice = newPrice;
    profile.priceHistory.push({ price: newPrice });
    await profile.save();

    let investment = await Investment.findOne({ investor: req.user.id, stockProfile: stockProfileId });
    if (investment) {
      investment.sharesOwned += Number(shares);
      investment.averageBuyPrice = ((investment.averageBuyPrice * investment.sharesOwned) + (newPrice * shares)) / (investment.sharesOwned + shares);
      await investment.save();
    } else {
      investment = await Investment.create({
        investor: req.user.id,
        stockProfile: stockProfileId,
        sharesOwned: shares,
        averageBuyPrice: newPrice
      });
    }

    res.status(200).json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};
