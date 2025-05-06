import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../shared/Header";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FaPlus,
  FaTimes,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaFilePdf,
  FaEye,
  FaCheck,
  FaServer,
} from "react-icons/fa";
import axios from "axios";
import { exportToPDF } from "../../utils/exportUtils";

const API_BASE_URL = "http://localhost:5555/api";

const ExamManagementPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true,
  });

  // Form states
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [showEditExamForm, setShowEditExamForm] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // New exam data
  const [newExamData, setNewExamData] = useState({
    title: "",
    course: "",
    description: "",
    examDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    examUrl: "",
  });

  useEffect(() => {
    checkServerConnection();
    fetchExams();
    fetchCourses();
  }, []);

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

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExams(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to load exams. Please try again.");

      // Fallback to sample data
      const sampleExams = [
        {
          id: 1,
          title: "Mid-term Grammar Test",
          course: "Advanced Grammar",
          description: "Mid-term test covering chapters 1-5",
          examDate: "2023-12-15",
          startTime: "10:00",
          endTime: "11:30",
          duration: "90",
          totalMarks: "100",
          passingMarks: "60",
          status: "Published",
          examUrl: "https://exam.example.com/grammar",
        },
        {
          id: 2,
          title: "IELTS Writing Practice",
          course: "IELTS Preparation",
          description: "Practice test for IELTS writing section",
          examDate: "2023-12-18",
          startTime: "14:00",
          endTime: "15:30",
          duration: "90",
          totalMarks: "100",
          passingMarks: "60",
          status: "Draft",
          examUrl: "https://exam.example.com/ielts-writing",
        },
      ];
      setExams(sampleExams);
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

      // Fallback to sample data
      const sampleCourses = [
        { id: 1, name: "Advanced Grammar" },
        { id: 2, name: "IELTS Preparation" },
        { id: 3, name: "Business English" },
      ];
      setCourses(sampleCourses);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExamData({
      ...newExamData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !newExamData.title.trim() ||
      !newExamData.course.trim() ||
      !newExamData.examDate ||
      !newExamData.startTime ||
      !newExamData.endTime ||
      !newExamData.duration ||
      !newExamData.totalMarks ||
      !newExamData.passingMarks
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/exams`, newExamData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const savedExam = response.data.exam;
      setExams([...exams, savedExam]);

      // Reset form
      setNewExamData({
        title: "",
        course: "",
        description: "",
        examDate: "",
        startTime: "",
        endTime: "",
        duration: "",
        totalMarks: "",
        passingMarks: "",
        examUrl: "",
      });

      setShowAddExamForm(false);
      alert("New exam added successfully");
    } catch (err) {
      console.error("Error adding exam:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to add new exam. Please try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (exam) => {
    setCurrentExam(exam);
    setNewExamData({
      title: exam.title,
      course: exam.course,
      description: exam.description,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      examUrl: exam.examUrl || "",
    });
    setShowEditExamForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (
      !newExamData.title.trim() ||
      !newExamData.course.trim() ||
      !newExamData.examDate ||
      !newExamData.startTime ||
      !newExamData.endTime ||
      !newExamData.duration ||
      !newExamData.totalMarks ||
      !newExamData.passingMarks
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/exams/${currentExam._id || currentExam.id}`,
        newExamData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedExam = response.data.exam;

      // Update the exam in the state
      const updatedExams = exams.map((exam) => {
        if (
          (exam.id && exam.id === currentExam.id) ||
          (exam._id && exam._id === currentExam._id)
        ) {
          return updatedExam;
        }
        return exam;
      });

      setExams(updatedExams);
      setShowEditExamForm(false);
      alert("Exam updated successfully");
    } catch (err) {
      console.error("Error updating exam:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to update exam. Please try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (exam) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the exam "${exam.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/exams/${exam._id || exam.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the exam from the state
      const updatedExams = exams.filter(
        (e) => !((e.id && e.id === exam.id) || (e._id && e._id === exam._id))
      );

      setExams(updatedExams);
      alert("Exam deleted successfully");
    } catch (err) {
      console.error("Error deleting exam:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete exam. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (exam) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/exams/${exam._id || exam.id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedExam = response.data.exam;

      // Update the exam in the state
      const updatedExams = exams.map((e) => {
        if ((e.id && e.id === exam.id) || (e._id && e._id === exam._id)) {
          return updatedExam;
        }
        return e;
      });

      setExams(updatedExams);
      alert(
        `Exam ${
          updatedExam.status === "Published" ? "published" : "unpublished"
        } successfully`
      );
    } catch (err) {
      console.error("Error toggling exam status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update exam status. Please try again."
      );
    }
  };

  const handleGeneratePDF = () => {
    setPdfLoading(true);

    try {
      const examData = exams.map((exam) => ({
        title: exam.title,
        course: exam.course,
        date: exam.examDate,
        time: `${exam.startTime} - ${exam.endTime}`,
        duration: `${exam.duration} min`,
        marks: `${exam.totalMarks}/${exam.passingMarks}`,
        status: exam.status || "Draft",
      }));

      const date = new Date().toISOString().split("T")[0];
      const filename = `exams_report_${date}`;

      exportToPDF(
        examData,
        filename,
        ["title", "course", "date", "time", "duration", "marks", "status"],
        "Exam Management Report"
      );
    } catch (err) {
      console.error("Error generating PDF report:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const viewExamDetails = (exam) => {
    // Redirect to an exam details page
    navigate(`/exam-details/${exam._id || exam.id}`);
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <Header title="Exam Management" />

      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => setShowAddExamForm(true)}
        >
          <FaPlus className="icon-left" /> Add New Exam
        </button>
        <button
          className="btn-primary pdf-btn"
          onClick={handleGeneratePDF}
          disabled={pdfLoading || filteredExams.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Exam Overview</h3>
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
        </div>

        {loading ? (
          <div className="loading-spinner">Loading exams...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredExams.length === 0 ? (
          <div className="no-results">
            No exams found. Create your first exam!
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Total/Passing Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam._id || exam.id}>
                    <td>{exam.title}</td>
                    <td>{exam.course}</td>
                    <td>{exam.examDate}</td>
                    <td>{`${exam.startTime} - ${exam.endTime}`}</td>
                    <td>{`${exam.duration} min`}</td>
                    <td>{`${exam.totalMarks}/${exam.passingMarks}`}</td>
                    <td>
                      <span
                        className={`status-badge ${(
                          exam.status || "draft"
                        ).toLowerCase()}`}
                      >
                        {exam.status || "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-small"
                          onClick={() => viewExamDetails(exam)}
                          title="View Exam Details"
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="btn-small"
                          onClick={() => handleEdit(exam)}
                          title="Edit Exam"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="btn-small"
                          onClick={() => handleToggleStatus(exam)}
                          title={
                            exam.status === "Published"
                              ? "Unpublish Exam"
                              : "Publish Exam"
                          }
                        >
                          <FaCheck />{" "}
                          {exam.status === "Published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                        <button
                          className="btn-small delete"
                          onClick={() => handleDelete(exam)}
                          title="Delete Exam"
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
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {showAddExamForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Exam</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddExamForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="title">Exam Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newExamData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="course">Course</label>
                <select
                  id="course"
                  name="course"
                  value={newExamData.course}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id || course.id} value={course.name}>
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
                  value={newExamData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam description"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="examDate">Exam Date</label>
                  <input
                    type="date"
                    id="examDate"
                    name="examDate"
                    value={newExamData.examDate}
                    onChange={handleInputChange}
                    required
                    min={getTodayDate()}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={newExamData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={newExamData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={newExamData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="totalMarks">Total Marks</label>
                  <input
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    value={newExamData.totalMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="passingMarks">Passing Marks</label>
                  <input
                    type="number"
                    id="passingMarks"
                    name="passingMarks"
                    value={newExamData.passingMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="examUrl">Exam URL (Optional)</label>
                <input
                  type="url"
                  id="examUrl"
                  name="examUrl"
                  value={newExamData.examUrl}
                  onChange={handleInputChange}
                  placeholder="Enter URL for online exam access (if applicable)"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddExamForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Adding..." : "Add Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {showEditExamForm && currentExam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Exam</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditExamForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleEditSubmit} className="form">
              <div className="form-group">
                <label htmlFor="edit-title">Exam Title</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={newExamData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-course">Course</label>
                <select
                  id="edit-course"
                  name="course"
                  value={newExamData.course}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id || course.id} value={course.name}>
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
                  value={newExamData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam description"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-examDate">Exam Date</label>
                  <input
                    type="date"
                    id="edit-examDate"
                    name="examDate"
                    value={newExamData.examDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-startTime">Start Time</label>
                  <input
                    type="time"
                    id="edit-startTime"
                    name="startTime"
                    value={newExamData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-endTime">End Time</label>
                  <input
                    type="time"
                    id="edit-endTime"
                    name="endTime"
                    value={newExamData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="edit-duration"
                    name="duration"
                    value={newExamData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-totalMarks">Total Marks</label>
                  <input
                    type="number"
                    id="edit-totalMarks"
                    name="totalMarks"
                    value={newExamData.totalMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-passingMarks">Passing Marks</label>
                  <input
                    type="number"
                    id="edit-passingMarks"
                    name="passingMarks"
                    value={newExamData.passingMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-examUrl">Exam URL (Optional)</label>
                <input
                  type="url"
                  id="edit-examUrl"
                  name="examUrl"
                  value={newExamData.examUrl}
                  onChange={handleInputChange}
                  placeholder="Enter URL for online exam access (if applicable)"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditExamForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Updating..." : "Update Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamManagementPage;
