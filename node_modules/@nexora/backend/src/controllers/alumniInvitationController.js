import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { AlumniInvitation } from '../models/AlumniInvitation.js';
import { User } from '../models/User.js';

// Setup nodemailer transporter — reads GMAIL_EMAIL/GMAIL_APP_PASSWORD (or fallback EMAIL_USER/EMAIL_PASSWORD)
const getTransporter = () => {
  const user = process.env.GMAIL_EMAIL || process.env.EMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: { user, pass }
  });
};

const isEmailConfigured = () => {
  return !!(process.env.GMAIL_EMAIL || process.env.EMAIL_USER) && !!(process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD);
};

// @desc    Admin invites alumni
// @route   POST /api/alumni-invitation/invite
export const inviteAlumni = async (req, res) => {
  try {
    const { name, email, batch, department, company, role } = req.body;
    
    // Safety check for Production URL
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
        return res.status(400).json({ success: false, message: 'Application URL (FRONTEND_URL) is not configured for production email.' });
      }
    }

    let invitation = await AlumniInvitation.findOne({ email });
    if (invitation && invitation.status !== 'CANCELLED' && invitation.status !== 'EXPIRED') {
      return res.status(400).json({ success: false, message: 'Invitation already exists and is active for this email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (invitation) {
      invitation.name = name;
      invitation.batch = batch;
      invitation.department = department;
      invitation.company = company;
      invitation.role = role;
      invitation.token = token;
      invitation.expireAt = expireAt;
      invitation.status = 'INVITATION_SENT';
      invitation.invitedBy = req.user.id;
      await invitation.save();
    } else {
      invitation = await AlumniInvitation.create({
        email, name, batch, department, company, role, token, expireAt, invitedBy: req.user.id
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const invitationLink = `${frontendUrl}/alumni-register/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'NEXORA Admin <admin@nexora.com>',
      to: email,
      subject: 'BITSathy NEXORA Alumni Network Invitation',
      html: `
        <p>Dear ${name},</p>
        <p>You have been invited to join the BITSathy NEXORA Alumni Network.</p>
        <p>Please complete your alumni registration using the secure link below.</p>
        <a href="${invitationLink}" style="padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">COMPLETE ALUMNI REGISTRATION</a>
        <p>The invitation link is valid for 7 days.</p>
        <p>Regards,<br/>NEXORA Team</p>
      `
    };

    if (isEmailConfigured()) {
      try {
        await getTransporter().sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Email failed to send but Invitation was created. Link:', invitationLink, emailErr);
      }
    } else {
      console.log('⚠️ Email not configured (GMAIL_EMAIL/GMAIL_APP_PASSWORD missing). Invitation link:', invitationLink);
    }

    res.status(200).json({ success: true, message: 'Invitation processed', data: invitation, link: invitationLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin resends an alumni invitation
// @route   POST /api/alumni-invitations/resend/:id
export const resendInvitation = async (req, res) => {
  try {
    const invitation = await AlumniInvitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

    // Validate state
    const invalidStates = ['REGISTRATION_SUBMITTED', 'ACTIVATION_PENDING', 'APPROVED', 'ACTIVATED'];
    if (invalidStates.includes(invitation.status)) {
      return res.status(400).json({ success: false, message: `Cannot resend. Registration is already in progress or completed (Status: ${invitation.status}).` });
    }

    // Safety check for Production URL
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
        return res.status(400).json({ success: false, message: 'Application URL (FRONTEND_URL) is not configured for production email.' });
      }
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({ success: false, message: 'Email service is not configured. Cannot send email.' });
    }

    // Generate new secure token
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const invitationLink = `${frontendUrl}/alumni-register/${newToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'NEXORA Admin <admin@nexora.com>',
      to: invitation.email,
      subject: 'BITSathy NEXORA Alumni Network Invitation (Resent)',
      html: `
        <p>Dear ${invitation.name},</p>
        <p>You have been invited to join the BITSathy NEXORA Alumni Network.</p>
        <p>Please complete your alumni registration using the secure link below.</p>
        <a href="${invitationLink}" style="padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">COMPLETE ALUMNI REGISTRATION</a>
        <p>The invitation link is valid for 7 days.</p>
        <p>Regards,<br/>NEXORA Team</p>
      `
    };

    // Send email first. If it throws, we won't overwrite the old token in DB.
    await getTransporter().sendMail(mailOptions);

    // Update DB ONLY after successful email
    invitation.token = newToken;
    invitation.expireAt = newExpireAt;
    invitation.status = 'INVITATION_SENT';
    invitation.invitedBy = req.user.id;
    await invitation.save();

    res.status(200).json({ success: true, message: 'Invitation resent successfully', data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to connect to email provider' });
  }
};

// @desc    Validate token when alumni opens link
// @route   GET /api/alumni-invitation/validate/:token
export const validateInvitation = async (req, res) => {
  try {
    const invitation = await AlumniInvitation.findOne({ token: req.params.token });
    if (!invitation) return res.status(404).json({ success: false, message: 'Invalid token' });
    
    if (invitation.expireAt < new Date()) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      return res.status(400).json({ success: false, message: 'Invitation has expired' });
    }

    if (invitation.status === 'INVITATION_SENT') {
      invitation.status = 'OPENED';
      await invitation.save();
    }

    res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Alumni submits registration
// @route   POST /api/alumni-invitation/register/:token
export const registerAlumni = async (req, res) => {
  try {
    const invitation = await AlumniInvitation.findOne({ token: req.params.token });
    if (!invitation || invitation.expireAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (invitation.status === 'REGISTRATION_SUBMITTED' || invitation.status === 'APPROVED' || invitation.status === 'ACTIVATED') {
      return res.status(400).json({ success: false, message: 'Registration already submitted or approved' });
    }

    invitation.registrationData = req.body;
    invitation.status = 'REGISTRATION_SUBMITTED';
    await invitation.save();

    res.status(200).json({ success: true, message: 'Registration submitted successfully. Pending Admin approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin fetches all invitations (pending apps etc)
// @route   GET /api/alumni-invitation
export const getInvitations = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const invitations = await AlumniInvitation.find(statusFilter).sort('-createdAt');
    res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin approves alumni registration
// @route   POST /api/alumni-invitation/approve/:id
export const approveAlumni = async (req, res) => {
  try {
    const invitation = await AlumniInvitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });
    
    if (invitation.status !== 'REGISTRATION_SUBMITTED') {
      return res.status(400).json({ success: false, message: 'Can only approve submitted registrations' });
    }

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpire = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 48 hrs

    // Check if user already exists
    let user = await User.findOne({ email: invitation.email });
    
    const regData = invitation.registrationData || {};
    
    if (!user) {
      user = new User({
        name: invitation.name,
        email: invitation.email,
        phone: regData.phone || '',
        regNo: regData.registerNumber || '',
        department: regData.department || invitation.department || '',
        year: regData.graduationYear || invitation.batch || '',
        location: regData.location || '',
        linkedinUrl: regData.linkedinUrl || '',
        githubUrl: regData.githubUrl || '',
        portfolioUrl: regData.portfolioUrl || '',
        bio: regData.professionalSummary || '',
        role: 'Alumni',
        status: 'Invited',
        invitedBy: req.user.id,
        activationToken,
        activationExpire,
        alumniProfile: {
          college: 'BITSathy',
          company: regData.currentCompany || invitation.company || '',
          designation: regData.currentJobTitle || invitation.role || '',
          expertise: regData.skills || [],
          contributionPreferences: {
            vacancySharing: regData.vacancySharingPreference || false
          }
        }
      });
      await user.save();
    } else {
      user.role = 'Alumni';
      user.activationToken = activationToken;
      user.activationExpire = activationExpire;
      user.status = 'Invited';
      user.phone = user.phone || regData.phone || '';
      user.regNo = user.regNo || regData.registerNumber || '';
      user.department = user.department || regData.department || invitation.department || '';
      user.year = user.year || regData.graduationYear || invitation.batch || '';
      user.linkedinUrl = user.linkedinUrl || regData.linkedinUrl || '';
      user.githubUrl = user.githubUrl || regData.githubUrl || '';
      user.portfolioUrl = user.portfolioUrl || regData.portfolioUrl || '';
      user.bio = user.bio || regData.professionalSummary || '';
      
      if (!user.alumniProfile) {
        user.alumniProfile = {
          college: 'BITSathy',
          company: regData.currentCompany || invitation.company || '',
          designation: regData.currentJobTitle || invitation.role || '',
          expertise: regData.skills || [],
          contributionPreferences: {
            vacancySharing: regData.vacancySharingPreference || false
          }
        };
      }
      await user.save();
    }

    invitation.status = 'ACTIVATION_PENDING';
    await invitation.save();

    // Send Activation Email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const activationLink = `${frontendUrl}/activate/${activationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'NEXORA Admin <admin@nexora.com>',
      to: invitation.email,
      subject: 'Your NEXORA Alumni Account Has Been Approved',
      html: `
        <p>Dear ${invitation.name},</p>
        <p>Your NEXORA Alumni account has been approved.</p>
        <p>Account: <strong>${invitation.email}</strong></p>
        <p>Click below to activate your account and create your password.</p>
        <a href="${activationLink}" style="padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">ACTIVATE ACCOUNT</a>
      `
    };

    if (process.env.EMAIL_USER || process.env.GMAIL_EMAIL) {
      try {
        await getTransporter().sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Activation Email failed to send but user was approved. Link:', activationLink, emailErr);
      }
    } else {
      console.log('Skipping real activation email because EMAIL_USER is not configured. Link:', activationLink);
    }

    res.status(200).json({ success: true, message: 'Alumni approved and activation email sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
