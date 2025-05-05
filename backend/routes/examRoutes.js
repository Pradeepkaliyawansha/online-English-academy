import express from 'express';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  toggleExamStatus
} from '../controllers/examController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Routes accessible by all authenticated users, but content filtered by role in controller
router.get('/', getAllExams);
router.get('/:id', getExamById);

// Protected routes - only for Exam Coordinator, Exam Manager, and Admin
router.post('/', checkRole(['Admin', 'Exam Manager', 'Exam Coordinator']), createExam);
router.put('/:id', checkRole(['Admin', 'Exam Manager', 'Exam Coordinator']), updateExam);
router.delete('/:id', checkRole(['Admin', 'Exam Manager', 'Exam Coordinator']), deleteExam);
router.patch('/:id/status', checkRole(['Admin', 'Exam Manager', 'Exam Coordinator']), toggleExamStatus);

export default router;
