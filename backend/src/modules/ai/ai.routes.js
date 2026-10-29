import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { analyzeResume } from './resume-analyzer/resume.service.js';
import { generateInterviewQuestions, evaluateAnswer } from './interview-simulator/interview.service.js';
import { generateCareerRoadmap, analyzeSkillGap } from './career-coach/career.service.js';
import { protect, authorize } from '../../middleware/auth.js';
import { ROLES } from '../../../../../packages/shared-constants/index.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Protect all AI routes
router.use(protect);

router.post('/resume/analyze', authorize(ROLES.STUDENT, ROLES.ADMIN), upload.single('resume'), async (req, res, next) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = req.body.jobDescription;

    if (req.file) {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Resume text or file is required.' });
    }

    const analysis = await analyzeResume(resumeText, jobDescription);
    res.status(200).json({ status: 'success', data: analysis });
  } catch (error) {
    if (error.message === 'Only PDF files are allowed!') {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
});

router.post('/interview/generate', authorize(ROLES.STUDENT, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { jobRole, skills, mode, count } = req.body;
    const questions = await generateInterviewQuestions(jobRole, skills, mode, count);
    res.status(200).json({ status: 'success', data: questions });
  } catch (error) {
    next(error);
  }
});

router.post('/interview/evaluate', authorize(ROLES.STUDENT, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    const evaluation = await evaluateAnswer(question, answer);
    res.status(200).json({ status: 'success', data: evaluation });
  } catch (error) {
    next(error);
  }
});

router.post('/career/roadmap', authorize(ROLES.STUDENT, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { targetRole, currentSkills, timeFrame } = req.body;
    const roadmap = await generateCareerRoadmap(targetRole, currentSkills, timeFrame);
    res.status(200).json({ status: 'success', data: roadmap });
  } catch (error) {
    next(error);
  }
});

router.post('/career/gap-analysis', authorize(ROLES.STUDENT, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { targetCompany, targetRole, userResume } = req.body;
    const gapAnalysis = await analyzeSkillGap(targetCompany, targetRole, userResume);
    res.status(200).json({ status: 'success', data: gapAnalysis });
  } catch (error) {
    next(error);
  }
});

export default router;
