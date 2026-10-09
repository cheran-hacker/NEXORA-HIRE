import { Listing } from '../models/Listing.js';

export const getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'Available' }).populate('seller', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;
    const listing = await Listing.create({
      seller: req.user.id,
      title,
      description,
      price,
      category
    });
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

export const markListingSold = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    listing.status = 'Sold';
    await listing.save();
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};
