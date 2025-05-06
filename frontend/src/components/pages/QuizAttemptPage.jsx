import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import axios from "axios";
import Header from "../shared/Header";

const API_BASE_URL = "http://localhost:5555/api";

const QuizAttemptPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  //   const { currentUser } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Start the quiz attempt
    startQuizAttempt();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!attempt || quizSubmitted) return;

    let timer;
    if (timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Auto-submit when time runs out
      handleSubmitQuiz();
    }

    return () => clearTimeout(timer);
  }, [timeRemaining, quizSubmitted]);

  const startQuizAttempt = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Find the course ID from the URL or state
      const courseId = localStorage.getItem("currentCourseId");

      if (!courseId) {
        setError(
          "Course information is missing. Please go back and try again."
        );
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/quiz-attempts/start`,
        { quizId, courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Initialize the quiz data
      setQuiz(response.data.quiz);
      setAttempt(response.data.attempt);

      // Initialize selected options array with same length as questions
      const initialSelectedOptions = response.data.quiz.questions.map(
        () => null
      );
      setSelectedOptions(initialSelectedOptions);

      // Set time remaining in seconds
      setTimeRemaining(response.data.quiz.timeLimit * 60);

      setLoading(false);
    } catch (err) {
      console.error("Error starting quiz attempt:", err);
      setError(
        err.response?.data?.message || "Failed to start quiz. Please try again."
      );
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[questionIndex] = optionIndex;
    setSelectedOptions(updatedOptions);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      // Check if there are any unanswered questions
      const unansweredQuestions = selectedOptions.findIndex(
        (option) => option === null
      );

      if (
        unansweredQuestions !== -1 &&
        !confirm(
          "You have unanswered questions. Are you sure you want to submit?"
        )
      ) {
        return;
      }

      setLoading(true);
      const token = localStorage.getItem("token");

      // Format the answers for submission
      const answers = selectedOptions.map((option, index) => ({
        questionIndex: index,
        selectedOption: option || 0, // Default to first option if not answered
      }));

      const response = await axios.post(
        `${API_BASE_URL}/quiz-attempts/submit`,
        {
          attemptId: attempt._id,
          answers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuizSubmitted(true);
      setResults(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit quiz. Please try again."
      );
      setLoading(false);
    }
  };

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const answeredCount = selectedOptions.filter(
      (option) => option !== null
    ).length;
    return Math.floor((answeredCount / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <>
        <Header title="Taking Quiz" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Quiz Error" />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </>
    );
  }

  // Show quiz results if submitted
  if (quizSubmitted && results) {
    return (
      <>
        <Header title="Quiz Results" />
        <div className="quiz-results-container">
          <div className="quiz-result-card">
            <div className="result-header">
              <h2>{quiz.title} - Results</h2>
              <div
                className={`result-status ${
                  results.isPassed ? "passed" : "failed"
                }`}
              >
                {results.isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{results.isPassed ? "Passed" : "Failed"}</span>
              </div>
            </div>

            <div className="result-stats">
              <div className="stat-item">
                <span className="stat-label">Your Score</span>
                <span className="stat-value">
                  {results.score}/{results.totalMarks}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Passing Score</span>
                <span className="stat-value">{results.passingMarks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Percentage</span>
                <span className="stat-value">
                  {Math.round((results.score / results.totalMarks) * 100)}%
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show the actual quiz
  const currentQuestion = quiz?.questions[currentQuestionIndex];

  return (
    <>
      <Header title="Taking Quiz" />

      <div className="quiz-container">
        <div className="quiz-header">
          <h2>{quiz.title}</h2>
          <div className="quiz-meta">
            <div className="time-remaining">
              <FaClock /> Time Remaining: {formatTime(timeRemaining)}
            </div>
            <div className="question-progress">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        <div className="question-card">
          <h3 className="question-text">{currentQuestion.question}</h3>

          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`option-item ${
                  selectedOptions[currentQuestionIndex] === index
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleOptionSelect(currentQuestionIndex, index)}
              >
                <div className="option-selector">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${currentQuestionIndex}`}
                    checked={selectedOptions[currentQuestionIndex] === index}
                    onChange={() =>
                      handleOptionSelect(currentQuestionIndex, index)
                    }
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              </div>
            ))}
          </div>

          <div className="question-navigation">
            <button
              className="btn-secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button className="btn-primary" onClick={handleNextQuestion}>
                Next
              </button>
            ) : (
              <button
                className="btn-primary submit-quiz"
                onClick={handleSubmitQuiz}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        <div className="questions-overview">
          <h3>Questions Overview</h3>
          <div className="questions-grid">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                className={`question-number ${
                  index === currentQuestionIndex ? "current" : ""
                } ${selectedOptions[index] !== null ? "answered" : ""}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className="btn-primary submit-quiz-bottom"
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </>
  );
};

export default QuizAttemptPage;
