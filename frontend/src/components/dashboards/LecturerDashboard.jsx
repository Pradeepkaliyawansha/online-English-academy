import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/Header';
import { FaUsers, FaBook, FaClipboardList, FaCalendarAlt, FaChalkboardTeacher, FaClipboardCheck, FaServer, FaSearch, FaFileDownload, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import { exportToPDF } from '../../utils/exportUtils';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    upcomingLectures: 0,
    pendingAssignments: 0
  });
  
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [academicTimetable, setAcademicTimetable] = useState([]);
  const [examTimetable, setExamTimetable] = useState([]);
  
  // Add loading and error states
  const [loading, setLoading] = useState({
    stats: true,
    schedule: true,
    timetable: true,
    exams: true
  });
  
  const [error, setError] = useState({
    stats: null,
    schedule: null,
    timetable: null,
    exams: null
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
    fetchStats();
    fetchUpcomingSchedule();
    fetchAcademicTimetable();
    fetchExamTimetable();
    
    // Set up interval to check server status periodically
    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000); // Check every minute if disconnected
    
    return () => clearInterval(serverCheckInterval);
  }, []);

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
  
  // Function to fetch lecturer stats
  const fetchStats = async () => {
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        // Fallback to sample data when offline
        setStats({
          totalStudents: 48,
          totalCourses: 3,
          upcomingLectures: 4,
          pendingAssignments: 12
        });
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/lecturer/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching lecturer stats:', err);
      setError(prev => ({ ...prev, stats: 'Failed to load stats' }));
      
      // Fallback to sample data if API fails
      setStats({
        totalStudents: 48,
        totalCourses: 3,
        upcomingLectures: 4,
        pendingAssignments: 12
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Function to fetch upcoming schedule
  const fetchUpcomingSchedule = async () => {
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        // Fallback to sample data when offline
        setUpcomingSchedule([
          { id: 1, title: 'Advanced Grammar', time: '10:00 AM', date: 'Today', location: 'Room 301' },
          { id: 2, title: 'Speaking Practice', time: '2:00 PM', date: 'Today', location: 'Room 201' },
          { id: 3, title: 'Business English', time: '9:30 AM', date: 'Tomorrow', location: 'Room 105' },
          { id: 4, title: 'IELTS Preparation', time: '3:30 PM', date: 'Tomorrow', location: 'Room 402' }
        ]);
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/lecturer/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUpcomingSchedule(response.data);
    } catch (err) {
      console.error('Error fetching upcoming schedule:', err);
      setError(prev => ({ ...prev, schedule: 'Failed to load schedule' }));
      
      // Fallback to sample data if API fails
      setUpcomingSchedule([
        { id: 1, title: 'Advanced Grammar', time: '10:00 AM', date: 'Today', location: 'Room 301' },
        { id: 2, title: 'Speaking Practice', time: '2:00 PM', date: 'Today', location: 'Room 201' },
        { id: 3, title: 'Business English', time: '9:30 AM', date: 'Tomorrow', location: 'Room 105' },
        { id: 4, title: 'IELTS Preparation', time: '3:30 PM', date: 'Tomorrow', location: 'Room 402' }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  };

  // Function to fetch academic timetable
  const fetchAcademicTimetable = async () => {
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        // Fallback to sample data when offline
        setAcademicTimetable([
          { id: 1, lectureName: 'Advanced Grammar', startTime: '10:00 AM', endTime: '11:30 AM', classType: 'physical', venue: 'Room 301' },
          { id: 2, lectureName: 'Speaking Practice', startTime: '2:00 PM', endTime: '3:30 PM', classType: 'online', onlineLink: 'https://zoom.us/j/123456789' },
          { id: 3, lectureName: 'Business English', startTime: '9:30 AM', endTime: '11:00 AM', classType: 'physical', venue: 'Room 105' },
          { id: 4, lectureName: 'IELTS Preparation', startTime: '3:30 PM', endTime: '5:00 PM', classType: 'online', onlineLink: 'https://zoom.us/j/987654321' }
        ]);
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/timetable`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAcademicTimetable(response.data);
    } catch (err) {
      console.error('Error fetching academic timetable:', err);
      setError(prev => ({ ...prev, timetable: 'Failed to load timetable' }));
      
      // Fallback to sample data if API fails
      setAcademicTimetable([
        { id: 1, lectureName: 'Advanced Grammar', startTime: '10:00 AM', endTime: '11:30 AM', classType: 'physical', venue: 'Room 301' },
        { id: 2, lectureName: 'Speaking Practice', startTime: '2:00 PM', endTime: '3:30 PM', classType: 'online', onlineLink: 'https://zoom.us/j/123456789' },
        { id: 3, lectureName: 'Business English', startTime: '9:30 AM', endTime: '11:00 AM', classType: 'physical', venue: 'Room 105' },
        { id: 4, lectureName: 'IELTS Preparation', startTime: '3:30 PM', endTime: '5:00 PM', classType: 'online', onlineLink: 'https://zoom.us/j/987654321' }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, timetable: false }));
    }
  };

  // Function to fetch exam timetable
  const fetchExamTimetable = async () => {
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        // Fallback to sample data when offline
        setExamTimetable([
          { id: 1, title: 'Mid-term Grammar Test', course: 'Advanced Grammar', date: '2023-12-15', startTime: '10:00 AM', endTime: '11:30 AM', location: 'Hall A', totalMarks: 100, passingMarks: 60 },
          { id: 2, title: 'Business English Assessment', course: 'Business English', date: '2023-12-18', startTime: '2:00 PM', endTime: '3:30 PM', location: 'Hall B', totalMarks: 80, passingMarks: 50 },
          { id: 3, title: 'IELTS Mock Test', course: 'IELTS Preparation', date: '2023-12-20', startTime: '9:00 AM', endTime: '12:00 PM', location: 'Hall C', totalMarks: 120, passingMarks: 70 }
        ]);
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setExamTimetable(response.data);
    } catch (err) {
      console.error('Error fetching exam timetable:', err);
      setError(prev => ({ ...prev, exams: 'Failed to load exams' }));
      
      // Fallback to sample data if API fails
      setExamTimetable([
        { id: 1, title: 'Mid-term Grammar Test', course: 'Advanced Grammar', date: '2023-12-15', startTime: '10:00 AM', endTime: '11:30 AM', location: 'Hall A', totalMarks: 100, passingMarks: 60 },
        { id: 2, title: 'Business English Assessment', course: 'Business English', date: '2023-12-18', startTime: '2:00 PM', endTime: '3:30 PM', location: 'Hall B', totalMarks: 80, passingMarks: 50 },
        { id: 3, title: 'IELTS Mock Test', course: 'IELTS Preparation', date: '2023-12-20', startTime: '9:00 AM', endTime: '12:00 PM', location: 'Hall C', totalMarks: 120, passingMarks: 70 }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, exams: false }));
    }
  };

  // Navigation functions
  const viewAcademicTimetable = () => {
    navigate('/academic-timetable');
  };
  
  const viewExamTimetable = () => {
    navigate('/exam-timetable');
  };

  const [timetableSearchTerm, setTimetableSearchTerm] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Function to generate and download report
  const handleGenerateReport = () => {
    // Get data to export (either filtered or all)
    const dataToExport = timetableSearchTerm 
      ? academicTimetable.filter(entry => 
          entry.lectureName.toLowerCase().includes(timetableSearchTerm.toLowerCase()))
      : academicTimetable;
    
    // Format the data for CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Lecture Name,Start Time,End Time,Class Type,Venue/Link\n";
    
    dataToExport.forEach(entry => {
      const venue = entry.classType === 'online' ? entry.onlineLink : entry.venue;
      csvContent += `"${entry.lectureName}","${entry.startTime}","${entry.endTime}","${entry.classType === 'online' ? 'Online' : 'Physical'}","${venue}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `academic_timetable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Download it
    link.click();
    document.body.removeChild(link);
  };

  // Function to generate and download PDF report
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      // Get data to export (either filtered or all)
      const dataToExport = timetableSearchTerm 
        ? academicTimetable.filter(entry => 
            entry.lectureName.toLowerCase().includes(timetableSearchTerm.toLowerCase()))
        : academicTimetable;
      
      // Format the data for PDF
      const timetableData = dataToExport.map(entry => ({
        lectureName: entry.lectureName,
        startTime: entry.startTime,
        endTime: entry.endTime,
        type: entry.classType === 'online' ? 'Online' : 'Physical',
        location: entry.classType === 'online' ? entry.onlineLink : entry.venue
      }));
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `academic_timetable_${date}`;
      
      // Generate and download the PDF
      exportToPDF(
        timetableData,
        filename,
        ['lectureName', 'startTime', 'endTime', 'type', 'location'],
        'Academic Timetable Report'
      );
      
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <Header title="Lecturer Dashboard" />
      
      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}
      
      <div className="dashboard-grid">
        {/* Academic Timetable Section */}
        <div className="dashboard-card">
          <div className="card-header-with-actions">
            <h3>Academic Timetable</h3>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by lecturer name..." 
                value={timetableSearchTerm}
                onChange={(e) => setTimetableSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="card-actions">
              <button className="btn-small" onClick={viewAcademicTimetable}>
                <FaChalkboardTeacher className="icon-left" /> Full Timetable
              </button>
              <button 
                className="btn-small"
                onClick={handleGeneratePDF}
                disabled={pdfLoading || academicTimetable.length === 0}
              >
                <FaFilePdf className="icon-left" />
                {pdfLoading ? 'Generating...' : 'PDF'}
              </button>
              <button 
                className="btn-small"
                onClick={handleGenerateReport}
                disabled={academicTimetable.length === 0}
              >
                <FaFileDownload className="icon-left" /> CSV
              </button>
            </div>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Lecture Name</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Class Type</th>
                  <th>Venue/Link</th>
                </tr>
              </thead>
              <tbody>
                {loading.timetable ? (
                  <tr>
                    <td colSpan="5" className="loading-text">Loading timetable...</td>
                  </tr>
                ) : academicTimetable.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-results">No timetable entries found</td>
                  </tr>
                ) : (
                  academicTimetable
                    .filter(entry => entry.lectureName.toLowerCase().includes(timetableSearchTerm.toLowerCase()))
                    .map(entry => (
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
                      </tr>
                    ))
                )}
                {academicTimetable.length > 0 && 
                 academicTimetable.filter(entry => entry.lectureName.toLowerCase().includes(timetableSearchTerm.toLowerCase())).length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-results">No lectures match your search</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); viewAcademicTimetable(); }} className="view-all">View Complete Timetable</a>
        </div>
        </div>
        
        {/* Exam Timetable Section */}
        <div className="dashboard-card">
          <div className="card-header-with-actions">
            <h3>Exam Timetable</h3>
            <div className="card-actions">
              <button className="btn-small" onClick={viewExamTimetable}>
                <FaClipboardCheck className="icon-left" /> All Exams
              </button>
            </div>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading.exams ? (
                  <tr>
                    <td colSpan="8" className="loading-text">Loading exams...</td>
                  </tr>
                ) : examTimetable.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-results">No upcoming exams found</td>
                  </tr>
                ) : (
                  examTimetable.map(exam => (
                    <tr key={exam.id || exam._id}>
                      <td>{exam.title}</td>
                      <td>{exam.course}</td>
                      <td>{exam.date || exam.examDate}</td>
                      <td>{`${exam.startTime} - ${exam.endTime}`}</td>
                      <td>{exam.duration ? `${exam.duration} min` : "N/A"}</td>
                      <td>{exam.location || exam.venue || "N/A"}</td>
                      <td>
                        {exam.status && (
                          <span className={`status-badge ${exam.status.toLowerCase()}`}>
                            {exam.status}
                          </span>
                        )}
                        {!exam.status && <span className="status-badge published">Active</span>}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {exam.examUrl && (
                            <a 
                              href={exam.examUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn-small"
                            >
                              View Exam
                            </a>
                          )}
                          <a 
                            href={`/exam-details/${exam.id || exam._id}`}
                            className="btn-small"
                          >
                            Details
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); viewExamTimetable(); }} className="view-all">View All Exams</a>
        </div>
      
    </>
  );
};

export default LecturerDashboard;
