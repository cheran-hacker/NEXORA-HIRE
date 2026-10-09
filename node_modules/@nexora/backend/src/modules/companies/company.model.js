import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    industry: {
      type: String,
      required: true
    },
    website: String,
    logoUrl: String,
    description: String,
    locations: [String],
    establishedYear: Number,
    companySize: String, // e.g., '10-50', '500-1000', '10000+'
    isVerified: {
      type: Boolean,
      default: false
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
