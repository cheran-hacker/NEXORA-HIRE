import { User } from '../models/User.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

const sendOnboardingEmail = async (email, token, name) => {
  const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate/${token}`;
  
  const message = `Hello ${name},\n\nAn administrator has created an Alumni account for you.\nPlease click the secure link below to set your password and activate your account:\n\n${activationLink}\n\nThis link will expire in 24 hours.`;
  
  const html = `
    <h2>Welcome to Integrated Student Success Ecosystem!</h2>
    <p>Hello ${name},</p>
    <p>An administrator has created an Alumni account for you.</p>
    <p>Please click the button below to set your password and activate your account:</p>
    <a href="${activationLink}" style="display:inline-block;padding:10px 20px;background-color:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Activate Account</a>
    <p><br>Or copy and paste this link into your browser: <br>${activationLink}</p>
    <p>This link will expire in 24 hours.</p>
  `;

  await sendEmail({
    email,
    subject: 'Welcome to Integrated Student Success Ecosystem – Alumni Account',
    message,
    html
  });
  
  return true;
};

export const inviteAlumni = async (req, res) => {
  try {
    const { name, email, department, graduationYear, company, role } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Duplicate check
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newAlumni = await User.create({
      name,
      email: email.toLowerCase(),
      role: 'Alumni',
      status: 'Invited',
      resetPasswordToken: hashedToken,
      resetPasswordExpire: expireDate,
      alumniProfile: {
        college: 'Your Institution',
        company: company || '',
        designation: role || '',
      },
      department: department || '',
      year: graduationYear || ''
    });

    // Send email
    await sendOnboardingEmail(newAlumni.email, rawToken, newAlumni.name);

    res.status(201).json({
      message: 'Alumni account created and invitation sent successfully.',
      user: {
        _id: newAlumni._id,
        name: newAlumni.name,
        email: newAlumni.email,
        status: newAlumni.status
      }
    });
  } catch (error) {
    console.error('Invite Alumni Error:', error);
    res.status(500).json({ message: 'Failed to create alumni account.' });
  }
};

export const resendAlumniInvite = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alumni = await User.findById(id);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found.' });
    }

    if (alumni.status === 'Active') {
      return res.status(400).json({ message: 'Account is already active. User can reset password if needed.' });
    }

    // Rate limiting logic: Check if we sent an email recently
    if (alumni.resetPasswordExpire) {
      const timeRemaining = alumni.resetPasswordExpire.getTime() - Date.now();
      const twentyThreeHours = 23 * 60 * 60 * 1000;
      // If token expires in more than 23 hours, it means we sent it in the last hour
      if (timeRemaining > twentyThreeHours) {
        return res.status(429).json({ message: 'An invitation was already sent recently. Please wait before sending again.' });
      }
    }

    // Generate new secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    alumni.resetPasswordToken = hashedToken;
    alumni.resetPasswordExpire = expireDate;
    alumni.status = 'Invited';
    await alumni.save();

    // Send email
    await sendOnboardingEmail(alumni.email, rawToken, alumni.name);

    res.status(200).json({ message: 'Invitation resent successfully.' });
  } catch (error) {
    console.error('Resend Invite Error:', error);
    res.status(500).json({ message: 'Failed to resend invitation.' });
  }
};

export const getAlumniDirectory = async (req, res) => {
  try {
    const query = req.query.search;
    let dbQuery = { role: 'Alumni' };
    
    if (query) {
      dbQuery = {
        role: 'Alumni',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { 'alumniProfile.company': { $regex: query, $options: 'i' } },
          { 'alumniProfile.designation': { $regex: query, $options: 'i' } }
        ]
      };
    }
    
    const alumniList = await User.find(dbQuery)
      .select('-password -resetPasswordToken -resetPasswordExpire -twoFactorSecret')
      .sort({ createdAt: -1 });

    res.status(200).json(alumniList);
  } catch (error) {
    console.error('Get Alumni Directory Error:', error);
    res.status(500).json({ message: 'Failed to fetch alumni.' });
  }
};
