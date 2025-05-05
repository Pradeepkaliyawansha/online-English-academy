import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Public routes - viewable by all authenticated users
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Protected routes - only for Academic Manager and Admin
router.post(
  "/",
  checkRole(["Admin", "Academic Manager"]),
  upload.single("image"),
  createCourse
);
router.put(
  "/:id",
  checkRole(["Admin", "Academic Manager"]),
  upload.single("image"),
  updateCourse
);
router.delete("/:id", checkRole(["Admin", "Academic Manager"]), deleteCourse);

export default router;
