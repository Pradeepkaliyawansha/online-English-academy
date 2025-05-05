import express from 'express';
import {
  getAllTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} from '../controllers/timetableController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Routes accessible by Academic Manager, Lecturers, and Admin
router.get('/', getAllTimetableEntries);
router.get('/:id', getTimetableEntryById);

// Protected routes - only for Academic Manager and Admin
router.post('/', checkRole(['Admin', 'Academic Manager']), createTimetableEntry);
router.put('/:id', checkRole(['Admin', 'Academic Manager']), updateTimetableEntry);
router.delete('/:id', checkRole(['Admin', 'Academic Manager']), deleteTimetableEntry);

export default router;
