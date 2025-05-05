import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);
router.use(checkRole(['Admin', 'HR Manager']));

// Basic route to test if the API works
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vacancy API is working',
    data: [] // In the future, you can implement actual vacancy functionality
  });
});

// This follows the module.exports pattern used in staffRoutes.js
export default router;
