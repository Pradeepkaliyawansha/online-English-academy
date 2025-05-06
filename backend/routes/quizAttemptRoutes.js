import express from "express";
import {
  startQuizAttempt,
  submitQuizAttempt,
  getStudentQuizAttempts,
  getCourseQuizAttempts,
  getQuizAttemptById,
} from "../controllers/quizAttemptController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Routes accessible only by Student and Admin
router.post("/start", checkRole(["Student", "Admin"]), startQuizAttempt);
router.post("/submit", checkRole(["Student", "Admin"]), submitQuizAttempt);
router.get("/student", checkRole(["Student", "Admin"]), getStudentQuizAttempts);
router.get(
  "/course/:courseId",
  checkRole(["Student", "Admin"]),
  getCourseQuizAttempts
);

// Route for viewing attempt details - accessible by Student (own attempts only), Exam Manager, and Admin
router.get("/:id", getQuizAttemptById);

export default router;
