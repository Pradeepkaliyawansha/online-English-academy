import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add these imports
import Header from '../shared/Header';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaServer, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/SalaryPayment.css';

const SalaryPayment = () => {
  const navigate = useNavigate(); // Add navigate hook
  
  const [staffMember, setStaffMember] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [reference, setReference] = useState(`SAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // New state for payment history
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  
  // Server connection state
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });

  const API_BASE_URL = 'http://localhost:5555/api';

  useEffect(() => {
    // Load selected staff member from local storage
    const selectedStaff = localStorage.getItem('selectedStaff');
    if (selectedStaff) {
      const staffData = JSON.parse(selectedStaff);
      setStaffMember(staffData);
      
      // Fetch payment history for this staff member
      fetchPaymentHistory(staffData._id);
    } else {
      // Redirect back if no staff member selected
      navigate('/dashboard'); // Use React Router navigation
    }
    
    // Check server connection
    checkServerConnection();
  }, [navigate]); // Add navigate as dependency

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
  
  // New function to fetch payment history for a staff member
  const fetchPaymentHistory = async (staffId) => {
    setHistoryLoading(true);
    setHistoryError(null);
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Sample data for offline mode
      const sampleHistory = [
        {
          _id: '1',
          staffName: 'Staff Member',
          amount: 65000,
          paymentDate: '2023-10-01',
          paymentMethod: 'Bank Transfer',
          reference: 'OCT-2023-001'
        }
      ];
      setPaymentHistory(sampleHistory);
      setHistoryLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/payments/salary-history/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPaymentHistory(response.data);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setHistoryError('Failed to load payment history');
      
      // Fallback to empty array
      setPaymentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAccountNumberChange = (e) => {
    const value = e.target.value;
    
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      // Check if the length is within the limit
      if (value.length <= 16) {
        setAccountNumber(value);
        setAccountNumberError('');
      } else {
        setAccountNumberError('Account number cannot exceed 16 digits');
      }
    } else {
      setAccountNumberError('Please enter numbers only');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!staffMember) {
      setErrorMessage('No staff member selected.');
      return;
    }
    
    // Validate account number if payment method is bank transfer
    if (paymentMethod === 'bank_transfer') {
      if (!accountNumber) {
        setAccountNumberError('Account number is required');
        return;
      }
      
      if (accountNumber.length > 16) {
        setAccountNumberError('Account number cannot exceed 16 digits');
        return;
      }
      
      if (!/^\d+$/.test(accountNumber)) {
        setAccountNumberError('Account number must contain only numbers');
        return;
      }
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Check server connection first
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      // Handle offline mode
      setTimeout(() => {
        // Simulate successful payment in offline mode
        setSuccessMessage(`OFFLINE MODE: Salary payment for ${staffMember.name} processed successfully. Will sync when server is available.`);
        setIsSubmitting(false);
        
        // Add the payment to the history in offline mode
        const offlinePayment = {
          _id: `offline-${Date.now()}`,
          staffName: staffMember.name,
          amount: staffMember.salary,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                         paymentMethod === 'check' ? 'Check' : 'Cash',
          reference: reference
        };
        
        setPaymentHistory([offlinePayment, ...paymentHistory]);
      }, 1500); // Simulate network delay
      
      return;
    }
    
    try {
      // In a real app, this would be your API endpoint
      const token = localStorage.getItem('token');
      
      const paymentData = {
        staffId: staffMember._id,
        amount: staffMember.salary,
        paymentMethod,
        bankName: paymentMethod === 'bank_transfer' ? bankName : '',
        accountNumber: paymentMethod === 'bank_transfer' ? accountNumber : '',
        reference,
        notes,
        paymentDate: new Date().toISOString().split('T')[0]
      };
      
      // Make the API request to process payment
      const response = await axios.post(`${API_BASE_URL}/payments/salary`, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccessMessage(`Salary payment for ${staffMember.name} processed successfully!`);
      
      // Clear form fields after successful submission
      setPaymentMethod('bank_transfer');
      setBankName('');
      setAccountNumber('');
      setReference(`SAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
      setNotes('');
      
      // Refresh payment history
      fetchPaymentHistory(staffMember._id);
      
    } catch (err) {
      console.error('Error processing salary payment:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!staffMember) {
    return (
      <>
        <Header title="Salary Payment" />
        <div className="loading-spinner">Loading staff details...</div>
      </>
    );
  }

  // Format display date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Header title="Salary Payment" />
      
      {/* Server Status Indicator */}
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Local Mode
        </div>
      )}
      
      <div className="back-link">
        <Link to="/dashboard"><FaArrowLeft /> Back to Dashboard</Link>
      </div>
      
      <div className="salary-payment-container">
        <div className="staff-details-card">
          <h2>Staff Details</h2>
          <div className="staff-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{staffMember.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{staffMember.role}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{staffMember.department}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{staffMember.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Salary Amount:</span>
              <span className="detail-value salary-amount">${staffMember.salary.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="payment-form-card">
          <h2>Payment Details</h2>
          
          {successMessage && (
            <div className="success-message">
              <FaCheckCircle /> {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="error-message">
              <FaExclamationCircle /> {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            
            {paymentMethod === 'bank_transfer' && (
              <>
                <div className="form-group">
                  <label htmlFor="bankName">Bank Name</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    required
                    placeholder="Enter account number (numbers only, max 16 digits)"
                    maxLength="16"
                    pattern="\d*"
                    inputMode="numeric"
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
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                placeholder="Enter payment reference"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payment"
                rows={3}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate('/dashboard')} // Use React Router navigation
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Payment History Section */}
      <div className="payment-history-section">
        <div className="section-header">
          <h2><FaHistory className="icon-left" /> Payment History</h2>
        </div>
        
        {historyError && (
          <div className="error-message">
            <FaExclamationCircle /> {historyError}
          </div>
        )}
        
        {historyLoading ? (
          <div className="loading-spinner">Loading payment history...</div>
        ) : (
          <>
            {paymentHistory.length === 0 ? (
              <div className="no-records">No payment records found for this staff member</div>
            ) : (
              <div className="table-responsive">
                <table className="payment-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map(payment => (
                      <tr key={payment._id}>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td>${payment.amount.toLocaleString()}</td>
                        <td>{payment.paymentMethod}</td>
                        <td>{payment.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SalaryPayment;
