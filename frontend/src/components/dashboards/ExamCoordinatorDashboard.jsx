import { useState, useEffect } from 'react';
import Header from '../shared/Header';
import { FaClipboardCheck, FaUserFriends, FaRegCheckCircle, FaTools, FaPlus, FaTimes, FaSearch, FaEdit, FaTrashAlt, FaFilePdf, FaFileDownload, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import { exportToPDF, exportToCSV } from '../../utils/exportUtils';

const ExamCoordinatorDashboard = () => {
  const [stats, setStats] = useState({
    assignedExams: 0,
    assignedProctors: 0,
    roomsReady: 0,
    pendingSetups: 0
  });
  
  const [examTasks, setExamTasks] = useState([]);
  
  // New state for exams management
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [showEditExamForm, setShowEditExamForm] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  
  // Form data for new exam
  const [newExamData, setNewExamData] = useState({
    title: '',
    course: '',
    description: '',
    examDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    examUrl: ''
  });
  
  // API Base URL
  const API_BASE_URL = 'http://localhost:5555/api';

  // Helper function to check if a date is in the past
  const isDateInPast = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset hours to compare dates only
    const selectedDate = new Date(dateString);
    return selectedDate < today;
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // In a real app, you would fetch actual data here
  useEffect(() => {
    // Simulate fetching data
    setStats({
      assignedExams: 6,
      assignedProctors: 18,
      roomsReady: 4,
      pendingSetups: 2
    });
    
    setExamTasks([
      { id: 1, task: 'Prepare Room A for IELTS Exam', deadline: '2023-12-04', priority: 'High', status: 'Pending' },
      { id: 2, task: 'Coordinate proctor assignments for TOEFL', deadline: '2023-12-06', priority: 'Medium', status: 'In Progress' },
      { id: 3, task: 'Print examination materials for BEC', deadline: '2023-12-08', priority: 'High', status: 'Pending' },
      { id: 4, task: 'Arrange seating plan for IELTS Academic', deadline: '2023-12-11', priority: 'Medium', status: 'Not Started' }
    ]);
    
    // Fetch exams
    fetchExams();
  }, []);
  
  // Function to fetch exams
  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Failed to load exams. Please try again.');
      
      // Fallback to sample data if API fails
      const mockExams = [
        { 
          id: 1, 
          title: 'IELTS Reading Exam', 
          course: 'IELTS Preparation',
          description: 'Reading comprehension test for IELTS preparation',
          examDate: '2023-12-15',
          startTime: '09:00',
          endTime: '10:00',
          duration: '60',
          totalMarks: '100',
          passingMarks: '60',
          examUrl: 'https://exam.example.com/ielts-reading',
          status: 'Published'
        },
        { 
          id: 2, 
          title: 'TOEFL Speaking Assessment', 
          course: 'TOEFL Preparation',
          description: 'Speaking assessment for TOEFL preparation',
          examDate: '2023-12-18',
          startTime: '10:00',
          endTime: '10:45',
          duration: '45',
          totalMarks: '80',
          passingMarks: '50',
          examUrl: 'https://exam.example.com/toefl-speaking',
          status: 'Draft'
        },
        { 
          id: 3, 
          title: 'Business English Midterm', 
          course: 'Business English',
          description: 'Midterm examination covering Units 1-5',
          examDate: '2023-12-20',
          startTime: '11:00',
          endTime: '12:30',
          duration: '90',
          totalMarks: '120',
          passingMarks: '70',
          examUrl: 'https://exam.example.com/business-midterm',
          status: 'Published'
        }
      ];
      
      setExams(mockExams);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate exam date if the field is being changed
    if (name === 'examDate' && isDateInPast(value)) {
      setFormError("Exam date cannot be in the past. Please select a current or future date.");
    } else if (name === 'examDate') {
      // Clear form error if valid date is selected
      setFormError(null);
    }
    
    setNewExamData({
      ...newExamData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate exam date before submission
    if (isDateInPast(newExamData.examDate)) {
      setFormError("Exam date cannot be in the past. Please select a current or future date.");
      return;
    }
    
    setFormSubmitting(true);
    setFormError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/exams`, newExamData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const savedExam = response.data.exam;
      setExams([...exams, savedExam]);
      
      // Reset form and hide it
      resetExamForm();
      
      setShowAddExamForm(false);
      alert('New exam added successfully');
    } catch (err) {
      console.error('Error adding exam:', err);
      setFormError(err.response?.data?.message || 'Failed to add new exam. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Handle edit button click
  const handleEdit = (exam) => {
    setCurrentExam(exam);
    setNewExamData({
      title: exam.title,
      course: exam.course,
      description: exam.description,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      examUrl: exam.examUrl
    });
    setShowEditExamForm(true);
  };
  
  // Handle update form submission
  const handleUpdateExam = async (e) => {
    e.preventDefault();
    
    // Validate exam date before submission
    if (isDateInPast(newExamData.examDate)) {
      setFormError("Exam date cannot be in the past. Please select a current or future date.");
      return;
    }
    
    setFormSubmitting(true);
    setFormError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/exams/${currentExam._id}`, newExamData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedExam = response.data.exam;
      
      // Update local state
      const updatedExams = exams.map(exam => {
        if (exam._id === currentExam._id) {
          return updatedExam;
        }
        return exam;
      });
      
      setExams(updatedExams);
      setShowEditExamForm(false);
      alert('Exam updated successfully');
    } catch (err) {
      console.error('Error updating exam:', err);
      setFormError(err.response?.data?.message || 'Failed to update exam. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Handle delete button click
  const handleDelete = async (exam) => {
    if (!window.confirm(`Are you sure you want to delete "${exam.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/exams/${exam._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the local state
      const updatedExams = exams.filter(e => e._id !== exam._id);
      setExams(updatedExams);
      alert('Exam deleted successfully');
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert('Failed to delete exam. Please try again.');
    }
  };
  
  // Handle toggle published status
  const handleToggleStatus = async (exam) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE_URL}/exams/${exam._id}/status`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedExam = response.data.exam;
      
      // Update the local state
      const updatedExams = exams.map(e => {
        if (e._id === exam._id) {
          return updatedExam;
        }
        return e;
      });
      
      setExams(updatedExams);
      alert(`Exam ${updatedExam.status === 'Published' ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      console.error('Error updating exam status:', err);
      alert('Failed to update exam status. Please try again.');
    }
  };
  
  // Handle PDF generation
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      // Format exam data for PDF export
      const examData = exams.map(exam => ({
        title: exam.title,
        course: exam.course,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: `${exam.duration} minutes`,
        totalMarks: exam.totalMarks,
        status: exam.status
      }));
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `exams_report_${date}`;
      
      // Generate and download the PDF
      exportToPDF(
        examData,
        filename,
        ['title', 'course', 'examDate', 'startTime', 'endTime', 'duration', 'totalMarks', 'status'],
        'Exam Management Report'
      );
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Handle CSV generation
  const handleGenerateCSV = async () => {
    setCsvLoading(true);
    try {
      // Format exam data for CSV export
      const examData = exams.map(exam => ({
        Title: exam.title,
        Course: exam.course,
        Description: exam.description,
        'Exam Date': exam.examDate,
        'Start Time': exam.startTime,
        'End Time': exam.endTime,
        'Duration (min)': exam.duration,
        'Total Marks': exam.totalMarks,
        'Passing Marks': exam.passingMarks,
        Status: exam.status
      }));
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `exams_report_${date}`;
      
      // Generate and download the CSV
      exportToCSV(examData, filename);
    } catch (err) {
      console.error('Error generating CSV report:', err);
      alert('Failed to generate CSV report. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };
  
  // Filter exams based on search term
  const filteredExams = exams.filter(exam => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      exam.title.toLowerCase().includes(searchTermLower) ||
      exam.course.toLowerCase().includes(searchTermLower) ||
      exam.description.toLowerCase().includes(searchTermLower)
    );
  });

  // Reset form function - update to include new fields
  const resetExamForm = () => {
    setNewExamData({
      title: '',
      course: '',
      description: '',
      examDate: '',
      startTime: '',
      endTime: '',
      duration: '',
      totalMarks: '',
      passingMarks: '',
      examUrl: ''
    });
  };

  return (
    <>
      <Header title="Exam Coordinator Dashboard" />
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon"><FaClipboardCheck /></div>
          <div className="stat-details">
            <h3>Assigned Exams</h3>
            <p>{stats.assignedExams}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaUserFriends /></div>
          <div className="stat-details">
            <h3>Assigned Proctors</h3>
            <p>{stats.assignedProctors}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaRegCheckCircle /></div>
          <div className="stat-details">
            <h3>Rooms Ready</h3>
            <p>{stats.roomsReady}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaTools /></div>
          <div className="stat-details">
            <h3>Pending Setups</h3>
            <p>{stats.pendingSetups}</p>
          </div>
        </div>
      </div>
      
      {/* Add Exam Button and Generate Report Button */}
      <div className="page-actions">
        <button className="btn-primary" onClick={() => setShowAddExamForm(true)}>
          <FaPlus className="icon-left" /> Add New Exam
        </button>
        <button 
          className="btn-primary pdf-btn" 
          onClick={handleGeneratePDF}
          disabled={pdfLoading || exams.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading ? 'Generating...' : 'Generate PDF Report'}
        </button>
        <button 
          className="btn-primary" 
          onClick={handleGenerateCSV}
          disabled={csvLoading || exams.length === 0}
        >
          <FaFileDownload className="icon-left" />
          {csvLoading ? 'Generating...' : 'Export CSV'}
        </button>
      </div>
      
      {/* Exam Management Section */}
      <div className="dashboard-grid">
        <div className="dashboard-card exam-management-card">
          <div className="card-header-with-actions">
            <h3>Exam Management</h3>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search exams..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Total Marks</th>
                  <th>Passing Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-results">No exams found matching your search</td>
                  </tr>
                ) : (
                  filteredExams.map(exam => (
                    <tr key={exam.id || exam._id}>
                      <td>{exam.title}</td>
                      <td>{exam.course}</td>
                      <td>{exam.examDate}</td>
                      <td>{exam.startTime}</td>
                      <td>{exam.endTime}</td>
                      <td>{exam.duration} min</td>
                      <td>{exam.totalMarks}</td>
                      <td>{exam.passingMarks}</td>
                      <td>
                        <span className={`status-badge ${exam.status.toLowerCase()}`}>
                          {exam.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-small"
                            onClick={() => handleToggleStatus(exam)}
                          >
                            {exam.status === 'Published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button 
                            className="btn-small" 
                            onClick={() => handleEdit(exam)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="btn-small delete" 
                            onClick={() => handleDelete(exam)}
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
        </div>
      </div>
      
    
      
      {/* Add Exam Form Modal */}
      {showAddExamForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Exam</h3>
              <button className="close-btn" onClick={() => setShowAddExamForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="title">Exam Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newExamData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="course">Course</label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={newExamData.course}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newExamData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam description"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="examDate">Exam Date</label>
                  <input
                    type="date"
                    id="examDate"
                    name="examDate"
                    value={newExamData.examDate}
                    onChange={handleInputChange}
                    required
                    min={getTodayFormatted()}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={newExamData.startTime}
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
                    value={newExamData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={newExamData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter duration in minutes"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="totalMarks">Total Marks</label>
                  <input
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    value={newExamData.totalMarks}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter total marks"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="passingMarks">Passing Marks</label>
                  <input
                    type="number"
                    id="passingMarks"
                    name="passingMarks"
                    value={newExamData.passingMarks}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter passing marks"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="examUrl">Exam URL</label>
                <input
                  type="url"
                  id="examUrl"
                  name="examUrl"
                  value={newExamData.examUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter URL for exam access (e.g., https://exam.example.com/quiz)"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddExamForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Adding...' : 'Add Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Exam Form Modal */}
      {showEditExamForm && currentExam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Exam</h3>
              <button className="close-btn" onClick={() => setShowEditExamForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleUpdateExam} className="staff-form">
              <div className="form-group">
                <label htmlFor="edit-title">Exam Title</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={newExamData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-course">Course</label>
                <input
                  type="text"
                  id="edit-course"
                  name="course"
                  value={newExamData.course}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={newExamData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam description"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-examDate">Exam Date</label>
                  <input
                    type="date"
                    id="edit-examDate"
                    name="examDate"
                    value={newExamData.examDate}
                    onChange={handleInputChange}
                    required
                    min={getTodayFormatted()}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-startTime">Start Time</label>
                  <input
                    type="time"
                    id="edit-startTime"
                    name="startTime"
                    value={newExamData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-endTime">End Time</label>
                  <input
                    type="time"
                    id="edit-endTime"
                    name="endTime"
                    value={newExamData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="edit-duration"
                    name="duration"
                    value={newExamData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter duration in minutes"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-totalMarks">Total Marks</label>
                  <input
                    type="number"
                    id="edit-totalMarks"
                    name="totalMarks"
                    value={newExamData.totalMarks}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter total marks"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-passingMarks">Passing Marks</label>
                  <input
                    type="number"
                    id="edit-passingMarks"
                    name="passingMarks"
                    value={newExamData.passingMarks}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter passing marks"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-examUrl">Exam URL</label>
                <input
                  type="url"
                  id="edit-examUrl"
                  name="examUrl"
                  value={newExamData.examUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter URL for exam access (e.g., https://exam.example.com/quiz)"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowEditExamForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Updating...' : 'Update Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamCoordinatorDashboard;
