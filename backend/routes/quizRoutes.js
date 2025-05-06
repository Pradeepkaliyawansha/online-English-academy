import express from "express";
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
} from "../controllers/quizController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Routes accessible by all authenticated users, but content filtered by role in controller
router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);

// Protected routes - only for Exam Manager and Admin
router.post("/", checkRole(["Admin", "Exam Manager"]), createQuiz);
router.put("/:id", checkRole(["Admin", "Exam Manager"]), updateQuiz);
router.delete("/:id", checkRole(["Admin", "Exam Manager"]), deleteQuiz);
router.patch(
  "/:id/status",
  checkRole(["Admin", "Exam Manager"]),
  toggleQuizStatus
);

export default router;
