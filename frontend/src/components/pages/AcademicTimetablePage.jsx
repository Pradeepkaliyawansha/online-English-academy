import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import { FaSearch, FaFilter, FaCalendarAlt, FaChalkboardTeacher, FaServer, FaArrowLeft, FaDownload } from 'react-icons/fa';
import axios from 'axios';

const AcademicTimetablePage = () => {
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    classType: 'all', // 'all', 'physical', 'online'
    dateRange: 'all', // 'all', 'today', 'this-week', 'this-month'
  });
  
  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });
  
  const API_BASE_URL = 'http://localhost:5555/api';

  useEffect(() => {
    // Check server connection and fetch data
    checkServerConnection();
    fetchTimetableEntries();
    
    // Set up interval to check server status periodically
    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000); // Check every minute if disconnected
    
    return () => clearInterval(serverCheckInterval);
  }, []);
  
  // Apply filters whenever timetable entries or filters change
  useEffect(() => {
    applyFilters();
  }, [timetableEntries, filters, searchTerm]);

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
  
  // Function to fetch timetable entries
  const fetchTimetableEntries = async () => {
    setLoading(true);
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        // Fallback to sample data when offline
        const sampleTimetable = [
          { id: 1, lectureName: 'Advanced Grammar', startTime: '10:00 AM', endTime: '11:30 AM', classType: 'physical', venue: 'Room 301', date: '2023-12-15' },
          { id: 2, lectureName: 'Speaking Practice', startTime: '2:00 PM', endTime: '3:30 PM', classType: 'online', onlineLink: 'https://zoom.us/j/123456789', date: '2023-12-15' },
          { id: 3, lectureName: 'Business English', startTime: '9:30 AM', endTime: '11:00 AM', classType: 'physical', venue: 'Room 105', date: '2023-12-16' },
          { id: 4, lectureName: 'IELTS Preparation', startTime: '3:30 PM', endTime: '5:00 PM', classType: 'online', onlineLink: 'https://zoom.us/j/987654321', date: '2023-12-16' },
          { id: 5, lectureName: 'Academic Writing', startTime: '11:00 AM', endTime: '12:30 PM', classType: 'physical', venue: 'Room 202', date: '2023-12-17' },
          { id: 6, lectureName: 'Vocabulary Enhancement', startTime: '1:00 PM', endTime: '2:30 PM', classType: 'physical', venue: 'Room 104', date: '2023-12-17' },
          { id: 7, lectureName: 'Pronunciation Workshop', startTime: '10:30 AM', endTime: '12:00 PM', classType: 'online', onlineLink: 'https://zoom.us/j/111222333', date: '2023-12-18' },
          { id: 8, lectureName: 'TOEFL Preparation', startTime: '4:00 PM', endTime: '5:30 PM', classType: 'online', onlineLink: 'https://zoom.us/j/444555666', date: '2023-12-18' }
        ];
        setTimetableEntries(sampleTimetable);
        setFilteredEntries(sampleTimetable);
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/timetable`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTimetableEntries(response.data);
      setFilteredEntries(response.data);
    } catch (err) {
      console.error('Error fetching academic timetable:', err);
      setError('Failed to load timetable data. Please try again later.');
      
      // Fallback to sample data if API fails
      const sampleTimetable = [
        { id: 1, lectureName: 'Advanced Grammar', startTime: '10:00 AM', endTime: '11:30 AM', classType: 'physical', venue: 'Room 301', date: '2023-12-15' },
        { id: 2, lectureName: 'Speaking Practice', startTime: '2:00 PM', endTime: '3:30 PM', classType: 'online', onlineLink: 'https://zoom.us/j/123456789', date: '2023-12-15' },
        { id: 3, lectureName: 'Business English', startTime: '9:30 AM', endTime: '11:00 AM', classType: 'physical', venue: 'Room 105', date: '2023-12-16' },
        { id: 4, lectureName: 'IELTS Preparation', startTime: '3:30 PM', endTime: '5:00 PM', classType: 'online', onlineLink: 'https://zoom.us/j/987654321', date: '2023-12-16' }
      ];
      setTimetableEntries(sampleTimetable);
      setFilteredEntries(sampleTimetable);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...timetableEntries];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.lectureName.toLowerCase().includes(term) ||
        (entry.venue && entry.venue.toLowerCase().includes(term)) ||
        (entry.onlineLink && entry.onlineLink.toLowerCase().includes(term))
      );
    }
    
    // Apply class type filter
    if (filters.classType !== 'all') {
      filtered = filtered.filter(entry => entry.classType === filters.classType);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      if (filters.dateRange === 'today') {
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date).getTime();
          return entryDate === today;
        });
      } else if (filters.dateRange === 'this-week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date).getTime();
          return entryDate >= startOfWeek.getTime() && entryDate <= endOfWeek.getTime();
        });
      } else if (filters.dateRange === 'this-month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date).getTime();
          return entryDate >= startOfMonth && entryDate <= endOfMonth;
        });
      }
    }
    
    setFilteredEntries(filtered);
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
  
  // Function to export timetable as PDF
  const exportToPDF = () => {
    // In a real application, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };
  
  // Group entries by date for better organization
  const groupedByDate = filteredEntries.reduce((groups, entry) => {
    const date = entry.date || 'Unscheduled';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  return (
    <>
      <Header title="Academic Timetable" />
      
      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}
      
      <div className="page-actions">
        <Link to="/lecturer-dashboard" className="btn-secondary">
          <FaArrowLeft className="icon-left" /> Back to Dashboard
        </Link>
        <button className="btn-primary" onClick={exportToPDF}>
          <FaDownload className="icon-left" /> Export Timetable
        </button>
      </div>
      
      <div className="filter-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search lectures..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label><FaFilter className="icon-left" /> Class Type:</label>
            <select 
              value={filters.classType}
              onChange={(e) => handleFilterChange('classType', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="physical">Physical Only</option>
              <option value="online">Online Only</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label><FaCalendarAlt className="icon-left" /> Date Range:</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading timetable data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchTimetableEntries}>Retry</button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="no-data-message">
          <p>No timetable entries found matching your filters.</p>
        </div>
      ) : (
        <div className="timetable-container">
          {Object.keys(groupedByDate).map(date => (
            <div key={date} className="timetable-day-section">
              <h3 className="date-header">{date}</h3>
              
              <div className="table-responsive">
                <table className="timetable-table">
                  <thead>
                    <tr>
                      <th>Lecture Name</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Class Type</th>
                      <th>Venue/Link</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDate[date].map(entry => (
                      <tr key={entry.id || entry._id}>
                        <td>{entry.lectureName}</td>
                        <td>{entry.startTime}</td>
                        <td>{entry.endTime}</td>
                        <td>
                          <span className={`class-type-badge ${entry.classType}`}>
                            {entry.classType === 'online' ? 'Online' : 'Physical'}
                          </span>
                        </td>
                        <td>
                          {entry.classType === 'online' ? (
                            <a href={entry.onlineLink} target="_blank" rel="noopener noreferrer" className="online-link">
                              Join Online
                            </a>
                          ) : (
                            entry.venue
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-small">
                              <FaCalendarAlt className="icon-left" /> Add to Calendar
                            </button>
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

export default AcademicTimetablePage;
