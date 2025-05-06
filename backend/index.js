import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import vacancyRoutes from "./routes/vacancyRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quizAttemptRoutes from "./routes/quizAttemptRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the uploads directory
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

app.get("/", (request, response) => {
  return response.status(200).send("Welcome To Online English Academy API");
});

// Basic route for server status checks
app.get("/api", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is operational" });
});

// Public routes don't need authentication
app.use("/api", publicRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/vacancies", vacancyRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);

// Add the quiz routes
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
      console.log(`Staff API available at: http://localhost:${PORT}/api/staff`);
      console.log(`Exam API available at: http://localhost:${PORT}/api/exams`);
      console.log(
        `Attendance API available at: http://localhost:${PORT}/api/attendance`
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
