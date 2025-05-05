import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaServer, FaCreditCard, FaLock } from 'react-icons/fa';
import Header from '../shared/Header';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5555/api';

const CoursePaymentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const courseData = location.state?.courseData;
  const returnPath = location.state?.returnTo || '/student-dashboard';
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [validation, setValidation] = useState({
    cardName: { isValid: true, message: '' },
    cardNumber: { isValid: true, message: '' },
    expiryDate: { isValid: true, message: '' },
    cvv: { isValid: true, message: '' },
    formValid: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [course, setCourse] = useState(courseData || null);
  
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    checking: true
  });

  useEffect(() => {
    if (!courseData) {
      fetchCourseDetails();
    }
    checkServerConnection();
  }, [id, courseData]);

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

  const fetchCourseDetails = async () => {
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        setError('Cannot connect to server. Please check your connection and try again.');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again later.');
    }
  };

  const validateCardName = (name) => {
    if (!name || name.trim() === '') {
      return { isValid: false, message: 'Card name is required' };
    }
    
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Card name should contain only letters and spaces' };
    }
    
    return { isValid: true, message: '' };
  };

  const validateCardNumber = (number) => {
    if (!number || number.trim() === '') {
      return { isValid: false, message: 'Card number is required' };
    }
    
    const digitsOnly = number.replace(/\s/g, '');
    if (digitsOnly.length !== 16 || !/^\d+$/.test(digitsOnly)) {
      return { isValid: false, message: 'Card number must be 16 digits' };
    }
    
    return { isValid: true, message: '' };
  };

  const validateExpiryDate = (date) => {
    if (!date || date.trim() === '') {
      return { isValid: false, message: 'Expiry date is required' };
    }
    
    const dateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!dateRegex.test(date)) {
      return { isValid: false, message: 'Use format MM/YY (e.g. 05/25)' };
    }
    
    const [month, year] = date.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
    const today = new Date();
    
    if (expiryDate < today) {
      return { isValid: false, message: 'Card has expired' };
    }
    
    return { isValid: true, message: '' };
  };

  const validateCVV = (cvv) => {
    if (!cvv || cvv.trim() === '') {
      return { isValid: false, message: 'CVV is required' };
    }
    
    if (!/^\d{3}$/.test(cvv)) {
      return { isValid: false, message: 'CVV must be exactly 3 digits' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For card name, replace any non-letter characters
    if (name === 'cardName') {
      const lettersOnly = value.replace(/[^A-Za-z\s]/g, '');
      setPaymentInfo({
        ...paymentInfo,
        [name]: lettersOnly
      });
    } else if (name === 'cvv') {
      // For CVV, allow only digits and limit to 3
      const digitsOnly = value.replace(/\D/g, '').substring(0, 3);
      setPaymentInfo({
        ...paymentInfo,
        [name]: digitsOnly
      });
    } else {
      setPaymentInfo({
        ...paymentInfo,
        [name]: value
      });
    }
    
    let validationResult;
    switch (name) {
      case 'cardName':
        validationResult = validateCardName(name === 'cardName' ? value.replace(/[^A-Za-z\s]/g, '') : value);
        break;
      case 'expiryDate':
        validationResult = validateExpiryDate(value);
        break;
      case 'cvv':
        validationResult = validateCVV(name === 'cvv' ? value.replace(/\D/g, '').substring(0, 3) : value);
        break;
      default:
        validationResult = { isValid: true, message: '' };
    }
    
    setValidation({
      ...validation,
      [name]: validationResult
    });
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const formattedValue = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formattedValue;
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setPaymentInfo({
      ...paymentInfo,
      cardNumber: formattedValue.substring(0, 19)
    });
    
    const validationResult = validateCardNumber(formattedValue);
    setValidation({
      ...validation,
      cardNumber: validationResult
    });
  };

  const handleExpiryDateChange = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    
    setPaymentInfo({
      ...paymentInfo,
      expiryDate: value
    });
    
    const validationResult = validateExpiryDate(value);
    setValidation({
      ...validation,
      expiryDate: validationResult
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cardNameValidation = validateCardName(paymentInfo.cardName);
    const cardNumberValidation = validateCardNumber(paymentInfo.cardNumber);
    const expiryDateValidation = validateExpiryDate(paymentInfo.expiryDate);
    const cvvValidation = validateCVV(paymentInfo.cvv);
    
    const updatedValidation = {
      cardName: cardNameValidation,
      cardNumber: cardNumberValidation,
      expiryDate: expiryDateValidation,
      cvv: cvvValidation,
      formValid: cardNameValidation.isValid && 
                 cardNumberValidation.isValid && 
                 expiryDateValidation.isValid && 
                 cvvValidation.isValid
    };
    
    setValidation(updatedValidation);
    
    if (!updatedValidation.formValid) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const isConnected = await checkServerConnection();
      
      if (!isConnected) {
        setTimeout(() => {
          setSuccess(true);
          setLoading(false);
        }, 1500);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      try {
        const enrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');
        enrollments.push({
          courseId: id,
          courseName: course?.name,
          enrolledAt: new Date().toISOString(),
          price: course?.price
        });
        localStorage.setItem('courseEnrollments', JSON.stringify(enrollments));
      } catch (storageErr) {
        console.warn('Could not store enrollment in localStorage', storageErr);
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Header title="Course Payment" />
      
      {!serverStatus.checking && !serverStatus.connected && (
        <div className="server-status disconnected">
          <FaServer /> Server Offline - Working in Demo Mode
        </div>
      )}
      
      <div className="back-link">
        <button className="btn-back" onClick={goBack}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
      
      <div className="payment-container">
        {success ? (
          <div className="payment-success-card">
            <FaCheckCircle className="success-icon" />
            <h2>Payment Successful!</h2>
            <p>You have been successfully enrolled in the course.</p>
            <div className="course-details-summary">
              <p><strong>Course:</strong> {course?.name}</p>
              <p><strong>Amount Paid:</strong> {course?.price}</p>
            </div>
            <button className="btn-primary" onClick={goToDashboard}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="payment-form-container">
            {!course ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>Loading course details...</p>
              </div>
            ) : (
              <>
                <div className="course-summary">
                  <h2>Purchase Summary</h2>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Course:</span>
                      <span>{course.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Instructor:</span>
                      <span>{course.lecturer}</span>
                    </div>
                    <div className="summary-row">
                      <span>Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{course.price}</span>
                    </div>
                  </div>
                </div>
                
                <div className="payment-form-section">
                  <div className="section-header">
                    <h2><FaCreditCard className="icon-left" /> Payment Details</h2>
                    <div className="secure-badge">
                      <FaLock /> Secure Payment
                    </div>
                  </div>
                  
                  {error && (
                    <div className="error-message">
                      <FaExclamationCircle /> {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                      <label htmlFor="cardName">Name on Card</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter name as shown on card"
                        className={!validation.cardName.isValid ? 'input-error' : ''}
                      />
                      {!validation.cardName.isValid && (
                        <p className="error-text">{validation.cardName.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handleCardNumberChange}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={!validation.cardNumber.isValid ? 'input-error' : ''}
                      />
                      {!validation.cardNumber.isValid && (
                        <p className="error-text">{validation.cardNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={handleExpiryDateChange}
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          className={!validation.expiryDate.isValid ? 'input-error' : ''}
                        />
                        {!validation.expiryDate.isValid && (
                          <p className="error-text">{validation.expiryDate.message}</p>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handleInputChange}
                          required
                          placeholder="123"
                          maxLength="3"
                          className={!validation.cvv.isValid ? 'input-error' : ''}
                        />
                        {!validation.cvv.isValid && (
                          <p className="error-text">{validation.cvv.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn-purchase" 
                      style={{ backgroundColor: '#4CAF50', color: 'white' }}
                      disabled={loading || !validation.formValid}
                    >
                      {loading ? 'Processing...' : `Pay ${course.price} & Enroll`}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CoursePaymentPage;
