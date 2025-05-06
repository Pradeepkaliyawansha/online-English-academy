import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTimes,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaFilePdf,
  FaEye,
  FaCheck,
} from "react-icons/fa";
import Header from "../shared/Header";
import axios from "axios";
import { exportToPDF } from "../../utils/exportUtils";

const API_BASE_URL = "http://localhost:5555/api";

const QuizManagementPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Form states
  const [showAddQuizForm, setShowAddQuizForm] = useState(false);
  const [showEditQuizForm, setShowEditQuizForm] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // New quiz data
  const [newQuizData, setNewQuizData] = useState({
    title: "",
    courseId: "",
    description: "",
    timeLimit: 30,
    passingMarks: 60,
    questions: [],
  });

  // New question data
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: 0,
    marks: 1,
  });

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuizzes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Use sample data if API fails
      setCourses([
        { _id: "1", name: "Advanced Grammar" },
        { _id: "2", name: "Business English" },
        { _id: "3", name: "IELTS Preparation" },
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuizData({
      ...newQuizData,
      [name]: value,
    });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    });
  };

  const removeOption = (index) => {
    if (newQuestion.options.length <= 2) {
      alert("At least 2 options are required");
      return;
    }

    const updatedOptions = newQuestion.options.filter((_, i) => i !== index);

    // Adjust correct answer index if necessary
    let correctAnswer = newQuestion.correctAnswer;
    if (index === correctAnswer) {
      correctAnswer = 0; // Default to first option if the correct one is removed
    } else if (index < correctAnswer) {
      correctAnswer--; // Decrement if an option before the correct one is removed
    }

    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
      correctAnswer,
    });
  };

  const addQuestion = () => {
    // Validate question
    if (!newQuestion.question.trim()) {
      alert("Question text is required");
      return;
    }

    // Validate options
    for (const option of newQuestion.options) {
      if (!option.trim()) {
        alert("All options must be filled");
        return;
      }
    }

    setNewQuizData({
      ...newQuizData,
      questions: [...newQuizData.questions, { ...newQuestion }],
    });

    // Reset form for next question
    setNewQuestion({
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      marks: 1,
    });
  };

  const removeQuestion = (index) => {
    setNewQuizData({
      ...newQuizData,
      questions: newQuizData.questions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate quiz data
    if (
      !newQuizData.title.trim() ||
      !newQuizData.courseId ||
      !newQuizData.description.trim()
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    if (newQuizData.questions.length === 0) {
      setFormError("At least one question is required");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/quizzes`,
        newQuizData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form and fetch updated list
      setQuizzes([...quizzes, response.data.quiz]);
      setNewQuizData({
        title: "",
        courseId: "",
        description: "",
        timeLimit: 30,
        passingMarks: 60,
        questions: [],
      });
      setShowAddQuizForm(false);
      alert("Quiz created successfully");
    } catch (err) {
      console.error("Error creating quiz:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to create quiz. Please try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (quiz) => {
    setCurrentQuiz(quiz);
    setNewQuizData({
      title: quiz.title,
      courseId: quiz.courseId,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingMarks: quiz.passingMarks,
      questions: quiz.questions,
    });
    setShowEditQuizForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate quiz data
    if (
      !newQuizData.title.trim() ||
      !newQuizData.courseId ||
      !newQuizData.description.trim()
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    if (newQuizData.questions.length === 0) {
      setFormError("At least one question is required");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/quizzes/${currentQuiz._id}`,
        newQuizData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the quiz in state
      setQuizzes(
        quizzes.map((q) => (q._id === currentQuiz._id ? response.data.quiz : q))
      );
      setShowEditQuizForm(false);
      alert("Quiz updated successfully");
    } catch (err) {
      console.error("Error updating quiz:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to update quiz. Please try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (quiz) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the quiz "${quiz.title}"?`
      )
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/quizzes/${quiz._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the quiz from state
      setQuizzes(quizzes.filter((q) => q._id !== quiz._id));
      alert("Quiz deleted successfully");
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete quiz. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (quiz) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/quizzes/${quiz._id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the quiz in state
      setQuizzes(
        quizzes.map((q) => (q._id === quiz._id ? response.data.quiz : q))
      );
      alert(
        `Quiz ${
          response.data.quiz.status === "Published"
            ? "published"
            : "unpublished"
        } successfully`
      );
    } catch (err) {
      console.error("Error toggling quiz status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update quiz status. Please try again."
      );
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const filteredQuizzes = quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const quizData = filteredQuizzes.map((quiz) => ({
        title: quiz.title,
        course:
          courses.find((c) => c._id === quiz.courseId)?.name ||
          "Unknown Course",
        questions: quiz.questions.length,
        timeLimit: `${quiz.timeLimit} min`,
        passingMarks: quiz.passingMarks,
        status: quiz.status,
      }));

      const date = new Date().toISOString().split("T")[0];
      const filename = `quizzes_report_${date}`;

      exportToPDF(
        quizData,
        filename,
        ["title", "course", "questions", "timeLimit", "passingMarks", "status"],
        "Quiz Management Report"
      );
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const viewQuizDetails = (quiz) => {
    // Store the quiz in local storage for the details page
    localStorage.setItem("currentQuiz", JSON.stringify(quiz));
    navigate(`/dashboard/quiz/${quiz._id}`);
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header title="Quiz Management" />

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => setShowAddQuizForm(true)}
        >
          <FaPlus className="icon-left" /> Create New Quiz
        </button>
        <button
          className="btn-primary pdf-btn"
          onClick={handleGeneratePDF}
          disabled={pdfLoading || quizzes.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Quiz Overview</h3>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading quizzes...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="no-results">
            No quizzes found. Create your first quiz!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Questions</th>
                <th>Time Limit</th>
                <th>Passing Marks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td>
                    {courses.find((c) => c._id === quiz.courseId)?.name ||
                      "Unknown Course"}
                  </td>
                  <td>{quiz.questions.length}</td>
                  <td>{quiz.timeLimit} minutes</td>
                  <td>
                    {quiz.passingMarks}/{quiz.totalMarks}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${quiz.status.toLowerCase()}`}
                    >
                      {quiz.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-small"
                        onClick={() => viewQuizDetails(quiz)}
                        title="View Quiz Details"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        className="btn-small"
                        onClick={() => handleEdit(quiz)}
                        title="Edit Quiz"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn-small"
                        onClick={() => handleToggleStatus(quiz)}
                        title={
                          quiz.status === "Published"
                            ? "Unpublish Quiz"
                            : "Publish Quiz"
                        }
                      >
                        <FaCheck />{" "}
                        {quiz.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="btn-small delete"
                        onClick={() => handleDelete(quiz)}
                        title="Delete Quiz"
                        disabled={deleteLoading}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Quiz Modal */}
      {showAddQuizForm && (
        <div className="modal-overlay">
          <div className="modal-content quiz-form-modal">
            <div className="modal-header">
              <h3>Create New Quiz</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddQuizForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Quiz Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newQuizData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="courseId">Course</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={newQuizData.courseId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newQuizData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="timeLimit">Time Limit (minutes)</label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={newQuizData.timeLimit}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="passingMarks">Passing Marks (%)</label>
                  <input
                    type="number"
                    id="passingMarks"
                    name="passingMarks"
                    value={newQuizData.passingMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <h4>Questions ({newQuizData.questions.length})</h4>

              {newQuizData.questions.length > 0 && (
                <div className="questions-list">
                  {newQuizData.questions.map((q, index) => (
                    <div key={index} className="question-item">
                      <div className="question-header">
                        <h5>Question {index + 1}</h5>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => removeQuestion(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <p>
                        <strong>Q:</strong> {q.question}
                      </p>
                      <p>
                        <strong>Options:</strong>
                      </p>
                      <ul className="options-list">
                        {q.options.map((option, i) => (
                          <li
                            key={i}
                            className={
                              i === q.correctAnswer ? "correct-option" : ""
                            }
                          >
                            {option} {i === q.correctAnswer && " (Correct)"}
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>Marks:</strong> {q.marks}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-question-section">
                <h4>Add New Question</h4>

                <div className="form-group">
                  <label htmlFor="question">Question Text</label>
                  <textarea
                    id="question"
                    name="question"
                    value={newQuestion.question}
                    onChange={handleQuestionChange}
                    rows="2"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Options</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                      />
                      <div className="option-actions">
                        <label>
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={newQuestion.correctAnswer === index}
                            onChange={() =>
                              setNewQuestion({
                                ...newQuestion,
                                correctAnswer: index,
                              })
                            }
                          />
                          Correct
                        </label>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => removeOption(index)}
                          title="Remove Option"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-small"
                    onClick={addOption}
                  >
                    Add Option
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="marks">Marks</label>
                  <input
                    type="number"
                    id="marks"
                    name="marks"
                    value={newQuestion.marks}
                    onChange={handleQuestionChange}
                    min="1"
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={addQuestion}
                >
                  Add Question
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddQuizForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    formSubmitting || newQuizData.questions.length === 0
                  }
                >
                  {formSubmitting ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditQuizForm && currentQuiz && (
        <div className="modal-overlay">
          <div className="modal-content quiz-form-modal">
            <div className="modal-header">
              <h3>Edit Quiz</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditQuizForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="edit-title">Quiz Title</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={newQuizData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-courseId">Course</label>
                <select
                  id="edit-courseId"
                  name="courseId"
                  value={newQuizData.courseId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={newQuizData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-timeLimit">Time Limit (minutes)</label>
                  <input
                    type="number"
                    id="edit-timeLimit"
                    name="timeLimit"
                    value={newQuizData.timeLimit}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-passingMarks">Passing Marks (%)</label>
                  <input
                    type="number"
                    id="edit-passingMarks"
                    name="passingMarks"
                    value={newQuizData.passingMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <h4>Questions ({newQuizData.questions.length})</h4>

              {newQuizData.questions.length > 0 && (
                <div className="questions-list">
                  {newQuizData.questions.map((q, index) => (
                    <div key={index} className="question-item">
                      <div className="question-header">
                        <h5>Question {index + 1}</h5>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => removeQuestion(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <p>
                        <strong>Q:</strong> {q.question}
                      </p>
                      <p>
                        <strong>Options:</strong>
                      </p>
                      <ul className="options-list">
                        {q.options.map((option, i) => (
                          <li
                            key={i}
                            className={
                              i === q.correctAnswer ? "correct-option" : ""
                            }
                          >
                            {option} {i === q.correctAnswer && " (Correct)"}
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>Marks:</strong> {q.marks}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-question-section">
                <h4>Add New Question</h4>

                <div className="form-group">
                  <label htmlFor="edit-question">Question Text</label>
                  <textarea
                    id="edit-question"
                    name="question"
                    value={newQuestion.question}
                    onChange={handleQuestionChange}
                    rows="2"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Options</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                      />
                      <div className="option-actions">
                        <label>
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={newQuestion.correctAnswer === index}
                            onChange={() =>
                              setNewQuestion({
                                ...newQuestion,
                                correctAnswer: index,
                              })
                            }
                          />
                          Correct
                        </label>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => removeOption(index)}
                          title="Remove Option"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-small"
                    onClick={addOption}
                  >
                    Add Option
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-marks">Marks</label>
                  <input
                    type="number"
                    id="edit-marks"
                    name="marks"
                    value={newQuestion.marks}
                    onChange={handleQuestionChange}
                    min="1"
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={addQuestion}
                >
                  Add Question
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditQuizForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    formSubmitting || newQuizData.questions.length === 0
                  }
                >
                  {formSubmitting ? "Updating..." : "Update Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizManagementPage;
