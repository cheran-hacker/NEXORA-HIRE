import mongoose from 'mongoose';

const portfolioGallerySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sceneConfig: { type: Object, required: true }, // holds positions of 3D frames
  projects: [{
    title: String,
    image: String, // texture URL
    link: String
  }]
}, { timestamps: true });

export const PortfolioGallery = mongoose.models.PortfolioGallery || mongoose.model('PortfolioGallery', portfolioGallerySchema);
