import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './core/config/env.js';
import AppError from './core/errors/AppError.js';
import { errorHandler } from './core/middlewares/errorHandler.js';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));

// Maintenance Middleware
app.use(checkMaintenance);

// Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

import authRoutes from './modules/auth/auth.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import assessmentRoutes from './modules/assessments/assessment.routes.js';
import recruitmentRoutes from './modules/recruitment/recruitment.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';

import adminRoutes from './routes/adminRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import alumniofficeRoutes from './routes/alumniofficeRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import argRoutes from './routes/argRoutes.js';
import arRoutes from './routes/arRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import autopsyRoutes from './routes/autopsyRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import bountyRoutes from './routes/bountyRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import capstoneRoutes from './routes/capstoneRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import colosseumRoutes from './routes/colosseumRoutes.js';
import consultingRoutes from './routes/consultingRoutes.js';
import courtRoutes from './routes/courtRoutes.js';
import daoRoutes from './routes/daoRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import escaperoomRoutes from './routes/escaperoomRoutes.js';
import foodRescueRoutes from './routes/foodRescueRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import hackathonRoutes from './routes/hackathonRoutes.js';
import hardwarepoolRoutes from './routes/hardwarepoolRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import hotseatRoutes from './routes/hotseatRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import ipvaultRoutes from './routes/ipvaultRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import karmaRoutes from './routes/karmaRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import lostfoundRoutes from './routes/lostfoundRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import notedaoRoutes from './routes/notedaoRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import opensourceRoutes from './routes/opensourceRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pivotRoutes from './routes/pivotRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import postRoutes from './routes/postRoutes.js';
import pulseRoutes from './routes/pulseRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import reelRoutes from './routes/reelRoutes.js';
import researchmatchRoutes from './routes/researchmatchRoutes.js';
import reversementoringRoutes from './routes/reversementoringRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import roomieRoutes from './routes/roomieRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import shadowRoutes from './routes/shadowRoutes.js';
import skillTreeRoutes from './routes/skillTreeRoutes.js';
import smartResumeRoutes from './routes/smartResumeRoutes.js';
import snippetRoutes from './routes/snippetRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import swipeRoutes from './routes/swipeRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import synergyRoutes from './routes/synergyRoutes.js';
import talentExchangeRoutes from './routes/talentExchangeRoutes.js';
import textbookRoutes from './routes/textbookRoutes.js';
import timebankRoutes from './routes/timebankRoutes.js';
import treasuryRoutes from './routes/treasuryRoutes.js';
import ventRoutes from './routes/ventRoutes.js';
import watercoolerRoutes from './routes/watercoolerRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { checkMaintenance } from './middleware/maintenanceMiddleware.js';
import whisperRoutes from './routes/whisperRoutes.js';
import hiringDriveRoutes from './routes/hiringDriveRoutes.js';
import roleSkillRoutes from './routes/roleSkillRoutes.js';
import alumniInvitationRoutes from './routes/alumniInvitationRoutes.js';

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NEXORA Backend API is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    apiVersion: 'v1'
  });
});

// API Routes
// Core Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/jobs', recruitmentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/role-skills', roleSkillRoutes);

// Experimental & System Routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/agency', agencyRoutes);
app.use('/api/v1/alumnioffice', alumniofficeRoutes);
app.use('/api/v1/alumni', alumniRoutes);
app.use('/api/v1/alumni-invitation', alumniInvitationRoutes);
app.use('/api/v1/application', applicationRoutes);
app.use('/api/v1/arg', argRoutes);
app.use('/api/v1/ar', arRoutes);
app.use('/api/v1/auction', auctionRoutes);
app.use('/api/v1/autopsy', autopsyRoutes);
app.use('/api/v1/badge', badgeRoutes);
app.use('/api/v1/bounty', bountyRoutes);
app.use('/api/v1/bounties', bountyRoutes);
app.use('/api/bounties', bountyRoutes);
app.use('/api/bounty', bountyRoutes);
app.use('/api/v1/campaign', campaignRoutes);
app.use('/api/v1/capstone', capstoneRoutes);
app.use('/api/v1/certificate', certificateRoutes);
app.use('/api/v1/challenge', challengeRoutes);
app.use('/api/v1/club', clubRoutes);
app.use('/api/v1/colosseum', colosseumRoutes);
app.use('/api/v1/consulting', consultingRoutes);
app.use('/api/v1/court', courtRoutes);
app.use('/api/v1/dao', daoRoutes);
app.use('/api/v1/developer', developerRoutes);
app.use('/api/v1/donation', donationRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/escaperoom', escaperoomRoutes);
app.use('/api/v1/foodRescue', foodRescueRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/geo', geoRoutes);
app.use('/api/v1/hackathon', hackathonRoutes);
app.use('/api/v1/hardwarepool', hardwarepoolRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/hotseat', hotseatRoutes);
app.use('/api/v1/internship', internshipRoutes);
app.use('/api/v1/ipvault', ipvaultRoutes);
app.use('/api/v1/job', jobRoutes);
app.use('/api/v1/karma', karmaRoutes);
app.use('/api/v1/listing', listingRoutes);
app.use('/api/v1/lostfound', lostfoundRoutes);
app.use('/api/v1/mentorship', mentorshipRoutes);
app.use('/api/v1/network', networkRoutes);
app.use('/api/v1/notedao', notedaoRoutes);
app.use('/api/v1/offer', offerRoutes);
app.use('/api/v1/opensource', opensourceRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/pivot', pivotRoutes);
app.use('/api/v1/placement', placementRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/forum', postRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/forum', postRoutes);
app.use('/api/v1/pulse', pulseRoutes);
app.use('/api/v1/recruiter', recruiterRoutes);
app.use('/api/v1/reel', reelRoutes);
app.use('/api/v1/researchmatch', researchmatchRoutes);
app.use('/api/v1/reversementoring', reversementoringRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/roomie', roomieRoutes);
app.use('/api/v1/scholarship', scholarshipRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/shadow', shadowRoutes);
app.use('/api/v1/skillTree', skillTreeRoutes);
app.use('/api/v1/smartResume', smartResumeRoutes);
app.use('/api/v1/snippet', snippetRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/sprint', sprintRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/roadmaps', roadmapRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/v1/swipe', swipeRoutes);
app.use('/api/v1/syllabus', syllabusRoutes);
app.use('/api/v1/synergy', synergyRoutes);
app.use('/api/v1/talentExchange', talentExchangeRoutes);
app.use('/api/v1/textbook', textbookRoutes);
app.use('/api/v1/timebank', timebankRoutes);
app.use('/api/v1/treasury', treasuryRoutes);
app.use('/api/v1/vent', ventRoutes);
app.use('/api/v1/watercooler', watercoolerRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/whisper', whisperRoutes);
app.use('/api/v1/hiring-drives', hiringDriveRoutes);

// Catch-all route for unhandled endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

export default app;
