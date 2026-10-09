import { TextbookExchange } from '../models/TextbookExchange.js';

export const getListings = async (req, res, next) => {
  try {
    const listings = await TextbookExchange.find({ status: { $in: ['Looking', 'Trade Found'] } }).populate('student', 'name');
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const { haveBook, needBook } = req.body;
    const listing = await TextbookExchange.create({
      student: req.user.id,
      haveBook,
      needBook
    });
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

export const proposeTrade = async (req, res, next) => {
  try {
    const listing = await TextbookExchange.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'Looking') return res.status(400).json({ message: 'Trade no longer available' });

    // Simplification for MVP: Instantly accept trade
    listing.status = 'Trade Found';
    listing.matchedWith = req.user.id;
    listing.escrowStatus = 'Pending Dropoff';
    listing.inventoryStatus = `Campus Library Locker Pending`;
    await listing.save();

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

export const updateEscrow = async (req, res, next) => {
  try {
    const listing = await TextbookExchange.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    listing.escrowStatus = req.body.status || 'Completed';
    if (listing.escrowStatus === 'Completed') {
      listing.status = 'Completed';
    }
    await listing.save();

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};
