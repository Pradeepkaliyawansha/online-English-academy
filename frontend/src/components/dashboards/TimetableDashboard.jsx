import { useState, useEffect } from "react";
import Header from "../shared/Header";
import {
  FaPlus,
  FaTimes,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaFilePdf,
  FaLink,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";
import { exportToPDF } from "../../utils/exportUtils";

const TimetableDashboard = () => {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAddTimetableForm, setShowAddTimetableForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [newTimetableData, setNewTimetableData] = useState({
    lectureName: "",
    startTime: "",
    endTime: "",
    classType: "physical",
    venue: "",
    onlineLink: "",
    courseId: "",
  });

  const [showEditTimetableForm, setShowEditTimetableForm] = useState(false);
  const [editFormSubmitting, setEditFormSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [editTimetableData, setEditTimetableData] = useState({
    lectureName: "",
    startTime: "",
    endTime: "",
    classType: "physical",
    venue: "",
    onlineLink: "",
    courseId: "",
  });

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [timetableSearchTerm, setTimetableSearchTerm] = useState("");

  const API_BASE_URL = "http://localhost:5555/api";

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
    }
  };

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/timetable`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTimetable(response.data);
    } catch (err) {
      console.error("Error fetching timetable:", err);
      // Fallback to sample data
      const sampleTimetable = [
        {
          id: 1,
          course: "Advanced Grammar",
          day: "Monday",
          startTime: "09:00",
          endTime: "11:00",
          lecturer: "Dr. Sarah Wilson",
          room: "Room 101",
        },
        {
          id: 2,
          course: "IELTS Preparation",
          day: "Wednesday",
          startTime: "13:00",
          endTime: "15:00",
          lecturer: "Prof. John Miller",
          room: "Room 102",
        },
        {
          id: 3,
          course: "Business English",
          day: "Friday",
          startTime: "10:00",
          endTime: "12:00",
          lecturer: "Ms. Emily Parker",
          room: "Room 103",
        },
      ];
      setTimetable(sampleTimetable);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimetableData({
      ...newTimetableData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/timetable`,
        newTimetableData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the timetable list
      await fetchTimetable();

      setNewTimetableData({
        lectureName: "",
        startTime: "",
        endTime: "",
        classType: "physical",
        venue: "",
        onlineLink: "",
        courseId: "",
      });

      setShowAddTimetableForm(false);
      alert("New timetable entry added successfully");
    } catch (err) {
      console.error("Error adding timetable entry:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to add new timetable entry. Please try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (timetableEntry) => {
    setCurrentTimetable(timetableEntry);
    setEditTimetableData({
      lectureName: timetableEntry.lectureName || "",
      startTime: timetableEntry.startTime || "",
      endTime: timetableEntry.endTime || "",
      classType: timetableEntry.classType || "physical",
      venue: timetableEntry.venue || "",
      onlineLink: timetableEntry.onlineLink || "",
      courseId: timetableEntry.courseId || "",
    });
    setShowEditTimetableForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTimetableData({
      ...editTimetableData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormSubmitting(true);
    setEditFormError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/timetable/${
          currentTimetable._id || currentTimetable.id
        }`,
        editTimetableData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTimetable = response.data.timetable || {
        ...currentTimetable,
        ...editTimetableData,
      };

      const updatedTimetableList = timetable.map((t) => {
        if (
          (t.id && t.id === currentTimetable.id) ||
          (t._id && t._id === currentTimetable._id)
        ) {
          return {
            ...t,
            lectureName: updatedTimetable.lectureName,
            startTime: updatedTimetable.startTime,
            endTime: updatedTimetable.endTime,
            classType: updatedTimetable.classType,
            venue: updatedTimetable.venue,
            onlineLink: updatedTimetable.onlineLink,
            courseId: updatedTimetable.courseId,
          };
        }
        return t;
      });

      setTimetable(updatedTimetableList);
      setShowEditTimetableForm(false);
      alert("Timetable entry updated successfully");
    } catch (err) {
      console.error("Error updating timetable entry:", err);
      setEditFormError(
        err.response?.data?.message ||
          "Failed to update timetable entry. Please try again."
      );
    } finally {
      setEditFormSubmitting(false);
    }
  };

  const handleDelete = async (timetableEntry) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this timetable entry? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/timetable/${timetableEntry._id || timetableEntry.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTimetable = timetable.filter(
        (t) =>
          !(
            (t.id && t.id === timetableEntry.id) ||
            (t._id && t._id === timetableEntry._id)
          )
      );

      setTimetable(updatedTimetable);
      alert("Timetable entry deleted successfully");
    } catch (err) {
      console.error("Error deleting timetable entry:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete timetable entry. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const timetableData = filteredTimetable.map((entry) => ({
        Lecture: entry.lectureName,
        Time: `${entry.startTime} - ${entry.endTime}`,
        Type: entry.classType,
        Venue: entry.venue,
        "Online Link": entry.onlineLink || "N/A",
      }));

      const date = new Date().toISOString().split("T")[0];
      const filename = `timetable_report_${date}`;

      const reportTitle = timetableSearchTerm
        ? `Timetable Report - Filter: "${timetableSearchTerm}"`
        : "Timetable Report";

      exportToPDF(
        timetableData,
        filename,
        ["Lecture", "Time", "Type", "Venue", "Online Link"],
        reportTitle
      );
    } catch (err) {
      console.error("Error generating PDF report:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const filteredTimetable = timetable.filter((entry) => {
    if (!entry) return false;
    const searchTerm = timetableSearchTerm?.toLowerCase() || "";
    return (
      (entry.lectureName?.toLowerCase() || "").includes(searchTerm) ||
      (entry.startTime?.toLowerCase() || "").includes(searchTerm) ||
      (entry.endTime?.toLowerCase() || "").includes(searchTerm) ||
      (entry.classType?.toLowerCase() || "").includes(searchTerm) ||
      (entry.venue?.toLowerCase() || "").includes(searchTerm) ||
      (entry.onlineLink?.toLowerCase() || "").includes(searchTerm)
    );
  });

  // Add function to get course name
  const getCourseName = (courseId) => {
    const course = courses.find(c => (c.id || c._id) === courseId);
    return course ? course.name : 'Unknown Course';
  };

  return (
    <>
      <Header title="Timetable Management" />

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => setShowAddTimetableForm(true)}
        >
          <FaPlus className="icon-left" /> Add New Timetable Entry
        </button>
        <button
          className="btn-primary pdf-btn"
          onClick={handleGeneratePDF}
          disabled={pdfLoading || filteredTimetable.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading
            ? "Generating..."
            : timetableSearchTerm
            ? "Export Filtered Results"
            : "Generate Report"}
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Timetable Overview</h3>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search timetable..."
              value={timetableSearchTerm}
              onChange={(e) => setTimetableSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Lecture Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Type</th>
              <th>Venue/Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTimetable.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  No lectures found matching your search
                </td>
              </tr>
            ) : (
              filteredTimetable.map((entry) => (
                <tr key={entry.id || entry._id}>
                  <td>{getCourseName(entry.courseId)}</td>
                  <td>{entry.lectureName}</td>
                  <td>{entry.startTime}</td>
                  <td>{entry.endTime}</td>
                  <td>
                    <span className={`class-type-badge ${entry.classType}`}>
                      {entry.classType === "online" ? "Online" : "Physical"}
                    </span>
                  </td>
                  <td>
                    {entry.classType === "online" ? (
                      <a
                        href={entry.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="online-link"
                      >
                        <FaLink /> Join Online
                      </a>
                    ) : (
                      <span className="venue">
                        <FaMapMarkerAlt /> {entry.venue}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-small"
                        onClick={() => handleEdit(entry)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn-small delete"
                        onClick={() => handleDelete(entry)}
                        disabled={deleteLoading}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Timetable Form Modal */}
      {showAddTimetableForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Timetable Entry</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddTimetableForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="courseId">Course</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={newTimetableData.courseId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id || course._id} value={course.id || course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lectureName">Lecture Name</label>
                <input
                  type="text"
                  id="lectureName"
                  name="lectureName"
                  value={newTimetableData.lectureName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter lecture name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={newTimetableData.startTime}
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
                    value={newTimetableData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="classType">Class Type</label>
                <select
                  id="classType"
                  name="classType"
                  value={newTimetableData.classType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="physical">Physical</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {newTimetableData.classType === "physical" ? (
                <div className="form-group">
                  <label htmlFor="venue">Venue</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={newTimetableData.venue}
                    onChange={handleInputChange}
                    required={newTimetableData.classType === "physical"}
                    placeholder="Enter venue (e.g., Room 301)"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="onlineLink">Online Link</label>
                  <input
                    type="url"
                    id="onlineLink"
                    name="onlineLink"
                    value={newTimetableData.onlineLink}
                    onChange={handleInputChange}
                    required={newTimetableData.classType === "online"}
                    placeholder="Enter meeting link (e.g., https://zoom.us/j/123456)"
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddTimetableForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Adding..." : "Add to Timetable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Timetable Form Modal */}
      {showEditTimetableForm && currentTimetable && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Timetable Entry</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditTimetableForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {editFormError && <div className="form-error">{editFormError}</div>}

            <form onSubmit={handleEditSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="edit-courseId">Course</label>
                <select
                  id="edit-courseId"
                  name="courseId"
                  value={editTimetableData.courseId}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id || course._id} value={course.id || course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-lectureName">Lecture Name</label>
                <input
                  type="text"
                  id="edit-lectureName"
                  name="lectureName"
                  value={editTimetableData.lectureName}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter lecture name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-startTime">Start Time</label>
                  <input
                    type="time"
                    id="edit-startTime"
                    name="startTime"
                    value={editTimetableData.startTime}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-endTime">End Time</label>
                  <input
                    type="time"
                    id="edit-endTime"
                    name="endTime"
                    value={editTimetableData.endTime}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-classType">Class Type</label>
                <select
                  id="edit-classType"
                  name="classType"
                  value={editTimetableData.classType}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="physical">Physical</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {editTimetableData.classType === "physical" ? (
                <div className="form-group">
                  <label htmlFor="edit-venue">Venue</label>
                  <input
                    type="text"
                    id="edit-venue"
                    name="venue"
                    value={editTimetableData.venue}
                    onChange={handleEditInputChange}
                    required={editTimetableData.classType === "physical"}
                    placeholder="Enter venue (e.g., Room 301)"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="edit-onlineLink">Online Link</label>
                  <input
                    type="url"
                    id="edit-onlineLink"
                    name="onlineLink"
                    value={editTimetableData.onlineLink}
                    onChange={handleEditInputChange}
                    required={editTimetableData.classType === "online"}
                    placeholder="Enter meeting link (e.g., https://zoom.us/j/123456)"
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditTimetableForm(false)}
                  disabled={editFormSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editFormSubmitting}
                >
                  {editFormSubmitting ? "Updating..." : "Update Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TimetableDashboard;
