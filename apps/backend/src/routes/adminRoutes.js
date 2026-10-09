import express from 'express';
import multer from 'multer';
import { getAdminStats, globalSearch, getAllUsers, verifyUser, createUser, deleteUser, getSystemHealth, getDatabaseStats, validateStudentsImport, confirmStudentsImport, getCollections, getDocuments, createDocument, updateDocument, deleteDocument, auditCollection } from '../controllers/adminController.js';
import { inviteAlumni, resendAlumniInvite, getAlumniDirectory } from '../controllers/alumniAdminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check if user is Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// All admin routes are protected and require Admin role
router.use(protect);
router.use(isAdmin);

router.get('/stats', getAdminStats);
router.get('/search', globalSearch);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.post('/import-students/validate', upload.single('file'), validateStudentsImport);
router.post('/import-students/confirm', confirmStudentsImport);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);
router.get('/health', getSystemHealth);
router.get('/db/stats', getDatabaseStats);
router.get('/db/collections', getCollections);
router.get('/db/:collection/documents', getDocuments);
router.post('/db/:collection/documents', createDocument);
router.put('/db/:collection/documents/:id', updateDocument);
router.delete('/db/:collection/documents/:id', deleteDocument);
router.post('/db/:collection/audit', auditCollection);

export default router;
