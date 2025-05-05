import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import { FaSearch, FaFilter, FaCalendarAlt, FaServer, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5555/api';

const AllExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all', // 'all', 'upcoming', 'past', 'this-month'
  });
  
  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });

  useEffect(() => {
    // Check server connection and fetch data
    checkServerConnection();
    fetchExams();
    
    // Set up interval to check server status periodically
    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000); // Check every minute if disconnected
    
    return () => clearInterval(serverCheckInterval);
  }, []);
  
  // Apply filters whenever exams or filters change
  useEffect(() => {
    applyFilters();
  }, [exams, filters, searchTerm]);

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
  
  // Function to fetch exams
  const fetchExams = async () => {
    setLoading(true);
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        // Fallback to sample data when offline
        const sampleExams = [
          { id: 1, title: 'Mid-term Grammar Test', course: 'Advanced Grammar', examDate: '2023-12-15', startTime: '10:00 AM', endTime: '11:30 AM', duration: '90', location: 'Hall A', totalMarks: 100, passingMarks: 60, status: 'Published', examUrl: 'https://exam.example.com/grammar' },
          { id: 2, title: 'Business English Assessment', course: 'Business English', examDate: '2023-12-18', startTime: '2:00 PM', endTime: '3:30 PM', duration: '90', location: 'Hall B', totalMarks: 80, passingMarks: 50, status: 'Published', examUrl: 'https://exam.example.com/business' },
          { id: 3, title: 'IELTS Mock Test', course: 'IELTS Preparation', examDate: '2023-12-20', startTime: '9:00 AM', endTime: '12:00 PM', duration: '180', location: 'Hall C', totalMarks: 120, passingMarks: 70, status: 'Published', examUrl: 'https://exam.example.com/ielts' },
          { id: 4, title: 'Vocabulary Quiz', course: 'General English', examDate: '2023-12-22', startTime: '11:00 AM', endTime: '12:00 PM', duration: '60', location: 'Room 201', totalMarks: 50, passingMarks: 30, status: 'Published' },
          { id: 5, title: 'Final Grammar Test', course: 'Advanced Grammar', examDate: '2024-01-10', startTime: '9:00 AM', endTime: '11:00 AM', duration: '120', location: 'Hall A', totalMarks: 120, passingMarks: 72, status: 'Published' }
        ];
        setExams(sampleExams);
        setFilteredExams(sampleExams);
        setError(null);
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setExams(response.data);
      setFilteredExams(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...exams];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(term) ||
        exam.course.toLowerCase().includes(term) ||
        (exam.location && exam.location.toLowerCase().includes(term))
      );
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      if (filters.dateRange === 'upcoming') {
        filtered = filtered.filter(exam => {
          const examDate = new Date(exam.examDate).getTime();
          return examDate >= today;
        });
      } else if (filters.dateRange === 'past') {
        filtered = filtered.filter(exam => {
          const examDate = new Date(exam.examDate).getTime();
          return examDate < today;
        });
      } else if (filters.dateRange === 'this-month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        
        filtered = filtered.filter(exam => {
          const examDate = new Date(exam.examDate).getTime();
          return examDate >= startOfMonth && examDate <= endOfMonth;
        });
      }
    }
    
    setFilteredExams(filtered);
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

  // Group exams by date for better organization
  const groupedByDate = filteredExams.reduce((groups, exam) => {
    const date = exam.examDate || 'Unscheduled';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(exam);
    return groups;
  }, {});
  
  // Sort dates for display
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

  return (
    <>
      <Header title="Exam Timetable" />
      
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
            placeholder="Search exams..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label><FaCalendarAlt className="icon-left" /> Date Range:</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="this-month">This Month</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading exam data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchExams}>Retry</button>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="no-data-message">
          <p>No exams found matching your filters.</p>
        </div>
      ) : (
        <div className="exam-timetable-container">
          {sortedDates.map(date => (
            <div key={date} className="exam-day-section">
              <h3 className="date-header">{date}</h3>
              
              <div className="table-responsive">
                <table className="exam-table">
                  <thead>
                    <tr>
                      <th>Exam Title</th>
                      <th>Course</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Location</th>
                      <th>Marks (Total/Pass)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDate[date].map(exam => (
                      <tr key={exam.id || exam._id}>
                        <td>{exam.title}</td>
                        <td>{exam.course}</td>
                        <td>{`${exam.startTime} - ${exam.endTime}`}</td>
                        <td>{`${exam.duration} min`}</td>
                        <td>{exam.location || "Online"}</td>
                        <td>{`${exam.totalMarks}/${exam.passingMarks}`}</td>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AllExamsPage;
