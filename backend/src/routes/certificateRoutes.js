import express from 'express';
import { getMyCertificates, addCertificate, deleteCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require auth

router.route('/').get(getMyCertificates).post(addCertificate);
router.route('/:id').delete(deleteCertificate);

export default router;
