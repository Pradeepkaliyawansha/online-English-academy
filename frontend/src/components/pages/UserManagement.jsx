import { useState, useEffect, useContext } from 'react';
import Header from '../shared/Header';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { FaSearch, FaChevronLeft, FaChevronRight, FaUserPlus, FaFilePdf } from 'react-icons/fa';
import { exportToPDF } from '../../utils/exportUtils';

const UserManagement = () => {
  const { currentUser } = useContext(AuthContext);
  // State variables for user management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Display more users per page
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  console.log("UserManagement component rendered", { currentUser });
  
  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers();
  }, []);
  
  // Function to fetch users from the API
  const fetchUsers = async () => {
    console.log("Fetching users...");
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5555/api/auth/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log("Users fetched successfully:", response.data);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
      
      // For development/demo purposes, populate with sample data
      setUsers([
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Student', createdAt: new Date().toISOString() },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Lecturer', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '3', name: 'Tom Wilson', email: 'tom@example.com', role: 'HR Manager', createdAt: new Date(Date.now() - 172800000).toISOString() },
        { _id: '4', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Student', createdAt: new Date(Date.now() - 259200000).toISOString() },
        { _id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'Student', createdAt: new Date(Date.now() - 345600000).toISOString() },
        { _id: '6', name: 'Emily Davis', email: 'emily@example.com', role: 'Lecturer', createdAt: new Date(Date.now() - 432000000).toISOString() },
        { _id: '7', name: 'Alex Turner', email: 'alex@example.com', role: 'Exam Manager', createdAt: new Date(Date.now() - 518400000).toISOString() },
        { _id: '8', name: 'Lisa Anderson', email: 'lisa@example.com', role: 'Finance Manager', createdAt: new Date(Date.now() - 604800000).toISOString() },
        { _id: '9', name: 'David Miller', email: 'david@example.com', role: 'Student', createdAt: new Date(Date.now() - 691200000).toISOString() },
        { _id: '10', name: 'Rachel Green', email: 'rachel@example.com', role: 'Student', createdAt: new Date(Date.now() - 777600000).toISOString() },
        { _id: '11', name: 'Robert Johnson', email: 'robert@example.com', role: 'Lecturer', createdAt: new Date(Date.now() - 864000000).toISOString() },
        { _id: '12', name: 'Emma Wilson', email: 'emma@example.com', role: 'Student', createdAt: new Date(Date.now() - 950400000).toISOString() },
      ]);
    }
  };
  
  // Function to delete a user
  const handleDeleteUser = async (userId) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5555/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Update the users list after successful deletion
      setUsers(users.filter(user => user._id !== userId));
      // Show success message (you could use a toast notification library here)
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      // Handle specific error cases
      if (err.response?.status === 400 && err.response.data.message === 'You cannot delete your own account') {
        alert("You cannot delete your own account");
      } else {
        alert(err.response?.data?.message || 'Failed to delete user. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Format date function for readable display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Convert milliseconds to days
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };
  
  // Search functionality
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Page navigation
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Function to generate and download PDF report
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      // Determine which users to export
      const dataToExport = searchTerm ? filteredUsers : users;
      
      // Export only relevant fields
      const cleanData = dataToExport.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }));
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `user_report_${date}`;
      
      // Generate and download the PDF
      exportToPDF(
        cleanData, 
        filename, 
        ['name', 'email', 'role', 'createdAt'],
        'User Management Report'
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
      <Header title="User Management" />
      
      <div className="page-actions">
        <button 
          className="btn-primary" 
          onClick={handleGeneratePDF}
          disabled={pdfLoading || loading || users.length === 0}
        >
          <FaFilePdf className="icon-left" />
          {pdfLoading ? 'Generating...' : 'Generate PDF'}
        </button>
        <button className="btn-primary">
          <FaUserPlus className="icon-left" />
          Add New User
        </button>
      </div>
      
      <div className="dashboard-card user-management-card">
        <div className="card-header-with-actions">
          <h3>All Users ({users.length})</h3>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-spinner">Loading users...</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>{user.role}</span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-small danger" 
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deleteLoading || currentUser.id === user._id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <FaChevronLeft />
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UserManagement;
