import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../shared/Header";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaServer,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://localhost:5555/api";

const StudentExamPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [exams, setExams] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState({
    exams: true,
    courses: true,
    attempts: true,
  });
  const [error, setError] = useState({
    exams: null,
    courses: null,
    attempts: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all", // 'all', 'upcoming', 'available', 'completed'
    course: "all", // 'all' or specific course ID
  });

  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true,
  });

  useEffect(() => {
    checkServerConnection();
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      fetchExams();
      fetchAttempts();
    }
  }, [enrolledCourses]);

  const checkServerConnection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
      setServerStatus({
        connected: true,
        checking: false,
      });
      return true;
    } catch (err) {
      setServerStatus({
        connected: false,
        checking: false,
      });
      console.log("Server connection failed");
      return false;
    }
  };

  const fetchEnrolledCourses = () => {
    setLoading((prev) => ({ ...prev, courses: true }));

    try {
      // Get enrolled courses from localStorage
      const storedEnrollments = JSON.parse(
        localStorage.getItem("courseEnrollments") || "[]"
      );

      if (storedEnrollments.length > 0) {
        setEnrolledCourses(storedEnrollments);
        setError((prev) => ({ ...prev, courses: null }));
      } else {
        setError((prev) => ({ ...prev, courses: "No enrolled courses found" }));
      }
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError((prev) => ({
        ...prev,
        courses: "Failed to load enrolled courses",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const fetchExams = async () => {
    setLoading((prev) => ({ ...prev, exams: true }));

    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({ ...prev, exams: "Server connection failed" }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter exams to only show those for enrolled courses
      const enrolledCourseNames = enrolledCourses.map((course) =>
        course.courseName.toLowerCase().trim()
      );

      const filteredExams = response.data.filter((exam) =>
        enrolledCourseNames.includes(exam.course.toLowerCase().trim())
      );

      setExams(filteredExams);
      setError((prev) => ({ ...prev, exams: null }));
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError((prev) => ({ ...prev, exams: "Failed to load exams" }));

      // Fallback sample data for testing
      const sampleExams = [
        {
          id: 1,
          title: "Mid-term Grammar Test",
          course: enrolledCourses[0]?.courseName || "Advanced Grammar",
          description: "Mid-term test covering chapters 1-5",
          examDate: "2023-12-15",
          startTime: "10:00",
          endTime: "11:30",
          duration: "90",
          totalMarks: "100",
          passingMarks: "60",
          status: "Published",
        },
        {
          id: 2,
          title: "Final Grammar Assessment",
          course: enrolledCourses[0]?.courseName || "Advanced Grammar",
          description: "Final assessment covering all chapters",
          examDate: "2023-12-20",
          startTime: "14:00",
          endTime: "16:00",
          duration: "120",
          totalMarks: "150",
          passingMarks: "90",
          status: "Published",
        },
      ];

      setExams(sampleExams);
    } finally {
      setLoading((prev) => ({ ...prev, exams: false }));
    }
  };

  const fetchAttempts = async () => {
    setLoading((prev) => ({ ...prev, attempts: true }));

    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({ ...prev, attempts: "Server connection failed" }));
        return;
      }

      const token = localStorage.getItem("token");

      // Get attempt history for each enrolled course
      const allAttempts = [];

      for (const course of enrolledCourses) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/quiz-attempts/course/${course.courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          allAttempts.push(...response.data);
        } catch (err) {
          console.error(
            `Error fetching attempts for course ${course.courseName}:`,
            err
          );
        }
      }

      setAttempts(allAttempts);
      setError((prev) => ({ ...prev, attempts: null }));
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setError((prev) => ({
        ...prev,
        attempts: "Failed to load exam attempts",
      }));

      // Sample data for testing
      setAttempts([]);
    } finally {
      setLoading((prev) => ({ ...prev, attempts: false }));
    }
  };

  const getAttemptForExam = (examId) => {
    return attempts.find((attempt) => attempt.examId === examId);
  };

  const handleStartExam = (exam) => {
    // Store course ID in localStorage for the exam attempt page
    const course = enrolledCourses.find(
      (c) =>
        c.courseName.toLowerCase().trim() === exam.course.toLowerCase().trim()
    );

    if (course) {
      localStorage.setItem("currentCourseId", course.courseId);
      navigate(`/dashboard/exam-attempt/${exam.id || exam._id}`);
    } else {
      alert("Error: Course information not found");
    }
  };

  const handleViewResult = (attemptId) => {
    navigate(`/dashboard/exam-result/${attemptId}`);
  };

  // Filter exams based on search term and filters
  const getFilteredExams = () => {
    if (!exams || exams.length === 0) return [];

    return exams.filter((exam) => {
      // Search term filter
      const matchesSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.description &&
          exam.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Course filter
      if (filters.course !== "all" && exam.course !== filters.course) {
        return false;
      }

      // Status filter
      if (filters.status === "all") return true;

      const today = new Date();
      const examDate = new Date(exam.examDate);
      const examStartTime = exam.startTime.split(":");
      const examEndTime = exam.endTime.split(":");

      // Set exam start and end datetime
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(
        parseInt(examStartTime[0]),
        parseInt(examStartTime[1]),
        0
      );

      const examEndDateTime = new Date(examDate);
      examEndDateTime.setHours(
        parseInt(examEndTime[0]),
        parseInt(examEndTime[1]),
        0
      );

      // Check if exam is upcoming, available, or completed
      if (filters.status === "upcoming" && examStartDateTime > today) {
        return true;
      }

      if (
        filters.status === "available" &&
        examStartDateTime <= today &&
        examEndDateTime >= today
      ) {
        return true;
      }

      if (filters.status === "completed" && examEndDateTime < today) {
        return true;
      }

      return false;
    });
  };

  const filteredExams = getFilteredExams();

  // Get the status of an exam (upcoming, available, completed)
  const getExamStatus = (exam) => {
    const today = new Date();
    const examDate = new Date(exam.examDate);
    const examStartTime = exam.startTime.split(":");
    const examEndTime = exam.endTime.split(":");

    // Set exam start and end datetime
    const examStartDateTime = new Date(examDate);
    examStartDateTime.setHours(
      parseInt(examStartTime[0]),
      parseInt(examStartTime[1]),
      0
    );

    const examEndDateTime = new Date(examDate);
    examEndDateTime.setHours(
      parseInt(examEndTime[0]),
      parseInt(examEndTime[1]),
      0
    );

    if (examStartDateTime > today) {
      return "upcoming";
    } else if (examStartDateTime <= today && examEndDateTime >= today) {
      return "available";
    } else {
      return "completed";
    }
  };

  // Get unique courses from exams
  const uniqueCourses = [...new Set(exams.map((exam) => exam.course))];

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <>
      <Header title="My Exams" />

      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}

      <div className="filter-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>
              <FaFilter className="icon-left" /> Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Exams</option>
              <option value="upcoming">Upcoming</option>
              <option value="available">Available Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaFilter className="icon-left" /> Course:
            </label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange("course", e.target.value)}
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading.courses || loading.exams ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading exams...</p>
        </div>
      ) : error.courses ? (
        <div className="error-message">
          <p>{error.courses}</p>
          <p>Please enroll in courses to access exams.</p>
          <Link to="/dashboard/courses" className="btn-primary">
            View Available Courses
          </Link>
        </div>
      ) : error.exams ? (
        <div className="error-message">
          <p>{error.exams}</p>
          <button className="btn-primary" onClick={fetchExams}>
            Retry
          </button>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="no-data-message">
          <p>No exams found matching your search criteria.</p>
        </div>
      ) : (
        <div className="exam-cards-container">
          {filteredExams.map((exam) => {
            const examStatus = getExamStatus(exam);
            const attempt = getAttemptForExam(exam.id || exam._id);
            const hasCompletedAttempt =
              attempt && attempt.status === "Completed";

            return (
              <div key={exam.id || exam._id} className="exam-card">
                <div className="exam-card-header">
                  <h3 className="exam-title">{exam.title}</h3>
                  <span className={`status-badge ${examStatus}`}>
                    {examStatus === "upcoming"
                      ? "Upcoming"
                      : examStatus === "available"
                      ? "Available Now"
                      : "Completed"}
                  </span>
                </div>

                <div className="exam-card-content">
                  <div className="exam-course">{exam.course}</div>
                  <p className="exam-description">{exam.description}</p>

                  <div className="exam-details">
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{exam.examDate}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <span>
                        {exam.startTime} - {exam.endTime}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="detail-item">
                      <FaTrophy className="detail-icon" />
                      <span>
                        Passing: {exam.passingMarks}/{exam.totalMarks}
                      </span>
                    </div>
                  </div>

                  {hasCompletedAttempt && (
                    <div className="attempt-result">
                      <div
                        className={`result-badge ${
                          attempt.isPassed ? "passed" : "failed"
                        }`}
                      >
                        {attempt.isPassed ? (
                          <>
                            <FaCheckCircle /> Passed
                          </>
                        ) : (
                          <>
                            <FaTimesCircle /> Failed
                          </>
                        )}
                      </div>
                      <div className="score">
                        Score: {attempt.score}/{exam.totalMarks}
                      </div>
                    </div>
                  )}

                  <div className="exam-actions">
                    {examStatus === "available" && !hasCompletedAttempt ? (
                      <button
                        className="btn-primary start-exam"
                        onClick={() => handleStartExam(exam)}
                      >
                        <FaPlay className="icon-left" /> Start Exam
                      </button>
                    ) : hasCompletedAttempt ? (
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          handleViewResult(attempt.id || attempt._id)
                        }
                      >
                        View Results
                      </button>
                    ) : examStatus === "upcoming" ? (
                      <div className="not-available-message">
                        Exam will be available on {exam.examDate} at{" "}
                        {exam.startTime}
                      </div>
                    ) : (
                      <div className="not-available-message">
                        Exam is no longer available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default StudentExamPage;
