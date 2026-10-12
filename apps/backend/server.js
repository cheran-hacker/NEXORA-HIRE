import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { getSwaggerSpec } from './src/config/swagger.js';
import morgan from 'morgan';
import { logger } from './src/utils/logger.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Message } from './src/models/Message.js';
import { geminiService } from './src/services/geminiService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import assessmentRoutes from './src/routes/assessmentRoutes.js';
import placementRoutes from './src/routes/placementRoutes.js';
import mentorshipRoutes from './src/routes/mentorshipRoutes.js';
import internshipRoutes from './src/routes/internshipRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import recruiterRoutes from './src/routes/recruiterRoutes.js';
import alumniRoutes from './src/routes/alumniRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import swipeRoutes from './src/routes/swipeRoutes.js';
import bountyRoutes from './src/routes/bountyRoutes.js';
import snippetRoutes from './src/routes/snippetRoutes.js';
import synergyRoutes from './src/routes/synergyRoutes.js';
import syllabusRoutes from './src/routes/syllabusRoutes.js';
import stockRoutes from './src/routes/stockRoutes.js';
import arRoutes from './src/routes/arRoutes.js';
import networkRoutes from './src/routes/networkRoutes.js';
import equipmentRoutes from './src/routes/equipmentRoutes.js';
import timebankRoutes from './src/routes/timebankRoutes.js';
import campaignRoutes from './src/routes/campaignRoutes.js';
import pivotRoutes from './src/routes/pivotRoutes.js';
import pulseRoutes from './src/routes/pulseRoutes.js';
import karmaRoutes from './src/routes/karmaRoutes.js';
import geoRoutes from './src/routes/geoRoutes.js';
import whisperRoutes from './src/routes/whisperRoutes.js';
import listingRoutes from './src/routes/listingRoutes.js';
import lostfoundRoutes from './src/routes/lostfoundRoutes.js';
import daoRoutes from './src/routes/daoRoutes.js';
import talentExchangeRoutes from './src/routes/talentExchangeRoutes.js';
import argRoutes from './src/routes/argRoutes.js';
import smartResumeRoutes from './src/routes/smartResumeRoutes.js';
import courtRoutes from './src/routes/courtRoutes.js';
import colosseumRoutes from './src/routes/colosseumRoutes.js';
import autopsyRoutes from './src/routes/autopsyRoutes.js';
import hackathonBoxRoutes from './src/routes/hackathonRoutes.js';
import sprintRoutes from './src/routes/sprintRoutes.js';
import consensusRoutes from './src/routes/consensusRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import consultingRoutes from './src/routes/consultingRoutes.js';
import watercoolerRoutes from './src/routes/watercoolerRoutes.js';
import roomieRoutes from './src/routes/roomieRoutes.js';
import foodRescueRoutes from './src/routes/foodRescueRoutes.js';
import skillTreeRoutes from './src/routes/skillTreeRoutes.js';
import textbookRoutes from './src/routes/textbookRoutes.js';
import scholarshipRoutes from './src/routes/scholarshipRoutes.js';
import reelRoutes from './src/routes/reelRoutes.js';
import treasuryRoutes from './src/routes/treasuryRoutes.js';
import parkingRoutes from './src/routes/parkingRoutes.js';
import sosRoutes from './src/routes/sosRoutes.js';
import developerRoutes from './src/routes/developerRoutes.js';
import agencyRoutes from './src/routes/agencyRoutes.js';
import opensourceRoutes from './src/routes/opensourceRoutes.js';
import auctionRoutes from './src/routes/auctionRoutes.js';
import notedaoRoutes from './src/routes/notedaoRoutes.js';
import ventRoutes from './src/routes/ventRoutes.js';
import escaperoomRoutes from './src/routes/escaperoomRoutes.js';
import hotseatRoutes from './src/routes/hotseatRoutes.js';
import ipvaultRoutes from './src/routes/ipvaultRoutes.js';
import hardwarepoolRoutes from './src/routes/hardwarepoolRoutes.js';
import researchmatchRoutes from './src/routes/researchmatchRoutes.js';
import reversementoringRoutes from './src/routes/reversementoringRoutes.js';
import alumniofficeRoutes from './src/routes/alumniofficeRoutes.js';
import shadowRoutes from './src/routes/shadowRoutes.js';
import capstoneRoutes from './src/routes/capstoneRoutes.js';
import challengeRoutes from './src/routes/challengeRoutes.js';
import badgeRoutes from './src/routes/badgeRoutes.js';
import galleryRoutes from './src/routes/galleryRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import donationRoutes from './src/routes/donationRoutes.js';
import clubRoutes from './src/routes/clubRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
// ─── Previously unmounted critical routes ──────────────────────────────────
import alumniInvitationRoutes from './src/routes/alumniInvitationRoutes.js';
import hiringDriveRoutes from './src/routes/hiringDriveRoutes.js';
import roleSkillRoutes from './src/routes/roleSkillRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', process.env.CORS_ORIGIN, process.env.FRONTEND_URL],
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(helmet({ crossOriginOpenerPolicy: { policy: "unsafe-none" }, crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', process.env.CORS_ORIGIN, process.env.FRONTEND_URL], credentials: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Setup Swagger Docs
app.use('/api-docs', swaggerUi.serve, (req, res, next) => swaggerUi.setup(getSwaggerSpec(), { customCss: '.swagger-ui .topbar { display: none }' })(req, res, next));

// Database Connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora')
    .then(() => logger.info('✅ MongoDB Connected'))
    .catch(err => logger.error(`❌ MongoDB Connection Error: ${err.message}`));
}

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/bounties', bountyRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/synergy', synergyRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/ar', arRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/timebank', timebankRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/pivots', pivotRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/karma', karmaRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/whisper', whisperRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/lostfound', lostfoundRoutes);
app.use('/api/dao', daoRoutes);
app.use('/api/talent-exchange', talentExchangeRoutes);
app.use('/api/arg', argRoutes);
app.use('/api/smart-resume', smartResumeRoutes);
app.use('/api/court', courtRoutes);
app.use('/api/colosseum', colosseumRoutes);
app.use('/api/autopsy', autopsyRoutes);
app.use('/api/hackathon-box', hackathonBoxRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/consensus', consensusRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/consulting', consultingRoutes);
app.use('/api/watercooler', watercoolerRoutes);
app.use('/api/roomies', roomieRoutes);
app.use('/api/food-rescue', foodRescueRoutes);
app.use('/api/skill-tree', skillTreeRoutes);
app.use('/api/textbooks', textbookRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/opensource', opensourceRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/notedao', notedaoRoutes);
app.use('/api/vents', ventRoutes);
app.use('/api/escaperoom', escaperoomRoutes);
app.use('/api/hotseat', hotseatRoutes);
app.use('/api/ipvault', ipvaultRoutes);
app.use('/api/hardwarepool', hardwarepoolRoutes);
app.use('/api/researchmatch', researchmatchRoutes);
app.use('/api/reversementoring', reversementoringRoutes);
app.use('/api/alumnioffice', alumniofficeRoutes);
app.use('/api/shadow', shadowRoutes);
app.use('/api/capstones', capstoneRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
// ─── Previously unmounted critical routes ──────────────────────────────────
app.use('/api/alumni-invitations', alumniInvitationRoutes);
app.use('/api/hiring-drives', hiringDriveRoutes);
app.use('/api/role-skills', roleSkillRoutes);
app.use('/api/settings', settingsRoutes);

// ─── Socket.IO ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);
  
  // Join user's personal room for direct notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User joined personal room: user_${userId}`);
  });

  // Join a specific mentorship session room
  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    console.log(`👤 User joined session room: ${sessionId}`);
  });

  // Handle incoming chat messages
  socket.on('send_message', async (data) => {
    try {
      const { sessionId, senderId, text } = data;
      const message = await Message.create({ sessionId, senderId, text });
      io.to(sessionId).emit('receive_message', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ─── Error Handling Middleware ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    if (geminiService.isConfigured()) {
      logger.info(`🤖 Gemini API: CONFIGURED`);
    } else {
      logger.warn(`⚠️ Gemini API: NOT CONFIGURED`);
    }
  });

  // Graceful shutdown — release port properly so nodemon can restart cleanly
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    httpServer.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    // Force exit after 5s if connections hang
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle port already in use — exit cleanly so nodemon retries
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Exiting so nodemon can retry...`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

export { app };
 
 

