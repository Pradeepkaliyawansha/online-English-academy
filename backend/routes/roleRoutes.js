import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/admin', verifyToken, checkRole(['Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin access granted', 
    user: req.user 
  });
});

// Lecturer routes
router.get('/lecturer', verifyToken, checkRole(['Lecturer', 'Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Lecturer access granted', 
    user: req.user 
  });
});

// Academic Manager routes
router.get('/academic-manager', verifyToken, checkRole(['Academic Manager', 'Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Academic Manager access granted', 
    user: req.user 
  });
});

// HR Manager routes
router.get('/hr-manager', verifyToken, checkRole(['HR Manager', 'Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'HR Manager access granted', 
    user: req.user 
  });
});

// Exam Manager routes
router.get('/exam-manager', verifyToken, checkRole(['Exam Manager', 'Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Exam Manager access granted', 
    user: req.user 
  });
});

// Exam Coordinator routes
router.get('/exam-coordinator', verifyToken, checkRole(['Exam Coordinator', 'Exam Manager', 'Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Exam Coordinator access granted', 
    user: req.user 
  });
});

// Finance Manager routes
router.get('/finance-manager', verifyToken, checkRole(['Finance Manager', 'Admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Finance Manager access granted', 
    user: req.user 
  });
});

export default router;
