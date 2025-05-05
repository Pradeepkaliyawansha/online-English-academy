import { useState, useEffect } from "react";
import Header from "../shared/Header";
import {
  FaPlus,
  FaTimes,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";
import axios from "axios";
import { exportToPDF } from "../../utils/exportUtils";

const CoursesDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [newCourseData, setNewCourseData] = useState({
    name: "",
    lecturer: "",
    duration: "",
    startDate: "",
    price: "",
    description: "",
    photo: null,
  });

  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [editFormSubmitting, setEditFormSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState({
    name: "",
    lecturer: "",
    duration: "",
    startDate: "",
    price: "",
    description: "",
    photo: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  const API_BASE_URL = "http://localhost:5555/api";

  useEffect(() => {
    fetchCourses();
  }, []);

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
        {
          id: 1,
          name: "Advanced Grammar",
          lecturer: "Dr. Sarah Wilson",
          duration: "40",
          startDate: "2023-12-15",
          price: "$300",
          description: "Advanced grammar techniques",
        },
        {
          id: 2,
          name: "IELTS Preparation",
          lecturer: "Prof. John Miller",
          duration: "30",
          startDate: "2023-12-10",
          price: "$250",
          description: "Comprehensive IELTS prep",
        },
        {
          id: 3,
          name: "Business English",
          lecturer: "Ms. Emily Parker",
          duration: "25",
          startDate: "2024-01-05",
          price: "$280",
          description: "Business communication",
        },
      ];
      setCourses(sampleCourses);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourseData({
      ...newCourseData,
      [name]: value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCourseData({
        ...newCourseData,
        photo: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all course data to formData
      Object.keys(newCourseData).forEach((key) => {
        if (key === "photo" && newCourseData[key]) {
          formData.append("image", newCourseData[key]);
        } else {
          formData.append(key, newCourseData[key]);
        }
      });

      const response = await axios.post(`${API_BASE_URL}/courses`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const savedCourse = response.data.course;
      setCourses([...courses, savedCourse]);

      setNewCourseData({
        name: "",
        lecturer: "",
        duration: "",
        startDate: "",
        price: "",
        description: "",
        photo: null,
      });
      setPreviewImage(null);

      setShowAddCourseForm(false);
      alert("New course added successfully");
    } catch (err) {
      console.error("Error adding course:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to add new course. Please try again."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    setEditCourseData({
      name: course.name,
      lecturer: course.lecturer,
      duration: course.duration,
      startDate: course.startDate,
      price: course.price.startsWith("$")
        ? course.price.substring(1)
        : course.price,
      description: course.description,
      photo: null,
    });
    setEditPreviewImage(course.photoUrl || null);
    setShowEditCourseForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCourseData({
      ...editCourseData,
      [name]: value,
    });
  };

  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCourseData({
        ...editCourseData,
        photo: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormSubmitting(true);
    setEditFormError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all course data to formData
      Object.keys(editCourseData).forEach((key) => {
        if (key === "photo" && editCourseData[key]) {
          formData.append("image", editCourseData[key]);
        } else {
          formData.append(key, editCourseData[key]);
        }
      });

      const response = await axios.put(
        `${API_BASE_URL}/courses/${currentCourse._id || currentCourse.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedCourse = response.data.course;
      const updatedCourses = courses.map((c) => {
        if (
          (c.id && c.id === currentCourse.id) ||
          (c._id && c._id === currentCourse._id)
        ) {
          return updatedCourse;
        }
        return c;
      });

      setCourses(updatedCourses);
      setShowEditCourseForm(false);
      alert("Course updated successfully");
    } catch (err) {
      console.error("Error updating course:", err);
      setEditFormError(
        err.response?.data?.message ||
          "Failed to update course. Please try again."
      );
    } finally {
      setEditFormSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${course.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/courses/${course._id || course.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedCourses = courses.filter(
        (c) =>
          !((c.id && c.id === course.id) || (c._id && c._id === course._id))
      );

      setCourses(updatedCourses);
      alert("Course deleted successfully");
    } catch (err) {
      console.error("Error deleting course:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete course. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const courseData = filteredCourses.map((course) => ({
        name: course.name,
        lecturer: course.lecturer,
        duration: `${course.duration} hours`,
        startDate: course.startDate,
        price: course.price,
        description: course.description,
      }));

      const date = new Date().toISOString().split("T")[0];
      const filename = `courses_report_${date}`;

      const reportTitle = courseSearchTerm
        ? `Course Catalog Report - Filter: "${courseSearchTerm}"`
        : "Course Catalog Report";

      exportToPDF(
        courseData,
        filename,
        ["name", "lecturer", "duration", "startDate", "price", "description"],
        reportTitle
      );
    } catch (err) {
      console.error("Error generating PDF report:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const searchTerm = courseSearchTerm.toLowerCase();
    return (
      course.name.toLowerCase().includes(searchTerm) ||
      course.lecturer.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      String(course.duration).includes(searchTerm) ||
      course.startDate.toLowerCase().includes(searchTerm) ||
      course.price.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <>
      <Header title="Courses Management" />

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => setShowAddCourseForm(true)}
        >
          <FaPlus className="icon-left" /> Add New Course
        </button>
        <button
          className="btn-primary pdf-btn"
          onClick={handleGeneratePDF}
          disabled={pdfLoading || filteredCourses.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading
            ? "Generating..."
            : courseSearchTerm
            ? "Export Filtered Results"
            : "Generate Report"}
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Course Overview</h3>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search courses..."
              value={courseSearchTerm}
              onChange={(e) => setCourseSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Course Name</th>
              <th>Lecturer</th>
              <th>Duration(hours)</th>
              <th>Start Date</th>
              <th>Price</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-results">
                  No courses found matching your search
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id || course._id}>
                  <td>
                    {course.image ? (
                      <img
                        src={`${API_BASE_URL}${course.image}`}
                        alt={course.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#f0f0f0",
                        }}
                      />
                    )}
                  </td>
                  <td>{course.name}</td>
                  <td>{course.lecturer}</td>
                  <td>{course.duration}</td>
                  <td>{course.startDate}</td>
                  <td>{course.price}</td>
                  <td
                    onMouseEnter={() =>
                      setHoveredCourseId(course.id || course._id)
                    }
                    onMouseLeave={() => setHoveredCourseId(null)}
                    style={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      position: "relative",
                      cursor: "pointer",
                      padding: "8px",
                    }}
                  >
                    {course.description}
                    {hoveredCourseId === (course.id || course._id) && (
                      <div
                        style={{
                          position: "fixed",
                          top: "auto",
                          bottom: "auto",
                          left: "auto",
                          right: "auto",
                          transform: "translate(-50%, -100%)",
                          background: "rgba(0, 0, 0, 0.9)",
                          color: "#fff",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          zIndex: 9999,
                          whiteSpace: "normal",
                          maxWidth: "300px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          fontSize: "14px",
                          lineHeight: "1.5",
                          textAlign: "left",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(4px)",
                          animation: "fadeIn 0.2s ease-in-out",
                          pointerEvents: "none",
                        }}
                      >
                        {course.description}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-8px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "0",
                            height: "0",
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderTop: "8px solid rgba(0, 0, 0, 0.9)",
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-small"
                        onClick={() => handleEdit(course)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn-small delete"
                        onClick={() => handleDelete(course)}
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

      {/* Add New Course Form Modal */}
      {showAddCourseForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Course</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddCourseForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="name">Course Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newCourseData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lecturer">Lecturer</label>
                <input
                  type="text"
                  id="lecturer"
                  name="lecturer"
                  value={newCourseData.lecturer}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter lecturer name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration (hours)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={newCourseData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter duration in hours"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={newCourseData.startDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={newCourseData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course price"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newCourseData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course description"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="photo">Course Photo</label>
                <div className="photo-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="photo-upload-input"
                  />
                  {previewImage && (
                    <div className="photo-preview">
                      <img src={previewImage} alt="Course preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddCourseForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Form Modal */}
      {showEditCourseForm && currentCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Course</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditCourseForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            {editFormError && <div className="form-error">{editFormError}</div>}

            <form onSubmit={handleEditSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="edit-name">Course Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editCourseData.name}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter course name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-lecturer">Lecturer</label>
                <input
                  type="text"
                  id="edit-lecturer"
                  name="lecturer"
                  value={editCourseData.lecturer}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-duration">Duration (hours)</label>
                  <input
                    type="number"
                    id="edit-duration"
                    name="duration"
                    value={editCourseData.duration}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter duration in hours"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-startDate">Start Date</label>
                  <input
                    type="date"
                    id="edit-startDate"
                    name="startDate"
                    value={editCourseData.startDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-price">Price</label>
                <input
                  type="text"
                  id="edit-price"
                  name="price"
                  value={editCourseData.price}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter course price"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editCourseData.description}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter course description"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="edit-photo">Course Photo</label>
                <div className="photo-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoChange}
                    className="photo-upload-input"
                  />
                  {editPreviewImage && (
                    <div className="photo-preview">
                      <img src={editPreviewImage} alt="Course preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditCourseForm(false)}
                  disabled={editFormSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editFormSubmitting}
                >
                  {editFormSubmitting ? "Updating..." : "Update Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursesDashboard;
