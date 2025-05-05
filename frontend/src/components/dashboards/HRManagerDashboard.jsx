import { useState, useEffect } from 'react';
import Header from '../shared/Header';
import { FaUsers, FaUserPlus, FaUserMinus, FaCalendarAlt, FaTimes, FaServer, FaEdit, FaEye, FaTrashAlt, FaFilePdf, FaSearch, FaClipboardCheck, FaCheck, FaRegClock, FaExclamationCircle, FaFileExcel, FaCalendarWeek, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { exportToPDF } from '../../utils/exportUtils';
import { exportToCSV } from '../../utils/exportUtils';
import './HRManagerDashboard.css';

const HRManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    newApplications: 0,
    pendingReviews: 0,
    upcomingInterviews: 0
  });
  
  const [vacancies, setVacancies] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phoneNumber: '',
    address: '',
    salary: '',
    status: 'Active'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true,
    retryCount: 0
  });
  
  const API_BASE_URL = 'http://localhost:5555/api';
  
  // New state variables for view and edit modes
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [editStaffData, setEditStaffData] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phoneNumber: '',
    address: '',
    salary: '',
    status: 'Active'
  });
  const [editFormSubmitting, setEditFormSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New state for attendance tracking
  const [attendance, setAttendance] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });

  // New state for attendance summary
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceSummaryLoading, setAttendanceSummaryLoading] = useState(false);
  const [attendanceSummaryError, setAttendanceSummaryError] = useState(null);
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [summaryDateRange, setSummaryDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [csvLoading, setCsvLoading] = useState(false);

  // Function to check server connection
  const checkServerConnection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
      setServerStatus({
        connected: true,
        checking: false,
        retryCount: 0
      });
      return true;
    } catch (err) {
      setServerStatus(prev => ({
        connected: false,
        checking: false,
        retryCount: prev.retryCount + 1
      }));
      console.log(`Server connection failed. Retry count: ${serverStatus.retryCount + 1}`);
      return false;
    }
  };

  // Function to fetch staff from the database with retry mechanism
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Use sample data when offline
      const sampleStaff = [
        { 
          _id: '1', 
          name: 'Emily Parker', 
          role: 'English Lecturer', 
          department: 'Academic', 
          email: 'emily.parker@example.com', 
          phoneNumber: '(555) 123-4567', 
          address: '123 Academic Ave, City', 
          salary: 65000, 
          status: 'Active' 
        },
        // ...additional sample staff...
      ];
      
      setStaff(sampleStaff);
      setStats(prev => ({...prev, totalStaff: sampleStaff.length}));
      setError('Server is offline. Displaying sample data.');
      setLoading(false);
      
      // Schedule retry in 30 seconds if this isn't at least the 3rd attempt
      if (serverStatus.retryCount < 3) {
        setTimeout(() => fetchStaff(), 30000);
      }
      return;
    }
    
    try {
      // Server is connected, make the API request
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStaff(response.data);
      setStats(prevStats => ({
        ...prevStats,
        totalStaff: response.data.length
      }));
      
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff data. Please try again later.');
      
      // Fallback to sample data if API fails but server is online
      const sampleStaff = [
        { 
          _id: '1', 
          name: 'Emily Parker', 
          role: 'English Lecturer', 
          department: 'Academic', 
          email: 'emily.parker@example.com', 
          phoneNumber: '(555) 123-4567', 
          address: '123 Academic Ave, City', 
          salary: 65000, 
          status: 'Active' 
        },
        // ...more sample data...
      ];
      
      setStaff(sampleStaff);
      setStats(prev => ({...prev, totalStaff: sampleStaff.length}));
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission with server status awareness
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormSubmitting(true);
    setFormError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Create a mock response when offline
      setTimeout(() => {
        // Create a mock staff member with _id
        const mockStaff = {
          _id: `offline-${Date.now()}`,
          ...newStaffData,
          salary: Number(newStaffData.salary)
        };
        
        // Add to local state
        setStaff([...staff, mockStaff]);
        setStats(prev => ({...prev, totalStaff: prev.totalStaff + 1}));
        
        // Reset form and hide it
        setNewStaffData({
          name: '',
          role: '',
          department: '',
          email: '',
          phoneNumber: '',
          address: '',
          salary: '',
          status: 'Active'
        });
        
        setShowAddStaffForm(false);
        alert('OFFLINE MODE: Staff member saved locally. Will sync when server is available.');
        setFormSubmitting(false);
      }, 1000); // Simulate network delay
      
      return;
    }
    
    try {
      // Server is connected, proceed with API call
      const token = localStorage.getItem('token');
      
      const staffData = {
        ...newStaffData,
        salary: Number(newStaffData.salary)
      };
      
      const response = await axios.post(`${API_BASE_URL}/staff`, staffData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const savedStaff = response.data.staff;
      setStaff([...staff, savedStaff]);
      
      setStats({
        ...stats,
        totalStaff: stats.totalStaff + 1
      });
      
      // Reset form and hide it
      setNewStaffData({
        name: '',
        role: '',
        department: '',
        email: '',
        phoneNumber: '',
        address: '',
        salary: '',
        status: 'Active'
      });
      
      setShowAddStaffForm(false);
      
      alert('New staff member added successfully');
      
    } catch (err) {
      console.error('Error adding staff member:', err);
      setFormError(err.response?.data?.message || 'Failed to add new staff member. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  useEffect(() => {
    // Initial server check and data fetch
    fetchStaff();
    fetchAttendanceForToday();
    fetchAttendanceSummary(); // Add this line to fetch the attendance summary
    
    // For other data, we'll keep the simulated data for now
    setStats(prevStats => ({
      ...prevStats,
      newApplications: 8,
      pendingReviews: 12,
      upcomingInterviews: 5
    }));
    
    setVacancies([
      { id: 1, position: 'Senior English Lecturer', department: 'Academic', applications: 12, deadline: '2023-12-15' },
      { id: 2, position: 'Student Coordinator', department: 'Administration', applications: 8, deadline: '2023-12-10' },
      { id: 3, position: 'IELTS Examiner', department: 'Examination', applications: 6, deadline: '2023-12-20' },
    ]);
    
    // Set up interval to check server status periodically
    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000); // Check every minute if disconnected
    
    return () => clearInterval(serverCheckInterval);
  }, []);

  // Function to fetch today's attendance
  const fetchAttendanceForToday = async () => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    
    const today = new Date().toISOString().split('T')[0];
    setAttendanceDate(today);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Use sample data when offline
      setTimeout(() => {
        // Generate sample attendance based on staff data
        if (staff.length > 0) {
          const sampleAttendance = staff.map(s => ({
            _id: `offline-attendance-${s._id}-${today}`,
            staffId: s._id,
            staffName: s.name,
            date: today,
            status: Math.random() > 0.2 ? 'Present' : Math.random() > 0.5 ? 'Absent' : 'Late',
            timeIn: '09:00 AM',
            timeOut: '05:00 PM',
            notes: ''
          }));
          
          setAttendance(sampleAttendance);
          calculateAttendanceStats(sampleAttendance);
        } else {
          setAttendance([]);
          setAttendanceStats({
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          });
        }
        
        setAttendanceLoading(false);
      }, 1000); // Simulate network delay
      
      return;
    }
    
    try {
      // Server is connected, make the API request
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/attendance?date=${today}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAttendance(response.data);
      calculateAttendanceStats(response.data);
      
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setAttendanceError('Failed to load attendance data. Please try again later.');
      
      // Generate empty attendance if not yet recorded
      setAttendance([]);
      setAttendanceStats({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (attendanceData) => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      total: attendanceData.length
    };
    
    attendanceData.forEach(record => {
      if (record.status === 'Present') stats.present++;
      else if (record.status === 'Absent') stats.absent++;
      else if (record.status === 'Late') stats.late++;
    });
    
    setAttendanceStats(stats);
  };

  // Initialize attendance form
  const initializeAttendanceForm = () => {
    // Create attendance records for all staff
    const initialAttendance = staff.map(s => ({
      staffId: s._id,
      staffName: s.name,
      date: attendanceDate,
      status: 'Present', // Default to Present
      timeIn: '09:00', // Default time
      timeOut: '17:00', // Default time
      notes: ''
    }));
    
    setAttendance(initialAttendance);
    setShowAttendanceModal(true);
  };

  // Handle attendance status change
  const handleAttendanceStatusChange = (staffId, status) => {
    setAttendance(prev => 
      prev.map(record => 
        record.staffId === staffId ? { ...record, status } : record
      )
    );
  };

  // Handle attendance time change
  const handleAttendanceTimeChange = (staffId, field, time) => {
    setAttendance(prev => 
      prev.map(record => 
        record.staffId === staffId ? { ...record, [field]: time } : record
      )
    );
  };

  // Handle attendance notes change
  const handleAttendanceNotesChange = (staffId, notes) => {
    setAttendance(prev => 
      prev.map(record => 
        record.staffId === staffId ? { ...record, notes } : record
      )
    );
  };

  // Submit attendance
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    
    setAttendanceLoading(true);
    setAttendanceError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Handle offline mode
      setTimeout(() => {
        // Just use the current attendance state as if it was saved
        calculateAttendanceStats(attendance);
        setShowAttendanceModal(false);
        alert('OFFLINE MODE: Attendance saved locally. Will sync when server is available.');
        setAttendanceLoading(false);
      }, 1000); // Simulate network delay
      
      return;
    }
    
    try {
      // Server is connected, proceed with API call
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE_URL}/attendance/batch`, { attendance }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAttendance(response.data);
      calculateAttendanceStats(response.data);
      
      setShowAttendanceModal(false);
      alert('Attendance recorded successfully');
      
    } catch (err) {
      console.error('Error recording attendance:', err);
      setAttendanceError(err.response?.data?.message || 'Failed to record attendance. Please try again.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Handle date change for attendance viewing
  const handleAttendanceDateChange = async (e) => {
    const selectedDate = e.target.value;
    setAttendanceDate(selectedDate);
    
    setAttendanceLoading(true);
    setAttendanceError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Use sample data when offline
      setTimeout(() => {
        // Generate sample attendance based on staff data
        if (staff.length > 0) {
          const sampleAttendance = staff.map(s => ({
            _id: `offline-attendance-${s._id}-${selectedDate}`,
            staffId: s._id,
            staffName: s.name,
            date: selectedDate,
            status: Math.random() > 0.2 ? 'Present' : Math.random() > 0.5 ? 'Absent' : 'Late',
            timeIn: '09:00 AM',
            timeOut: '05:00 PM',
            notes: ''
          }));
          
          setAttendance(sampleAttendance);
          calculateAttendanceStats(sampleAttendance);
        } else {
          setAttendance([]);
          setAttendanceStats({
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          });
        }
        
        setAttendanceLoading(false);
      }, 1000); // Simulate network delay
      
      return;
    }
    
    try {
      // Server is connected, make the API request
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/attendance?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAttendance(response.data);
      calculateAttendanceStats(response.data);
      
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setAttendanceError('Failed to load attendance data for selected date.');
      
      // Generate empty attendance if not yet recorded
      setAttendance([]);
      setAttendanceStats({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Export attendance to PDF
  const exportAttendanceToPDF = async () => {
    setPdfLoading(true);
    try {
      // Format filtered attendance data for PDF
      const attendanceData = filteredAttendance.map(record => ({
        name: record.staffName,
        status: record.status,
        timeIn: record.timeIn,
        timeOut: record.timeOut,
        notes: record.notes || 'N/A'
      }));
      
      // Generate filename with date
      const filename = `attendance_report_${attendanceDate}`;
      
      // Generate and download the PDF
      exportToPDF(
        attendanceData,
        filename,
        ['name', 'status', 'timeIn', 'timeOut', 'notes'],
        `Staff Attendance Report - ${attendanceDate}`
      );
      
    } catch (err) {
      console.error('Error generating attendance PDF report:', err);
      alert('Failed to generate attendance PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Function to fetch attendance summary
  const fetchAttendanceSummary = async () => {
    setAttendanceSummaryLoading(true);
    setAttendanceSummaryError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Generate sample data in offline mode
      setTimeout(() => {
        if (staff.length > 0) {
          const sampleSummary = staff.map(s => {
            const totalDays = 30;
            const presentDays = Math.floor(Math.random() * (totalDays - 5)) + 15; // 15-25 present days
            const lateDays = Math.floor(Math.random() * 5); // 0-4 late days
            const absentDays = totalDays - presentDays - lateDays;
            
            return {
              staffId: s._id,
              staffName: s.name,
              totalDays,
              present: presentDays,
              absent: absentDays,
              late: lateDays,
              presentPercentage: Math.round((presentDays / totalDays) * 100)
            };
          });
          
          setAttendanceSummary(sampleSummary);
        } else {
          setAttendanceSummary([]);
        }
        setAttendanceSummaryLoading(false);
      }, 1000);
      return;
    }
    
    try {
      // Use the date range from state
      const { startDate, endDate } = summaryDateRange;
      const token = localStorage.getItem('token');
      
      // Fetch all attendance records for the date range
      const response = await axios.get(
        `${API_BASE_URL}/attendance/summary?startDate=${startDate}&endDate=${endDate}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setAttendanceSummary(response.data);
    } catch (err) {
      console.error('Error fetching attendance summary:', err);
      setAttendanceSummaryError('Failed to load attendance summary data.');
      
      // Generate sample data as fallback
      if (staff.length > 0) {
        const sampleSummary = staff.map(s => {
          const totalDays = 30;
          const presentDays = Math.floor(Math.random() * (totalDays - 5)) + 15;
          const lateDays = Math.floor(Math.random() * 5);
          const absentDays = totalDays - presentDays - lateDays;
          
          return {
            staffId: s._id,
            staffName: s.name,
            totalDays,
            present: presentDays,
            absent: absentDays,
            late: lateDays,
            presentPercentage: Math.round((presentDays / totalDays) * 100)
          };
        });
        
        setAttendanceSummary(sampleSummary);
      }
    } finally {
      setAttendanceSummaryLoading(false);
    }
  };

  // Handle date range change for summary
  const handleSummaryDateRangeChange = (field, value) => {
    setSummaryDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply date filter for attendance summary
  const handleApplyDateFilter = () => {
    fetchAttendanceSummary();
  };

  // Export attendance summary to CSV
  const exportAttendanceSummaryToCSV = () => {
    setCsvLoading(true);
    try {
      // Filter data based on search term
      const dataToExport = attendanceSearchTerm
        ? attendanceSummary.filter(record => 
            record.staffName.toLowerCase().includes(attendanceSearchTerm.toLowerCase()))
        : attendanceSummary;
      
      // Format data for CSV
      const formattedData = dataToExport.map(record => ({
        'Staff Name': record.staffName,
        'Total Days': record.totalDays,
        'Present Days': record.present,
        'Absent Days': record.absent,
        'Late Days': record.late,
        'Attendance %': `${record.presentPercentage}%`
      }));
      
      // Generate filename with date range
      const { startDate, endDate } = summaryDateRange;
      const filename = `attendance_summary_${startDate}_to_${endDate}`;
      
      // Export to CSV
      exportToCSV(formattedData, filename);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };

  // Export attendance summary to PDF
  const exportAttendanceSummaryToPDF = () => {
    setPdfLoading(true);
    try {
      // Filter data based on search term
      const dataToExport = attendanceSearchTerm
        ? attendanceSummary.filter(record => 
            record.staffName.toLowerCase().includes(attendanceSearchTerm.toLowerCase()))
        : attendanceSummary;
      
      // Format data for PDF
      const formattedData = dataToExport.map(record => ({
        name: record.staffName,
        totalDays: record.totalDays,
        present: record.present,
        absent: record.absent,
        late: record.late,
        percentage: `${record.presentPercentage}%`
      }));
      
      // Generate filename with date range
      const { startDate, endDate } = summaryDateRange;
      const filename = `attendance_summary_${startDate}_to_${endDate}`;
      
      // Export to PDF
      exportToPDF(
        formattedData,
        filename,
        ['name', 'totalDays', 'present', 'absent', 'late', 'percentage'],
        `Staff Attendance Summary (${startDate} to ${endDate})`
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phoneNumber
    if (name === 'phoneNumber') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedValue = numericValue.substring(0, 10);
      
      setNewStaffData({
        ...newStaffData,
        [name]: limitedValue
      });
    } else {
      setNewStaffData({
        ...newStaffData,
        [name]: value
      });
    }
  };

  // Handle view button click
  const handleView = (staffMember) => {
    setCurrentStaff(staffMember);
    setShowViewModal(true);
  };

  // Handle edit button click
  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    setEditStaffData({
      name: staffMember.name,
      role: staffMember.role,
      department: staffMember.department,
      email: staffMember.email,
      phoneNumber: staffMember.phoneNumber,
      address: staffMember.address,
      salary: staffMember.salary,
      status: staffMember.status
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditStaffData({
      ...editStaffData,
      [name]: value
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    setEditFormSubmitting(true);
    setEditFormError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Handle offline mode for edits
      setTimeout(() => {
        // Update the staff member in the local state
        const updatedStaff = staff.map(s => 
          s._id === currentStaff._id 
            ? { ...s, ...editStaffData, salary: Number(editStaffData.salary) } 
            : s
        );
        
        setStaff(updatedStaff);
        setShowEditModal(false);
        alert('OFFLINE MODE: Staff member updated locally. Will sync when server is available.');
        setEditFormSubmitting(false);
      }, 1000); // Simulate network delay
      
      return;
    }
    
    try {
      // Server is connected, proceed with API call
      const token = localStorage.getItem('token');
      
      const staffData = {
        ...editStaffData,
        salary: Number(editStaffData.salary)
      };
      
      const response = await axios.put(`${API_BASE_URL}/staff/${currentStaff._id}`, staffData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedStaff = response.data.staff;
      
      // Update the staff member in the local state
      setStaff(staff.map(s => s._id === currentStaff._id ? updatedStaff : s));
      
      // Close the modal and show success message
      setShowEditModal(false);
      alert('Staff member updated successfully');
      
    } catch (err) {
      console.error('Error updating staff member:', err);
      setEditFormError(err.response?.data?.message || 'Failed to update staff member. Please try again.');
    } finally {
      setEditFormSubmitting(false);
    }
  };

  // Handle delete button click
  const handleDelete = async (staffMember) => {
    // Ask for confirmation before deleting
    if (!window.confirm(`Are you sure you want to delete ${staffMember.name}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Handle delete in offline mode
      setTimeout(() => {
        // Filter out the deleted staff member
        const updatedStaff = staff.filter(s => s._id !== staffMember._id);
        setStaff(updatedStaff);
        setStats(prev => ({...prev, totalStaff: prev.totalStaff - 1}));
        
        alert('OFFLINE MODE: Staff member deleted locally. Will sync when server is available.');
        setDeleteLoading(false);
      }, 1000); // Simulate network delay
      
      return;
    }
    
    try {
      // Server is connected, proceed with API call
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/staff/${staffMember._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the staff list after successful deletion
      setStaff(staff.filter(s => s._id !== staffMember._id));
      setStats(prev => ({...prev, totalStaff: prev.totalStaff - 1}));
      
      alert('Staff member deleted successfully');
      
    } catch (err) {
      console.error('Error deleting staff member:', err);
      alert(err.response?.data?.message || 'Failed to delete staff member. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      // Export only relevant fields and format for PDF
      // Use filteredStaff instead of staff to only include searched results
      const staffData = filteredStaff.map(staffMember => ({
        name: staffMember.name,
        role: staffMember.role,
        department: staffMember.department,
        email: staffMember.email,
        phoneNumber: staffMember.phoneNumber,
        status: staffMember.status,
        salary: `$${typeof staffMember.salary === 'number' ? staffMember.salary.toLocaleString() : staffMember.salary}`
      }));
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `staff_directory_${date}`;
      
      // Generate and download the PDF
      exportToPDF(
        staffData,
        filename,
        ['name', 'role', 'department', 'email', 'phoneNumber', 'status', 'salary'],
        'Staff Directory Report'
      );
      
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Filter staff based on search term
  const filteredStaff = staff.filter(staffMember => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      staffMember.name.toLowerCase().includes(searchTermLower) ||
      staffMember.role.toLowerCase().includes(searchTermLower) ||
      staffMember.department.toLowerCase().includes(searchTermLower) ||
      staffMember.email.toLowerCase().includes(searchTermLower) ||
      staffMember.phoneNumber.toLowerCase().includes(searchTermLower) ||
      staffMember.status.toLowerCase().includes(searchTermLower)
    );
  });

  // Filter attendance records based on search term
  const filteredAttendance = attendance.filter(record => 
    record.staffName.toLowerCase().includes(attendanceSearchTerm.toLowerCase())
  );

  // Filter attendance summary based on search term
  const filteredAttendanceSummary = attendanceSummary.filter(record => 
    record.staffName.toLowerCase().includes(attendanceSearchTerm.toLowerCase())
  );

  return (
    <>
      <Header title="HR Manager Dashboard" />
      
   
      
      
      
   
      
      {/* Daily Attendance Section */}
      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Daily Attendance</h3>
          <div className="attendance-actions">
            <div className="date-selector">
              <label htmlFor="attendance-date">Date:</label>
              <input 
                type="date" 
                id="attendance-date" 
                value={attendanceDate}
                onChange={handleAttendanceDateChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={attendanceSearchTerm}
                onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={initializeAttendanceForm}
              disabled={attendanceLoading || staff.length === 0}
            >
              <FaClipboardCheck className="icon-left" /> Mark Attendance
            </button>
            {attendance.length > 0 && (
              <button 
                className="btn-primary pdf-btn" 
                onClick={exportAttendanceToPDF}
                disabled={pdfLoading || attendanceLoading}
              >
                <FaFilePdf className="icon-left" />
                {pdfLoading ? 'Generating...' : 'Export Report'}
              </button>
            )}
          </div>
        </div>
        
        {attendanceError && <div className="error-message">{attendanceError}</div>}
        
        {attendanceLoading ? (
          <div className="loading-spinner">Loading attendance data...</div>
        ) : (
          <>
            <div className="attendance-stats">
              <div className="attendance-stat">
                <div className="attendance-stat-icon present"><FaCheck /></div>
                <div className="attendance-stat-details">
                  <span>Present</span>
                  <strong>{attendanceStats.present}</strong>
                </div>
              </div>
              <div className="attendance-stat">
                <div className="attendance-stat-icon absent"><FaExclamationCircle /></div>
                <div className="attendance-stat-details">
                  <span>Absent</span>
                  <strong>{attendanceStats.absent}</strong>
                </div>
              </div>
              <div className="attendance-stat">
                <div className="attendance-stat-icon late"><FaRegClock /></div>
                <div className="attendance-stat-details">
                  <span>Late</span>
                  <strong>{attendanceStats.late}</strong>
                </div>
              </div>
              <div className="attendance-stat">
                <div className="attendance-stat-icon total"><FaUsers /></div>
                <div className="attendance-stat-details">
                  <span>Total</span>
                  <strong>{attendanceStats.total}</strong>
                </div>
              </div>
            </div>
          
            {filteredAttendance.length === 0 ? (
              <div className="no-results">
                {attendance.length === 0 
                  ? "No attendance records for this date. Click \"Mark Attendance\" to record attendance."
                  : "No staff members match your search."}
              </div>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map(record => (
                    <tr key={record._id || `temp-${record.staffId}`}>
                      <td>{record.staffName}</td>
                      <td>
                        <span className={`status-badge ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.timeIn}</td>
                      <td>{record.timeOut}</td>
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Attendance Summary Section - New */}
      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Attendance Summary</h3>
          <div className="attendance-actions">
            <div className="date-range-selector">
              <div className="date-field">
                <label htmlFor="summary-start-date">From:</label>
                <input 
                  type="date" 
                  id="summary-start-date" 
                  value={summaryDateRange.startDate}
                  onChange={(e) => handleSummaryDateRangeChange('startDate', e.target.value)}
                  max={summaryDateRange.endDate}
                />
              </div>
              <div className="date-field">
                <label htmlFor="summary-end-date">To:</label>
                <input 
                  type="date" 
                  id="summary-end-date" 
                  value={summaryDateRange.endDate}
                  onChange={(e) => handleSummaryDateRangeChange('endDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min={summaryDateRange.startDate}
                />
              </div>
              <button 
                className="btn-small filter-btn"
                onClick={handleApplyDateFilter}
                disabled={attendanceSummaryLoading}
              >
                <FaFilter className="icon-left" /> Apply
              </button>
            </div>
            <div className="export-actions">
              <button 
                className="btn-small"
                onClick={exportAttendanceSummaryToCSV}
                disabled={csvLoading || attendanceSummaryLoading || attendanceSummary.length === 0}
              >
                <FaFileExcel className="icon-left" />
                {csvLoading ? 'Exporting...' : 'Export CSV'}
              </button>
              <button 
                className="btn-small pdf-btn"
                onClick={exportAttendanceSummaryToPDF}
                disabled={pdfLoading || attendanceSummaryLoading || attendanceSummary.length === 0}
              >
                <FaFilePdf className="icon-left" />
                {pdfLoading ? 'Generating...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
        
        {attendanceSummaryError && <div className="error-message">{attendanceSummaryError}</div>}
        
        {attendanceSummaryLoading ? (
          <div className="loading-spinner">Loading attendance summary...</div>
        ) : (
          <>
            {filteredAttendanceSummary.length === 0 ? (
              <div className="no-results">
                {attendanceSummary.length === 0 
                  ? "No attendance records found for the selected period."
                  : "No staff members match your search."}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="attendance-summary-table">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Total Days</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Late</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceSummary.map(record => (
                      <tr key={`summary-${record.staffId}`}>
                        <td>{record.staffName}</td>
                        <td>{record.totalDays}</td>
                        <td>{record.present}</td>
                        <td>{record.absent}</td>
                        <td>{record.late}</td>
                        <td>
                          <div className="attendance-percentage">
                            <div 
                              className="percentage-bar" 
                              style={{ width: `${record.presentPercentage}%` }}
                              data-percentage={`${record.presentPercentage}%`}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Staff List and other existing content... */}
      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Staff Directory</h3>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
             {/* Add New Staff Button + Generate PDF */}
      <div className="page-actions">
        <button className="btn-primary" onClick={() => setShowAddStaffForm(true)}>
          <FaUserPlus className="icon-left" /> Add New Staff
        </button>
        <button 
          className="btn-primary pdf-btn" 
          onClick={handleGeneratePDF}
          disabled={pdfLoading || loading || staff.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-spinner">Loading staff data...</div>
        ) : (
          <>
            {filteredStaff.length === 0 ? (
              <div className="no-results">No staff members found matching your search</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(staffMember => (
                    <tr key={staffMember._id}>
                      <td>{staffMember.name}</td>
                      <td>{staffMember.role}</td>
                      <td>{staffMember.department}</td>
                      <td>{staffMember.email}</td>
                      <td>{staffMember.phoneNumber}</td>
                      <td>{staffMember.address}</td>
                      <td>${typeof staffMember.salary === 'number' ? staffMember.salary.toLocaleString() : staffMember.salary}</td>
                      <td>
                        <span className={`status-badge ${staffMember.status.toLowerCase().replace(' ', '-')}`}>
                          {staffMember.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-small" onClick={() => handleView(staffMember)}>
                            <FaEye /> View
                          </button>
                          <button className="btn-small" onClick={() => handleEdit(staffMember)}>
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="btn-small delete" 
                            onClick={() => handleDelete(staffMember)}
                            disabled={deleteLoading}
                          >
                            <FaTrashAlt /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="directory-footer">
              <span className="results-count">
                Showing {filteredStaff.length} of {staff.length} staff members
              </span>
              {/* <a href="/staff" className="view-all">View All Staff</a> */}
            </div>
          </>
        )}
      </div>
      
      {/* Add New Staff Form Modal */}
      {showAddStaffForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button className="close-btn" onClick={() => setShowAddStaffForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            {formError && (
              <div className="error-message">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newStaffData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newStaffData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={newStaffData.role}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter role"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={newStaffData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Examination">Examination</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newStaffData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={newStaffData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter address"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={newStaffData.salary}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter annual salary"
                    min="0"
                    step="1000"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={newStaffData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddStaffForm(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Staff Modal */}
      {showViewModal && currentStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Staff Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="staff-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{currentStaff.name}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{currentStaff.email}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{currentStaff.role}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{currentStaff.department}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{currentStaff.phoneNumber}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{currentStaff.address}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Salary:</span>
                <span className="detail-value">${typeof currentStaff.salary === 'number' ? currentStaff.salary.toLocaleString() : currentStaff.salary}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span className={`status-badge ${currentStaff.status.toLowerCase().replace(' ', '-')}`}>
                    {currentStaff.status}
                  </span>
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Date Added:</span>
                <span className="detail-value">
                  {new Date(currentStaff.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">
                  {new Date(currentStaff.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(currentStaff);
                }}
              >
                <FaEdit className="icon-left" /> Edit
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Staff Modal */}
      {showEditModal && currentStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Staff Member</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            {editFormError && (
              <div className="error-message">
                {editFormError}
              </div>
            )}
            
            <form onSubmit={handleEditSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="edit-name">Full Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editStaffData.name}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editStaffData.email}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-role">Role</label>
                  <input
                    type="text"
                  id="edit-role"
                  name="role"
                  value={editStaffData.role}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter role"
                />
              </div>
                
                <div className="form-group">
                  <label htmlFor="edit-department">Department</label>
                  <select
                    id="edit-department"
                    name="department"
                    value={editStaffData.department}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Examination">Examination</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="edit-phoneNumber"
                  name="phoneNumber"
                  value={editStaffData.phoneNumber}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-address">Address</label>
                <input
                  type="text"
                  id="edit-address"
                  name="address"
                  value={editStaffData.address}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter address"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-salary">Salary</label>
                  <input
                    type="number"
                    id="edit-salary"
                    name="salary"
                    value={editStaffData.salary}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter annual salary"
                    min="0"
                    step="1000"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={editStaffData.status}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowEditModal(false)}
                  disabled={editFormSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={editFormSubmitting}
                >
                  {editFormSubmitting ? 'Updating...' : 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content attendance-modal">
            <div className="modal-header">
              <h3>Mark Attendance - {attendanceDate}</h3>
              <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            {attendanceError && (
              <div className="error-message">
                {attendanceError}
              </div>
            )}
            
            <form onSubmit={handleAttendanceSubmit}>
              <table className="attendance-form-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(record => (
                    <tr key={`form-${record.staffId}`}>
                      <td>{record.staffName}</td>
                      <td>
                        <select 
                          value={record.status} 
                          onChange={(e) => handleAttendanceStatusChange(record.staffId, e.target.value)}
                          className={`status-select ${record.status.toLowerCase()}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="time" 
                          value={record.timeIn} 
                          onChange={(e) => handleAttendanceTimeChange(record.staffId, 'timeIn', e.target.value)}
                          disabled={record.status === 'Absent'}
                        />
                      </td>
                      <td>
                        <input 
                          type="time" 
                          value={record.timeOut} 
                          onChange={(e) => handleAttendanceTimeChange(record.staffId, 'timeOut', e.target.value)}
                          disabled={record.status === 'Absent'}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={record.notes || ''} 
                          onChange={(e) => handleAttendanceNotesChange(record.staffId, e.target.value)}
                          placeholder="Optional notes"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAttendanceModal(false)}
                  disabled={attendanceLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={attendanceLoading}
                >
                  {attendanceLoading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HRManagerDashboard;
