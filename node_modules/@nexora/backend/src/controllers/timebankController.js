import { TimeLedger } from '../models/TimeLedger.js';

export const getMyTimeBank = async (req, res, next) => {
  try {
    let ledger = await TimeLedger.findOne({ user: req.user.id })
      .populate('transactions.partner', 'name');
      
    if (!ledger) {
      ledger = await TimeLedger.create({
        user: req.user.id,
        balance: 2, // Start with 2 free coins
        transactions: []
      });
    }

    // Get market (others who offer skills)
    const market = await TimeLedger.find({ user: { $ne: req.user.id }, skillsOffered: { $exists: true, $not: {$size: 0} } })
      .populate('user', 'name studentProfile.skills');

    res.status(200).json({ 
      success: true, 
      data: {
        ledger,
        market
      }
    });
  } catch (error) {
    next(error);
  }
};

export const transactTime = async (req, res, next) => {
  try {
    const { partnerId, skill, type } = req.body; // type: 'Earned' (I taught) or 'Spent' (I learned)
    const userId = req.user.id;

    let myLedger = await TimeLedger.findOne({ user: userId });
    let partnerLedger = await TimeLedger.findOne({ user: partnerId });

    if (!myLedger || !partnerLedger) return res.status(404).json({ message: 'Ledger not found' });

    if (type === 'Spent') {
      if (myLedger.balance < 1) return res.status(400).json({ message: 'Insufficient TimeCoins!' });
      myLedger.balance -= 1;
      myLedger.transactions.push({ amount: 1, type: 'Spent', partner: partnerId, skill });
      
      partnerLedger.balance += 1;
      partnerLedger.transactions.push({ amount: 1, type: 'Earned', partner: userId, skill });
    } else {
      // Earned
      if (partnerLedger.balance < 1) return res.status(400).json({ message: 'Partner has insufficient TimeCoins!' });
      myLedger.balance += 1;
      myLedger.transactions.push({ amount: 1, type: 'Earned', partner: partnerId, skill });
      
      partnerLedger.balance -= 1;
      partnerLedger.transactions.push({ amount: 1, type: 'Spent', partner: userId, skill });
    }

    await myLedger.save();
    await partnerLedger.save();

    res.status(200).json({ success: true, data: myLedger });
  } catch (error) {
    next(error);
  }
};
