import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentStats
} from '../controllers/studentController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);
router.use(checkRole(['Student', 'Admin']));  // Allow both students and admins

// Student profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Student statistics route
router.get('/stats', getStudentStats);

export default router;
