import express from 'express';
import multer from 'multer';

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
import { 
  analyzeResume, 
  mockInterview, 
  generateRoadmap, 
  analyzeSkillGap, 
  generateQuestions, 
  evaluateAnswer,
  generateAssessmentQuestions,
  generateVerificationRubric,
  enhanceBounty
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/resume-analyzer', protect, upload.single('resume'), analyzeResume);
router.post('/mock-interview', protect, mockInterview);
router.post('/career/roadmap', protect, generateRoadmap);
router.post('/career/gap-analysis', protect, analyzeSkillGap);
router.post('/interview/generate', protect, generateQuestions);
router.post('/interview/evaluate', protect, evaluateAnswer);
router.post('/assessment/generate', protect, upload.single('pdf'), generateAssessmentQuestions);
router.post('/verification-rubric', protect, generateVerificationRubric);
router.post('/enhance-bounty', protect, enhanceBounty);

export default router;
