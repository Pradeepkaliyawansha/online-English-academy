import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/Header';
import { FaMoneyBillWave, FaFileInvoiceDollar, FaChartLine, FaExclamationCircle, 
         FaSearch, FaFileDownload, FaFilePdf, FaUsers, FaServer, FaUserTie,
         FaEdit, FaTrashAlt, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const FinanceManagerDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    pendingPayments: 0,
    totalInvoices: 0,
    overdueInvoices: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });

  const API_BASE_URL = 'http://localhost:5555/api';

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
  
  useEffect(() => {
    setStats({
      monthlyRevenue: 38500,
      pendingPayments: 12800,
      totalInvoices: 156,
      overdueInvoices: 23
    });
    
    setRecentTransactions([
      { id: 1, type: 'Payment', from: 'John Smith', amount: 750, date: '2023-11-28', status: 'Completed' },
      { id: 2, type: 'Invoice', to: 'Sarah Johnson', amount: 1200, date: '2023-11-27', status: 'Sent' },
      { id: 3, type: 'Payment', from: 'Academic Department', amount: 2500, date: '2023-11-25', status: 'Completed' },
      { id: 4, type: 'Invoice', to: 'Michael Brown', amount: 950, date: '2023-11-22', status: 'Overdue' }
    ]);
    
    checkServerConnection();
    fetchStaff();
    fetchPaymentHistory();
    
    const serverCheckInterval = setInterval(() => {
      if (!serverStatus.connected) {
        checkServerConnection();
      }
    }, 60000);
    
    return () => clearInterval(serverCheckInterval);
  }, []);
  
  const fetchStaff = async () => {
    setStaffLoading(true);
    setStaffError(null);
    
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      const sampleStaff = [
        { 
          _id: '1', 
          name: 'Emily Parker', 
          role: 'English Lecturer', 
          department: 'Academic', 
          email: 'emily.parker@example.com', 
          phoneNumber: '(555) 123-4567', 
          salary: 65000, 
          status: 'Active' 
        },
        { 
          _id: '2', 
          name: 'John Miller', 
          role: 'IELTS Trainer', 
          department: 'Academic', 
          email: 'john.miller@example.com', 
          phoneNumber: '(555) 234-5678', 
          salary: 72000, 
          status: 'Active' 
        },
        { 
          _id: '3', 
          name: 'Sarah Wilson', 
          role: 'HR Assistant', 
          department: 'HR', 
          email: 'sarah.wilson@example.com', 
          phoneNumber: '(555) 345-6789', 
          salary: 55000, 
          status: 'Active' 
        }
      ];
      
      setStaff(sampleStaff);
      setStaffLoading(false);
      setStaffError('Server is offline. Displaying sample data.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStaff(response.data);
      
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setStaffError('Failed to load staff data. Please try again later.');
      
      const sampleStaff = [
        { 
          _id: '1', 
          name: 'Emily Parker', 
          role: 'English Lecturer', 
          department: 'Academic', 
          email: 'emily.parker@example.com', 
          phoneNumber: '(555) 123-4567', 
          salary: 65000, 
          status: 'Active' 
        },
        { 
          _id: '2', 
          name: 'John Miller', 
          role: 'IELTS Trainer', 
          department: 'Academic', 
          email: 'john.miller@example.com', 
          phoneNumber: '(555) 234-5678', 
          salary: 72000, 
          status: 'Active' 
        }
      ];
      
      setStaff(sampleStaff);
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    setPaymentHistoryLoading(true);
    
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      const samplePaymentHistory = [
        { 
          _id: '1', 
          staffId: '1',
          staffName: 'Emily Parker', 
          role: 'English Lecturer', 
          department: 'Academic', 
          amount: 65000, 
          paymentDate: '2023-11-01',
          paymentMethod: 'Bank Transfer',
          reference: 'NOV-2023-001'
        },
        { 
          _id: '2', 
          staffId: '2',
          staffName: 'John Miller', 
          role: 'IELTS Trainer', 
          department: 'Academic', 
          amount: 72000,
          paymentDate: '2023-11-01',
          paymentMethod: 'Bank Transfer',
          reference: 'NOV-2023-002'
        }
      ];
      
      setPaymentHistory(samplePaymentHistory);
      setPaymentHistoryLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/payments/salary-history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPaymentHistory(response.data);
      
    } catch (err) {
      console.error('Error fetching payment history:', err);
      
      const samplePaymentHistory = [
        { 
          _id: '1', 
          staffId: '1',
          staffName: 'Emily Parker', 
          role: 'English Lecturer', 
          department: 'Academic', 
          amount: 65000, 
          paymentDate: '2023-11-01',
          paymentMethod: 'Bank Transfer',
          reference: 'NOV-2023-001'
        }
      ];
      
      setPaymentHistory(samplePaymentHistory);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  const handleSalaryPayment = (staffMember) => {
    localStorage.setItem('selectedStaff', JSON.stringify(staffMember));
    navigate('/dashboard/salary-payment');
  };

  const handleGenerateReport = async () => {
    setExportLoading(true);
    try {
      const dataToExport = paymentSearchTerm ? filteredPaymentHistory : paymentHistory;
      
      const cleanData = dataToExport.map(payment => ({
        staffName: payment.staffName,
        role: payment.role,
        department: payment.department,
        amount: `$${payment.amount.toLocaleString()}`,
        paymentDate: payment.paymentDate,
        reference: payment.reference
      }));
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `salary_payments_report_${date}`;
      
      exportToCSV(cleanData, filename, ['staffName', 'role', 'department', 'amount', 'paymentDate', 'reference']);
      
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const dataToExport = paymentSearchTerm ? filteredPaymentHistory : paymentHistory;
      
      const cleanData = dataToExport.map(payment => ({
        staffName: payment.staffName,
        role: payment.role,
        department: payment.department,
        amount: `$${payment.amount.toLocaleString()}`,
        paymentDate: payment.paymentDate,
        reference: payment.reference
      }));
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `salary_payments_report_${date}`;
      
      exportToPDF(
        cleanData,
        filename,
        ['staffName', 'role', 'department', 'amount', 'paymentDate', 'reference'],
        'Salary Payments Report'
      );
      
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const filteredStaff = staff.filter(staffMember => {
    const searchTermLower = staffSearchTerm.toLowerCase();
    return (
      staffMember.name.toLowerCase().includes(searchTermLower) ||
      staffMember.role.toLowerCase().includes(searchTermLower) ||
      staffMember.department.toLowerCase().includes(searchTermLower) ||
      staffMember.email.toLowerCase().includes(searchTermLower)
    );
  });

  const filteredPaymentHistory = paymentHistory.filter(payment => {
    const searchTermLower = paymentSearchTerm.toLowerCase();
    return (
      payment.staffName.toLowerCase().includes(searchTermLower) ||
      payment.role.toLowerCase().includes(searchTermLower) ||
      payment.department.toLowerCase().includes(searchTermLower) ||
      payment.reference.toLowerCase().includes(searchTermLower) ||
      payment.paymentDate.toLowerCase().includes(searchTermLower)
    );
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    paymentDate: '',
    paymentMethod: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    reference: '',
    notes: ''
  });
  const [accountNumberError, setAccountNumberError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEditClick = (payment) => {
    setCurrentPayment(payment);
    setEditFormData({
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod.toLowerCase().replace(' ', '_'),
      bankName: payment.bankName || '',
      accountNumber: payment.accountNumber || '',
      reference: payment.reference,
      notes: payment.notes || ''
    });
    setShowEditModal(true);
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  const handleAccountNumberChange = (e) => {
    const value = e.target.value;
    
    if (value === '' || /^\d+$/.test(value)) {
      if (value.length <= 16) {
        setEditFormData({
          ...editFormData,
          accountNumber: value
        });
        setAccountNumberError('');
      } else {
        setAccountNumberError('Account number cannot exceed 16 digits');
      }
    } else {
      setAccountNumberError('Please enter numbers only');
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setEditFormError('');
    
    if (editFormData.paymentMethod === 'bank_transfer') {
      if (!editFormData.accountNumber) {
        setAccountNumberError('Account number is required');
        setFormSubmitting(false);
        return;
      }
      
      if (editFormData.accountNumber.length > 16) {
        setAccountNumberError('Account number cannot exceed 16 digits');
        setFormSubmitting(false);
        return;
      }
      
      if (!/^\d+$/.test(editFormData.accountNumber)) {
        setAccountNumberError('Account number must contain only numbers');
        setFormSubmitting(false);
        return;
      }
    }
    
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      setTimeout(() => {
        const updatedPaymentHistory = paymentHistory.map(payment => 
          payment._id === currentPayment._id 
            ? { 
                ...payment, 
                amount: Number(editFormData.amount),
                paymentDate: editFormData.paymentDate,
                paymentMethod: editFormData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                              editFormData.paymentMethod === 'check' ? 'Check' : 'Cash',
                bankName: editFormData.paymentMethod === 'bank_transfer' ? editFormData.bankName : undefined,
                accountNumber: editFormData.paymentMethod === 'bank_transfer' ? editFormData.accountNumber : undefined,
                reference: editFormData.reference,
                notes: editFormData.notes
              } 
            : payment
        );
        
        setPaymentHistory(updatedPaymentHistory);
        setShowEditModal(false);
        setFormSubmitting(false);
      }, 1000);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/payments/salary/${currentPayment._id}`, 
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const updatedPaymentHistory = paymentHistory.map(payment => 
        payment._id === currentPayment._id ? response.data.payment : payment
      );
      
      setPaymentHistory(updatedPaymentHistory);
      setShowEditModal(false);
      
    } catch (err) {
      console.error('Error updating payment:', err);
      setEditFormError(err.response?.data?.message || 'Failed to update payment. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    
    setDeleteLoading(true);
    
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      setTimeout(() => {
        const updatedPaymentHistory = paymentHistory.filter(
          payment => payment._id !== paymentToDelete._id
        );
        
        setPaymentHistory(updatedPaymentHistory);
        setShowDeleteConfirm(false);
        setPaymentToDelete(null);
        setDeleteLoading(false);
      }, 1000);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/payments/salary/${paymentToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedPaymentHistory = paymentHistory.filter(
        payment => payment._id !== paymentToDelete._id
      );
      
      setPaymentHistory(updatedPaymentHistory);
      
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert(err.response?.data?.message || 'Failed to delete payment. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setPaymentToDelete(null);
    }
  };

  return (
    <>
      <Header title="Finance Manager Dashboard" />
      
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}
      
      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Staff Members</h3>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {staffError && <div className="error-message">{staffError}</div>}
        
        {staffLoading ? (
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
                      <td>${staffMember.salary.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${staffMember.status.toLowerCase().replace(' ', '-')}`}>
                          {staffMember.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-small salary-payment"
                          onClick={() => handleSalaryPayment(staffMember)}
                        >
                          <FaUserTie className="icon-left" /> Salary Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      <div className="dashboard-card">
        <div className="card-header-with-actions">
          <h3>Salary Payment History</h3>
          <div className="search-actions">
            <button 
              className="btn-small"
              onClick={handleGeneratePDF}
              disabled={pdfLoading || paymentHistoryLoading || paymentHistory.length === 0}
            >
              <FaFilePdf className="icon-left" />
              {pdfLoading ? 'Generating...' : 'PDF'}
            </button>
            <button 
              className="btn-small"
              onClick={handleGenerateReport}
              disabled={exportLoading || paymentHistoryLoading || paymentHistory.length === 0}
            >
              <FaFileDownload className="icon-left" />
              {exportLoading ? 'Generating...' : 'CSV'}
            </button>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search payments..." 
                value={paymentSearchTerm}
                onChange={(e) => setPaymentSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        {paymentHistoryLoading ? (
          <div className="loading-spinner">Loading payment history...</div>
        ) : (
          <>
            {filteredPaymentHistory.length === 0 ? (
              <div className="no-results">No payment records found matching your search</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Payment Method</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentHistory.map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.staffName}</td>
                      <td>{payment.role}</td>
                      <td>{payment.department}</td>
                      <td>${payment.amount.toLocaleString()}</td>
                      <td>{payment.paymentDate}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.reference}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon edit"
                            onClick={() => handleEditClick(payment)}
                            title="Edit payment"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-icon delete"
                            onClick={() => handleDeleteClick(payment)}
                            title="Delete payment"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
      
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Payment</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            {editFormError && (
              <div className="error-message">
                <FaExclamationCircle /> {editFormError}
              </div>
            )}
            
            <form onSubmit={handleEditSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="amount">Payment Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={editFormData.amount}
                  onChange={handleEditFormChange}
                  required
                  min="0"
                  step="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={editFormData.paymentDate}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={editFormData.paymentMethod}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              
              {editFormData.paymentMethod === 'bank_transfer' && (
                <>
                  <div className="form-group">
                    <label htmlFor="bankName">Bank Name</label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={editFormData.bankName}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="accountNumber">Account Number</label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={editFormData.accountNumber}
                      onChange={handleAccountNumberChange}
                      required
                      maxLength="16"
                    />
                    {accountNumberError && (
                      <div className="input-error">{accountNumberError}</div>
                    )}
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label htmlFor="reference">Payment Reference</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={editFormData.reference}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditFormChange}
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="confirm-message">
              <FaExclamationCircle className="warning-icon" />
              <p>
                Are you sure you want to delete this payment record for <strong>{paymentToDelete?.staffName}</strong>?
                <br />
                <small>This action cannot be undone.</small>
              </p>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-delete"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinanceManagerDashboard;
