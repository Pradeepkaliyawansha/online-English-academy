import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaServer } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5555/api';

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: 'all', // 'all', 'beginner', 'intermediate', 'advanced'
    type: 'all', // 'all', 'general', 'business', 'exam', 'specialized'
  });
  
  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });

  useEffect(() => {
    // Check server connection and fetch data
    checkServerConnection();
    fetchCourses();
  }, []);
  
  // Apply filters whenever courses or filters change
  useEffect(() => {
    applyFilters();
  }, [courses, filters, searchTerm]);

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
  
  // Function to fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
        setFilteredCourses([]);
        return;
      }
      
      // Make API call without the visibility parameter
      const response = await axios.get(`${API_BASE_URL}/courses/public`);
      setCourses(response.data);
      setFilteredCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...courses];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(term) ||
        course.lecturer.toLowerCase().includes(term) ||
        (course.description && course.description.toLowerCase().includes(term))
      );
    }
    
    // Apply level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(course => course.level === filters.level);
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(course => course.type === filters.type);
    }
    
    setFilteredCourses(filtered);
  };
  
  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="course-catalog-page">
      <div className="page-header">
        <h1>Course Catalog</h1>
        <img src='images/imag1.jpg'></img>
        <p>Browse our comprehensive selection of English courses</p>
      </div>
      
      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Please try again later
        </div>
      )}
      
      <div className="filter-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label><FaFilter className="icon-left" /> Level:</label>
            <select 
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label><FaFilter className="icon-left" /> Type:</label>
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="general">General English</option>
              <option value="business">Business English</option>
              <option value="exam">Exam Preparation</option>
              <option value="specialized">Specialized</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchCourses}>Retry</button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="no-data-message">
          <p>No courses found. Please check back later or try adjusting your filters.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div className="course-card" key={course.id || course._id}>
              <div className="course-info">
                <h3>{course.name}</h3>
                <p className="course-instructor">Instructor: {course.lecturer}</p>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="course-duration">{course.duration}</span>
                  <span className="course-level">Level: {course.level || "Mixed"}</span>
                  <span className="course-price">{course.price}</span>
                </div>
              </div>
              <Link to={`/course/${course.id || course._id}`} className="btn-course">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalogPage;
