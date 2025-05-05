import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaLink,
} from "react-icons/fa";
import axios from "axios";
import "../../styles/CourseDetails.css";

const API_BASE_URL = "http://localhost:5555/api";

const CourseEnrolled = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const [courseResponse, timetableResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/courses/${courseId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_BASE_URL}/timetable`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setCourse(courseResponse.data);
        // Filter timetable entries for this course
        const courseTimetable = timetableResponse.data.filter(
          (entry) => entry.courseId === courseId
        );
        setTimetableEntries(courseTimetable);
      } catch (err) {
        setError("Failed to load course details");
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleEnroll = () => {
    navigate(`/dashboard/course-payment/${courseId}`, {
      state: {
        courseData: course,
        returnTo: "/student-dashboard",
      },
    });
  };

  if (loading) {
    return (
      <div className="course-details-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-details-container">
        <div className="error-message">
          <p>{error || "Course not found"}</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/student-dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-details-container">
      <div className="course-details-header">
        <button
          className="btn-back"
          onClick={() => navigate("/student-dashboard")}
        >
          <FaArrowLeft className="icon-left" /> Back to Dashboard
        </button>
      </div>

      <div className="course-details-content">
        <div className="course-image-container">
          {course.image ? (
            <img
              src={`${API_BASE_URL}${course.image}`}
              alt={course.name}
              className="course-image"
            />
          ) : (
            <div className="course-image-placeholder">
              <span>No Image Available</span>
            </div>
          )}
        </div>

        <div className="course-info">
          <h1 className="course-title">{course.name}</h1>

          <div className="course-meta">
            <div className="meta-item">
              <FaUser className="meta-icon" />
              <span>Lecturer: {course.lecturer}</span>
            </div>
            <div className="meta-item">
              <FaClock className="meta-icon" />
              <span>Duration: {course.duration} hours</span>
            </div>
            <div className="meta-item">
              <FaCalendarAlt className="meta-icon" />
              <span>
                Start Date: {new Date(course.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="meta-item">
              <FaDollarSign className="meta-icon" />
              <span>Price: {course.price}</span>
            </div>
          </div>

          <div className="course-description">
            <h2>Course Description</h2>
            <p>{course.description}</p>
          </div>

          {/* Add Timetable Information Section */}
          <div className="course-timetable">
            <h2>Class Schedule</h2>
            {timetableEntries.length > 0 ? (
              <div className="timetable-entries">
                {timetableEntries.map((entry) => (
                  <div key={entry.id || entry._id} className="timetable-entry">
                    <div className="entry-header">
                      <h3>{entry.lectureName}</h3>
                      <span className="time">
                        {entry.startTime} - {entry.endTime}
                      </span>
                    </div>
                    <div className="entry-details">
                      {entry.classType === "online" ? (
                        <a
                          href={entry.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="online-link"
                        >
                          <FaLink className="icon" /> Join Online Class
                        </a>
                      ) : (
                        <div className="venue">
                          <FaMapMarkerAlt className="icon" />
                          <span>{entry.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-schedule">No schedule available for this course.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrolled;
