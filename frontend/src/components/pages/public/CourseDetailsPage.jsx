import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaChalkboardTeacher, FaMoneyBill, FaArrowLeft, FaServer } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5555/api';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const isConnected = await checkServerConnection();
        
        if (!isConnected) {
          setError('Cannot connect to server. Please check your internet connection and try again.');
          return;
        }
        
        // Use the public endpoint for course details
        const response = await axios.get(`${API_BASE_URL}/courses/public/${id}`);
        
        if (response.data) {
          setCourse(response.data);
          setError(null);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [id]);

  // Function to check server connection
  const checkServerConnection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
      setServerStatus({
        connected: true,
        checking: false
      });
      return true;
    } catch (err) {
      setServerStatus({
        connected: false,
        checking: false
      });
      console.log('Server connection failed');
      return false;
    }
  };

  return (
    <div className="course-details-page">
      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Showing Sample Data
        </div>
      )}
      
      <div className="back-link">
        <Link to="/courses-catalog" className="btn-back">
          <FaArrowLeft /> Back to Courses
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading course details...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <Link to="/courses-catalog" className="btn-primary">Browse Other Courses</Link>
        </div>
      ) : course ? (
        <div className="course-details-container">
          <div className="course-header">
            <h1>{course.name}</h1>
            <div className="course-meta-info">
              <div className="meta-item">
                <FaChalkboardTeacher />
                <span>Instructor: {course.lecturer}</span>
              </div>
              <div className="meta-item">
                <FaClock />
                <span>Duration: {course.duration}</span>
              </div>
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Start Date: {course.startDate}</span>
              </div>
              <div className="meta-item">
                <FaMoneyBill />
                <span>Price: {course.price}</span>
              </div>
            </div>
          </div>
          
          <div className="course-main-info">
            <div className="course-description">
              <h2>Course Description</h2>
              <p>{course.description}</p>
            </div>
            
            <div className="enroll-section">
              <div className="price-tag">
                <span>{course.price}</span>
              </div>
              <Link to="/register" className="btn-enroll">Register to Enroll</Link>
            </div>
          </div>
          
          <div className="course-content">
            <h2>What You'll Learn</h2>
            {course.outcomes && course.outcomes.length > 0 ? (
              <ul className="outcomes-list">
                {course.outcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            ) : (
              <p>Course outcomes will be available soon.</p>
            )}
          </div>
          
          <div className="course-syllabus">
            <h2>Course Syllabus</h2>
            {course.syllabus && course.syllabus.length > 0 ? (
              <ul className="syllabus-list">
                {course.syllabus.map((item, index) => (
                  <li key={index}>
                    <h3>Module {index + 1}</h3>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Detailed syllabus will be available after registration.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="not-found">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses-catalog" className="btn-primary">Browse Courses</Link>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
