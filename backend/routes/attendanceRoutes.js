import express from 'express';
import {
  getAttendanceByDate,
  markAttendance,
  markBatchAttendance,
  updateAttendance,
  getAttendanceStats,
  getAttendanceSummary
} from '../controllers/attendanceController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Routes accessible by HR Manager and Admin
router.get('/', checkRole(['Admin', 'HR Manager']), getAttendanceByDate);
router.post('/', checkRole(['Admin', 'HR Manager']), markAttendance);
router.post('/batch', checkRole(['Admin', 'HR Manager']), markBatchAttendance);
router.put('/:id', checkRole(['Admin', 'HR Manager']), updateAttendance);
router.get('/stats', checkRole(['Admin', 'HR Manager']), getAttendanceStats);
router.get('/summary', checkRole(['Admin', 'HR Manager']), getAttendanceSummary);

export default router;
