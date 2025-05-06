import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaPlay,
} from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://localhost:5555/api";

const StudentQuizList = ({ courseId }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchQuizzes();
      fetchAttempts();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/quizzes?courseId=${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuizzes(response.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/quiz-attempts/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttempts(response.data);
    } catch (err) {
      console.error("Error fetching quiz attempts:", err);
      // Not setting error here as quizzes are more important
    }
  };

  const getAttemptForQuiz = (quizId) => {
    return attempts.find((attempt) => attempt.quizId === quizId);
  };

  const handleStartQuiz = (quizId) => {
    // Store courseId in localStorage for the quiz attempt page
    localStorage.setItem("currentCourseId", courseId);
    navigate(`/dashboard/quiz-attempt/${quizId}`);
  };

  const handleViewResult = (attemptId) => {
    navigate(`/dashboard/quiz-result/${attemptId}`);
  };

  if (loading) {
    return <div className="loading-spinner">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (quizzes.length === 0) {
    return (
      <div className="no-quizzes-message">
        <p>No quizzes are available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="student-quiz-list">
      <h3 className="section-title">Course Quizzes</h3>

      <div className="quiz-cards">
        {quizzes.map((quiz) => {
          const attempt = getAttemptForQuiz(quiz._id);
          const hasCompletedAttempt = attempt && attempt.status === "Completed";

          return (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <div className="quiz-icon">
                  <FaClipboardList />
                </div>
                <h4>{quiz.title}</h4>
              </div>

              <div className="quiz-card-content">
                <p className="quiz-description">{quiz.description}</p>

                <div className="quiz-meta">
                  <div className="meta-item">
                    <FaClock />
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="meta-item">
                    <FaTrophy />
                    <span>
                      Pass: {quiz.passingMarks}/{quiz.totalMarks}
                    </span>
                  </div>
                  <div className="meta-item">
                    <FaClipboardList />
                    <span>{quiz.questions.length} questions</span>
                  </div>
                </div>

                <div className="quiz-status">
                  {hasCompletedAttempt ? (
                    <div
                      className={`status-badge ${
                        attempt.isPassed ? "passed" : "failed"
                      }`}
                    >
                      {attempt.isPassed ? "Passed" : "Failed"} ({attempt.score}/
                      {quiz.totalMarks})
                    </div>
                  ) : (
                    <div className="status-badge not-attempted">
                      Not Attempted
                    </div>
                  )}
                </div>

                <div className="quiz-actions">
                  {hasCompletedAttempt ? (
                    <button
                      className="btn-secondary"
                      onClick={() => handleViewResult(attempt._id)}
                    >
                      View Result
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => handleStartQuiz(quiz._id)}
                    >
                      <FaPlay className="icon-left" /> Start Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentQuizList;
