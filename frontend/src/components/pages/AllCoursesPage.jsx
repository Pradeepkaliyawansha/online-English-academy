import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import { FaSearch, FaFilter, FaServer, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5555/api';

const AllCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'active', 'upcoming', 'completed'
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
    
    // Set up interval to check server status periodically
    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000); // Check every minute if disconnected
    
    return () => clearInterval(serverCheckInterval);
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
        // Fallback to sample data when offline
        const sampleCourses = [
          { id: 1, name: 'Advanced Grammar', lecturer: 'Dr. Sarah Wilson', duration: '40 hours', startDate: '2023-12-15', price: '$300', status: 'Active', description: 'Advanced grammar techniques' },
          { id: 2, name: 'IELTS Preparation', lecturer: 'Prof. John Miller', duration: '30 hours', startDate: '2023-12-10', price: '$250', status: 'Upcoming', description: 'Comprehensive IELTS prep' },
          { id: 3, name: 'Business English', lecturer: 'Ms. Emily Parker', duration: '25 hours', startDate: '2024-01-05', price: '$280', status: 'Active', description: 'Business communication' },
          { id: 4, name: 'Conversational English', lecturer: 'Dr. Michael Brown', duration: '20 hours', startDate: '2023-11-20', price: '$200', status: 'Completed', description: 'Practical conversation skills' },
          { id: 5, name: 'Academic Writing', lecturer: 'Prof. Jessica Adams', duration: '35 hours', startDate: '2024-02-01', price: '$320', status: 'Upcoming', description: 'University-level writing skills' }
        ];
        setCourses(sampleCourses);
        setFilteredCourses(sampleCourses);
        setError(null);
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCourses(response.data);
      setFilteredCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
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
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(course => {
        const status = course.status || 'Active'; // Default to Active if not specified
        return status.toLowerCase() === filters.status.toLowerCase();
      });
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
    <>
      <Header title="My Courses" />
      
      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}

      
      <div className="page-actions">
        <Link to="/student-dashboard" className="btn-secondary">
          <FaArrowLeft className="icon-left" /> Back to Dashboard
        </Link>
      </div>
      
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
            <label><FaFilter className="icon-left" /> Status:</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
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
          <p>No courses found matching your filters.</p>
        </div>
      ) : (
        <div className="courses-container">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Lecturer</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id || course._id}>
                  <td>{course.name}</td>
                  <td>{course.lecturer}</td>
                  <td>{course.duration}</td>
                  <td>{course.startDate}</td>
                  <td>{course.price}</td>
                  <td>
                    <span className={`status-badge ${course.status ? course.status.toLowerCase() : 'active'}`}>
                      {course.status || 'Active'}
                    </span>
                  </td>
                  <td>{course.description}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/course-details/${course.id || course._id}`}
                        className="btn-small"
                      >
                        <FaInfoCircle className="icon-left" /> Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AllCoursesPage;
