import express from 'express';
import { 
  createSalaryPayment, 
  getSalaryPaymentHistory,
  getStaffPaymentHistory,
  updateSalaryPayment,
  deleteSalaryPayment
} from '../controllers/paymentController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Finance manager can get payment history and create payments
router.get('/salary-history', checkRole(['Admin', 'Finance Manager']), getSalaryPaymentHistory);
router.post('/salary', checkRole(['Admin', 'Finance Manager']), createSalaryPayment);

// Get payment history for a specific staff
router.get('/salary-history/:staffId', checkRole(['Admin', 'Finance Manager', 'HR Manager']), getStaffPaymentHistory);

// Add routes for updating and deleting payments
router.put('/salary/:paymentId', checkRole(['Admin', 'Finance Manager']), updateSalaryPayment);
router.delete('/salary/:paymentId', checkRole(['Admin', 'Finance Manager']), deleteSalaryPayment);

export default router;
