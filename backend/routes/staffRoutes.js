import express from 'express';
import { 
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats
} from '../controllers/staffController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Read-only routes for Finance Manager
router.get('/', checkRole(['Admin', 'HR Manager', 'Finance Manager']), getAllStaff);
router.get('/stats', checkRole(['Admin', 'HR Manager']), getStaffStats);
router.get('/:id', checkRole(['Admin', 'HR Manager', 'Finance Manager']), getStaffById);

// Write routes only for HR and Admin
router.post('/', checkRole(['Admin', 'HR Manager']), createStaff);
router.put('/:id', checkRole(['Admin', 'HR Manager']), updateStaff);
router.delete('/:id', checkRole(['Admin', 'HR Manager']), deleteStaff);

export default router;
