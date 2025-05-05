import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import DashboardLayout from "./components/shared/DashboardLayout";
import DashboardRouter from "./components/DashboardRouter";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/pages/Unauthorized";
import UserManagement from "./components/pages/UserManagement";
import AppInitializer from "./components/AppInitializer";
import SalaryPayment from "./components/pages/SalaryPayment";
import AcademicTimetablePage from "./components/pages/AcademicTimetablePage";
import ExamTimetablePage from "./components/pages/ExamTimetablePage";
import AllCoursesPage from "./components/pages/AllCoursesPage";
import AllExamsPage from "./components/pages/AllExamsPage";
import CoursesDashboard from "./components/dashboards/CoursesDashboard";
import TimetableDashboard from "./components/dashboards/TimetableDashboard";
// Import new public pages
import HomePage from "./components/pages/public/HomePage";
import CourseCatalogPage from "./components/pages/public/CourseCatalogPage";
import CourseDetailsPage from "./components/pages/public/CourseDetailsPage";
import ContactPage from "./components/pages/public/ContactPage";
import AboutPage from "./components/pages/public/AboutPage";
import PublicLayout from "./components/shared/PublicLayout";
// Import the new CoursePaymentPage component
import CoursePaymentPage from "./components/pages/CoursePaymentPage";
import CourseDetails from "./components/courses/CourseDetails";
import "./styles/Dashboard.css";
import CourseEnrolled from "./components/courses/CourseEnrolled";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInitializer />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses-catalog" element={<CourseCatalogPage />} />
            <Route path="/course/:id" element={<CourseDetailsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardRouter />} />

              {/* Academic Manager routes */}
              <Route
                path="courses"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Academic Manager"]}>
                    <CoursesDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="timetable"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Academic Manager"]}>
                    <TimetableDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes - Fixed UserManagement route */}
              <Route path="users" element={<UserManagement />} />
              <Route
                path="lecturers"
                element={<ProtectedRoute allowedRoles={["Admin"]} />}
              />
              <Route
                path="hr"
                element={<ProtectedRoute allowedRoles={["Admin"]} />}
              />
              <Route
                path="exams"
                element={<ProtectedRoute allowedRoles={["Admin"]} />}
              />
              <Route
                path="finance"
                element={<ProtectedRoute allowedRoles={["Admin"]} />}
              />

              {/* Finance Manager routes */}
              <Route
                path="payments"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Finance Manager"]} />
                }
              />
              <Route
                path="invoices"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Finance Manager"]} />
                }
              />
              <Route
                path="financial-reports"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Finance Manager"]} />
                }
              />

              {/* Add Salary Payment route */}
              <Route
                path="salary-payment"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Finance Manager"]}>
                    <SalaryPayment />
                  </ProtectedRoute>
                }
              />

              {/* Add exam management routes */}
              <Route
                path="exam-management"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Exam Manager", "Exam Coordinator"]}
                  >
                    {/* This would be a dedicated exam management page */}
                  </ProtectedRoute>
                }
              />

              <Route
                path="student-exams"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Exam Manager", "Student"]}
                  >
                    {/* This would be a dedicated page for students to view their exams */}
                  </ProtectedRoute>
                }
              />

              {/* Other existing routes... */}
              <Route
                path="students"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Lecturer", "Academic Manager"]}
                  />
                }
              />
              <Route
                path="curriculum"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Academic Manager"]}
                  />
                }
              />
              <Route
                path="course-management"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Academic Manager"]}
                  />
                }
              />
              <Route
                path="lecturer-management"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Academic Manager"]}
                  />
                }
              />
              <Route
                path="staff"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "HR Manager"]} />
                }
              />
              <Route
                path="recruitment"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "HR Manager"]} />
                }
              />
              <Route
                path="exam-schedule"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Exam Manager"]} />
                }
              />
              <Route
                path="exam-results"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Exam Manager"]} />
                }
              />
              <Route
                path="proctoring"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Exam Manager", "Exam Coordinator"]}
                  />
                }
              />
              <Route
                path="exam-materials"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Exam Manager", "Exam Coordinator"]}
                  />
                }
              />
              <Route
                path="academic-timetable"
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Academic Manager", "Lecturer"]}
                  >
                    <AcademicTimetablePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="exam-timetable"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Admin",
                      "Exam Manager",
                      "Exam Coordinator",
                      "Lecturer",
                    ]}
                  >
                    <ExamTimetablePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-courses"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <AllCoursesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="exam-timetable"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <AllExamsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="course-payment/:id"
                element={
                  <ProtectedRoute>
                    <CoursePaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="course/:courseId" element={<CourseDetails />} />
              <Route
                path="course/enrolled/:courseId"
                element={<CourseEnrolled />}
              />
            </Route>
          </Route>

          {/* Redirect unknown routes to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
