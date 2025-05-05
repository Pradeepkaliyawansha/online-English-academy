import { useState, useEffect, useContext, useRef } from "react";
import Header from "../shared/Header";
import PublicHeader from "../shared/PublicHeader";
import {
  FaBook,
  FaClipboardList,
  FaCalendarAlt,
  FaTrophy,
  FaExternalLinkAlt,
  FaServer,
  FaGraduationCap,
  FaInfoCircle,
  FaShoppingCart,
  FaArrowLeft,
  FaHome,
  FaUser,
  FaPhone,
  FaIdCard,
  FaBirthdayCake,
  FaVenusMars,
  FaTimes,
  FaSave,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaEnvelope,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "../../styles/Profile.css";
import StudentProfile from "../profile/StudentProfile";

const API_BASE_URL = "http://localhost:5555/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
    completedCourses: 0,
  });

  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const [studentInfo, setStudentInfo] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    nic: "",
    birthday: "",
    gender: "",
  });

  const [loading, setLoading] = useState({
    schedule: true,
    exams: true,
    stats: true,
    courses: true,
    enrolledCourses: true,
    studentInfo: true,
  });

  const [error, setError] = useState({
    schedule: null,
    exams: null,
    stats: null,
    courses: null,
    enrolledCourses: null,
    studentInfo: null,
  });

  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true,
  });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    phoneNumber: "",
    nic: "",
    birthday: "",
    gender: "Male",
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileFormError, setProfileFormError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileSectionRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example number of notifications
  const [messages, setMessages] = useState(5); // Example number of messages

  // Add delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    checkServerConnection();
    fetchStats();
    fetchCourseSchedule();
    fetchCourses();
    fetchEnrolledCourses();
    fetchStudentInfo();

    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000);

    return () => clearInterval(serverCheckInterval);
  }, []);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      fetchExams();
    }
  }, [enrolledCourses]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfileDropdown &&
        !event.target.closest(".profile-dropdown-container")
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

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

  const fetchStats = async () => {
    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({ ...prev, stats: "Failed to connect to server" }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/students/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data);
    } catch (err) {
      console.error("Error fetching student stats:", err);
      setError((prev) => ({ ...prev, stats: "Failed to load stats" }));
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  const fetchCourseSchedule = async () => {
    setLoading((prev) => ({ ...prev, schedule: true }));
    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({
          ...prev,
          schedule: "Failed to connect to server",
        }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/student/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSchedule(response.data);
      setError((prev) => ({ ...prev, schedule: null }));
    } catch (err) {
      console.error("Error fetching course schedule:", err);
      setError((prev) => ({ ...prev, schedule: "Failed to load schedule" }));
    } finally {
      setLoading((prev) => ({ ...prev, schedule: false }));
    }
  };

  const fetchExams = async () => {
    setLoading((prev) => ({ ...prev, exams: true }));
    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({ ...prev, exams: "Failed to connect to server" }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allExams = response.data;
      const enrolledCourseNames = enrolledCourses.map((course) =>
        course.courseName.toLowerCase().trim()
      );

      const filteredExams = allExams.filter((exam) =>
        enrolledCourseNames.includes(exam.course.toLowerCase().trim())
      );

      setExams(filteredExams);
      setError((prev) => ({ ...prev, exams: null }));
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError((prev) => ({ ...prev, exams: "Failed to load exams" }));
    } finally {
      setLoading((prev) => ({ ...prev, exams: false }));
    }
  };

  const fetchCourses = async () => {
    setLoading((prev) => ({ ...prev, courses: true }));
    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({
          ...prev,
          courses: "Failed to connect to server",
        }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(response.data);
      setError((prev) => ({ ...prev, courses: null }));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError((prev) => ({ ...prev, courses: "Failed to load courses" }));
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const fetchEnrolledCourses = () => {
    setLoading((prev) => ({ ...prev, enrolledCourses: true }));
    try {
      const storedEnrollments = JSON.parse(
        localStorage.getItem("courseEnrollments") || "[]"
      );

      if (storedEnrollments.length > 0) {
        setEnrolledCourses(storedEnrollments);
        setStats((prev) => ({
          ...prev,
          enrolledCourses: storedEnrollments.length,
        }));
      }
      setError((prev) => ({ ...prev, enrolledCourses: null }));
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError((prev) => ({
        ...prev,
        enrolledCourses: "Failed to load enrolled courses",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, enrolledCourses: false }));
    }
  };

  const fetchStudentInfo = async () => {
    setLoading((prev) => ({ ...prev, studentInfo: true }));
    try {
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setError((prev) => ({
          ...prev,
          studentInfo: "Failed to connect to server",
        }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/students/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudentInfo(response.data);
      setError((prev) => ({ ...prev, studentInfo: null }));
    } catch (err) {
      console.error("Error fetching student information:", err);
      setError((prev) => ({
        ...prev,
        studentInfo: "Failed to load student information",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, studentInfo: false }));
    }
  };

  // Update the handleEditProfileClick to properly populate the form
  const handleEditProfileClick = () => {
    setEditProfileData({
      phoneNumber: studentInfo.phoneNumber || "",
      nic: studentInfo.nic || "",
      birthday: studentInfo.birthday || "",
      gender: studentInfo.gender || "Male",
    });
    setShowEditProfileModal(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for different input fields
    if (name === "phoneNumber") {
      // Only allow numbers for phone number
      if (!/^[0-9]*$/.test(value)) {
        return; // Prevent non-numeric inputs
      }

      // Limit to 10 digits
      if (value.length > 10) {
        return; // Prevent more than 10 digits
      }
    }

    if (name === "nic") {
      // Only allow numbers for NIC
      if (!/^[0-9]*$/.test(value)) {
        return; // Prevent non-numeric inputs
      }

      // Limit to 12 digits
      if (value.length > 12) {
        return; // Prevent more than 12 digits
      }
    }

    // Validate birthday to prevent future dates
    if (name === "birthday") {
      const selectedDate = new Date(value);
      const currentDate = new Date();

      // Reset time portion to compare just the dates
      selectedDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      if (selectedDate > currentDate) {
        return; // Prevent future date selection
      }
    }

    setEditProfileData({
      ...editProfileData,
      [name]: value,
    });
  };

  // Function to get today's date in YYYY-MM-DD format for the max attribute
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to format full name - as fallback if currentUser is not available
  const getFullName = () => {
    if (currentUser?.name) return currentUser.name;

    const { firstName, lastName } = studentInfo;
    if (!firstName && !lastName) return "Not provided";
    if (!firstName) return lastName;
    if (!lastName) return firstName;
    return `${firstName} ${lastName}`;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileSubmitting(true);
    setProfileFormError(null);

    // Basic field validation
    if (
      !editProfileData.phoneNumber ||
      !editProfileData.nic ||
      !editProfileData.birthday ||
      !editProfileData.gender
    ) {
      setProfileFormError("All fields are required");
      setProfileSubmitting(false);
      return;
    }

    // Phone number validation
    if (!/^[0-9]{10}$/.test(editProfileData.phoneNumber)) {
      setProfileFormError("Phone Number must be exactly 10 digits");
      setProfileSubmitting(false);
      return;
    }

    // NIC validation
    if (!/^[0-9]{1,12}$/.test(editProfileData.nic)) {
      setProfileFormError("NIC must contain up to 12 digits only");
      setProfileSubmitting(false);
      return;
    }

    // Birthday future date validation
    const selectedDate = new Date(editProfileData.birthday);
    const currentDate = new Date();

    if (selectedDate > currentDate) {
      setProfileFormError("Birthday cannot be a future date");
      setProfileSubmitting(false);
      return;
    }

    const isConnected = await checkServerConnection();

    if (!isConnected) {
      setTimeout(() => {
        // Update only the fields in the form
        const updatedInfo = {
          ...studentInfo,
          phoneNumber: editProfileData.phoneNumber,
          nic: editProfileData.nic,
          birthday: editProfileData.birthday,
          gender: editProfileData.gender,
        };
        setStudentInfo(updatedInfo);
        setShowEditProfileModal(false);
        alert(
          "OFFLINE MODE: Profile updated locally. Will sync when server is available."
        );
        setProfileSubmitting(false);
      }, 1000);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Only send the fields we want to update
      const profileData = {
        phoneNumber: editProfileData.phoneNumber,
        nic: editProfileData.nic,
        birthday: editProfileData.birthday,
        gender: editProfileData.gender,
      };

      const response = await axios.put(
        `${API_BASE_URL}/students/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStudentInfo(response.data.student);
      setShowEditProfileModal(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Error updating student profile:", err);
      setProfileFormError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Scroll to profile section
  const handleShowProfileSection = () => {
    setShowProfileDropdown(false);
    setShowProfile(true);
  };

  // Add delete profile handler
  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/students/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Clear profile data
      setStudentInfo({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        nic: "",
        birthday: "",
        gender: "",
      });
      setShowDeleteConfirm(false);
      setShowEditProfileModal(false);
      alert("Profile data has been deleted successfully");
    } catch (err) {
      console.error("Error deleting profile:", err);
      alert("Failed to delete profile. Please try again.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="dashboard-header-right">
          <div className="header-icons">
            <div className="icon-wrapper">
              <FaBell className="header-icon" />
              {notifications > 0 && (
                <span className="badge">{notifications}</span>
              )}
            </div>
            <div className="icon-wrapper">
              <FaEnvelope className="header-icon" />
              {messages > 0 && <span className="badge">{messages}</span>}
            </div>
          </div>
          <div className="profile-dropdown-container">
            <div
              className="user-icon-wrapper"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <FaUser className="user-icon" />
              <span className="user-name-display">{getFullName()}</span>
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <FaUser className="dropdown-icon" />
                  <div className="user-info">
                    <span className="user-name">{getFullName()}</span>
                    <span className="user-role">Student</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-item"
                  onClick={handleShowProfileSection}
                >
                  <FaUser className="dropdown-icon" />
                  <span>My Profile</span>
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowEditProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                >
                  <FaCog className="dropdown-icon" />
                  <span>Edit Profile</span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="back-link">
        <Link to="/" className="btn-back">
          <FaHome className="icon-left" /> Home Page
        </Link>
      </div>

      {showProfile ? (
        <StudentProfile
          studentInfo={studentInfo}
          onEditClick={() => {
            setShowEditProfileModal(true);
            setShowProfile(false);
          }}
        />
      ) : (
        <>
          {!serverStatus.checking && !serverStatus.connected && (
            <div className="server-status disconnected">
              <FaServer /> Server Offline - Working in Local Mode
            </div>
          )}

          <div className="dashboard-card">
            <h3>My Courses</h3>
            {loading.enrolledCourses ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>Loading enrolled courses...</p>
              </div>
            ) : error.enrolledCourses ? (
              <div className="error-message">
                <p>{error.enrolledCourses}</p>
                <button className="btn-primary" onClick={fetchEnrolledCourses}>
                  Retry
                </button>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <p className="no-data-message">
                You haven't enrolled in any courses yet.
              </p>
            ) : (
              <div className="courses-grid">
                {enrolledCourses.map((course, index) => (
                  <div key={index} className="course-card">
                    <div className="course-card-header">
                      <FaBook className="course-icon" />
                      <a
                        href={`/dashboard/course/enrolled/${course.courseId}`}
                        rel="noopener noreferrer"
                        className="course-link"
                      >
                        <h4>{course.courseName}</h4>
                      </a>
                    </div>
                    <div className="course-card-content">
                      <div className="course-info">
                        <div className="info-item">
                          <FaCalendarAlt className="info-icon" />
                          <span>
                            Enrolled:{" "}
                            {new Date(course.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="info-item">
                          <FaShoppingCart className="info-icon" />
                          <span>Price: {course.price}</span>
                        </div>
                      </div>
                      {/*<div className="course-actions">
                        <button className="btn-course">View</button>
                      </div>*/}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Available Courses</h3>
            {loading.courses ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>Loading courses...</p>
              </div>
            ) : error.courses ? (
              <div className="error-message">
                <p>{error.courses}</p>
                <button className="btn-primary" onClick={fetchCourses}>
                  Retry
                </button>
              </div>
            ) : courses.length === 0 ? (
              <p className="no-data-message">No courses found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Course Name</th>
                    <th>Lecturer</th>
                    <th>Duration</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    .filter(
                      (course) =>
                        !enrolledCourses.some(
                          (ec) => ec.courseId === (course.id || course._id)
                        )
                    )
                    .map((course) => (
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
                                e.target.src =
                                  "https://via.placeholder.com/50x50?text=No+Image";
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
                        <td>
                          <a
                            href={`/dashboard/course/${
                              course.id || course._id
                            }`}
                            rel="noopener noreferrer"
                            className="course-link"
                          >
                            {course.name}
                          </a>
                        </td>
                        <td>{course.lecturer}</td>
                        <td>{course.duration}</td>
                        <td>{course.startDate}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-small"
                              onClick={() =>
                                navigate(
                                  `/dashboard/course-payment/${
                                    course.id || course._id
                                  }`,
                                  {
                                    state: {
                                      courseData: course,
                                      returnTo: "/student-dashboard",
                                    },
                                  }
                                )
                              }
                            >
                              <FaShoppingCart className="icon-left" /> Purchase
                              & Enroll
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="dashboard-card">
              <h3>My Exams</h3>
              {loading.exams ? (
                <div className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                  <p>Loading exams...</p>
                </div>
              ) : error.exams ? (
                <div className="error-message">
                  <p>{error.exams}</p>
                  <button className="btn-primary" onClick={fetchExams}>
                    Retry
                  </button>
                </div>
              ) : exams.length === 0 ? (
                <p className="no-data-message">
                  No exams found for your enrolled courses.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr key={exam.id || exam._id}>
                        <td>{exam.title}</td>
                        <td>
                          <span className="enrolled-course-marker">
                            {exam.course}
                          </span>
                        </td>
                        <td>{exam.examDate}</td>
                        <td>{exam.startTime}</td>
                        <td>{exam.endTime}</td>
                        <td>{exam.location || "Online"}</td>
                        <td>
                          <div className="action-buttons">
                            {exam.examUrl && (
                              <a
                                href={exam.examUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-small"
                              >
                                <FaExternalLinkAlt className="icon-left" /> View
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="dashboard-card">
              <h3>Course Exams</h3>
              <p className="no-data-message">
                Enroll in courses to access related exams.
              </p>
            </div>
          )}
        </>
      )}

      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button
                className="close-button"
                onClick={() => setShowEditProfileModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={`${studentInfo.firstName} ${studentInfo.lastName}`}
                  disabled
                  className="input-readonly"
                />
                <small className="field-note">
                  Name cannot be edited. Please contact support for name
                  changes.
                </small>
              </div>

              <div className="form-group">
                <label>
                  <FaPhone className="input-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editProfileData.phoneNumber}
                  onChange={handleProfileInputChange}
                  placeholder="Enter phone number"
                  className="input-editable"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaIdCard className="input-icon" />
                  NIC
                </label>
                <input
                  type="text"
                  name="nic"
                  value={editProfileData.nic}
                  onChange={handleProfileInputChange}
                  placeholder="Enter NIC"
                  className="input-editable"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaBirthdayCake className="input-icon" />
                  Birthday
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={editProfileData.birthday}
                  onChange={handleProfileInputChange}
                  max={getCurrentDate()}
                  className="input-editable"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaVenusMars className="input-icon" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={editProfileData.gender}
                  onChange={handleProfileInputChange}
                  className="input-editable"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {profileFormError && (
                <div className="error-message">{profileFormError}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Profile Data
                </button>
                <div className="right-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowEditProfileModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={profileSubmitting}
                  >
                    {profileSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="close-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="confirm-message">
              <p>
                Are you sure you want to delete your profile data? This action
                cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteProfile}>
                Yes, Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
