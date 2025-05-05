import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">
          <FaExclamationTriangle size={60} />
        </div>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <p>Please contact the administrator if you believe this is an error.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
