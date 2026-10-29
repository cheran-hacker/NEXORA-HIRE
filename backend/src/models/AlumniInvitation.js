import mongoose from 'mongoose';

const alumniInvitationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  batch: { type: String },
  department: { type: String },
  company: { type: String },
  role: { type: String },
  token: { type: String, required: true },
  expireAt: { type: Date, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Registration Data filled by Alumni
  registrationData: {
    registerNumber: String,
    phone: String,
    location: String,
    degree: String,
    department: String,
    graduationYear: String,
    batch: String,
    currentCompany: String,
    currentJobTitle: String,
    industry: String,
    experience: String,
    skills: [String],
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    professionalSummary: String,
    careerDomain: String,
    vacancySharingPreference: Boolean,
  },
  
  status: { 
    type: String, 
    enum: [
      'NOT_INVITED', 
      'INVITATION_SENT', 
      'OPENED', 
      'REGISTRATION_SUBMITTED', 
      'APPROVED', 
      'ACTIVATION_PENDING',
      'ACTIVATED',
      'REJECTED', 
      'EXPIRED', 
      'CANCELLED'
    ], 
    default: 'INVITATION_SENT' 
  }
}, { timestamps: true });

export const AlumniInvitation = mongoose.models.AlumniInvitation || mongoose.model('AlumniInvitation', alumniInvitationSchema);
