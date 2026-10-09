import { TalentStock } from '../models/TalentStock.js';
import { User } from '../models/User.js';

// Initialize a stock profile for a student if they don't have one
export const getMyPortfolio = async (req, res, next) => {
  try {
    // For students: get their own stock info
    let myStock = await TalentStock.findOne({ student: req.user.id });
    
    if (!myStock && req.user.role === 'Student') {
      myStock = await TalentStock.create({
        student: req.user.id,
        currentPrice: 10.00,
        priceHistory: [{ price: 10.00, reason: 'IPO' }]
      });
    }

    // Find all stocks I have invested in
    const investments = await TalentStock.find({ 'investors.investorId': req.user.id })
      .populate('student', 'name studentProfile.education');

    res.status(200).json({ 
      success: true, 
      data: {
        myStock,
        investments
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMarket = async (req, res, next) => {
  try {
    const market = await TalentStock.find()
      .populate('student', 'name studentProfile.skills')
      .sort('-currentPrice');
    res.status(200).json({ success: true, count: market.length, data: market });
  } catch (error) {
    next(error);
  }
};

export const investInStudent = async (req, res, next) => {
  try {
    const { shares } = req.body;
    const stockId = req.params.id;
    const investorId = req.user.id;

    const stock = await TalentStock.findById(stockId);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    if (stock.student.toString() === investorId) return res.status(400).json({ message: 'Cannot invest in yourself' });

    let investment = stock.investors.find(i => i.investorId.toString() === investorId);
    
    if (investment) {
      // Calculate new average buy price
      const totalCost = (investment.sharesOwned * investment.averageBuyPrice) + (shares * stock.currentPrice);
      const newShares = investment.sharesOwned + shares;
      investment.averageBuyPrice = totalCost / newShares;
      investment.sharesOwned = newShares;
    } else {
      stock.investors.push({
        investorId,
        sharesOwned: shares,
        averageBuyPrice: stock.currentPrice
      });
    }

    // Simulate market impact (buying shares increases the price slightly)
    const newPrice = stock.currentPrice + (shares * 0.1);
    stock.currentPrice = newPrice;
    stock.priceHistory.push({ price: newPrice, reason: `Investment received` });

    await stock.save();
    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    next(error);
  }
};
