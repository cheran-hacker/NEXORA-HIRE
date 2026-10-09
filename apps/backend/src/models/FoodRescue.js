import mongoose from 'mongoose';

const foodRescueSchema = new mongoose.Schema({
  cafeteriaName: {
    type: String,
    required: true
  },
  foodDescription: {
    type: String,
    required: true
  },
  boxesAvailable: {
    type: Number,
    required: true
  },
  pricePerBox: {
    type: Number,
    default: 1.00 // standard $1 rescue
  },
  status: {
    type: String,
    enum: ['Active', 'SoldOut', 'Expired'],
    default: 'Active'
  },
  claimedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

export const FoodRescue = mongoose.models.FoodRescue || mongoose.model('FoodRescue', foodRescueSchema);
