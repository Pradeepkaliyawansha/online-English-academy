import express from 'express';
import {
  getAllPublicCourses,
  getPublicCourseById,
  getFeaturedCourses
} from '../controllers/publicController.js';

const router = express.Router();

// Public course routes - no authentication required
router.get('/courses/public', getAllPublicCourses);
router.get('/courses/public/featured', getFeaturedCourses);
router.get('/courses/public/:id', getPublicCourseById);

export default router;
