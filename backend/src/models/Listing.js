import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Misc'],
    default: 'Misc'
  },
  status: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available'
  }
}, { timestamps: true });

export const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
