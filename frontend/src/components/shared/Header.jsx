import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FaBell, FaEnvelope, FaUserCircle } from 'react-icons/fa';

const Header = ({ title }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <header className="dashboard-header">
      <h1>{title}</h1>
      
      <div className="header-actions">
        <div className="notification-icon">
          <FaBell />
          <span className="badge">3</span>
        </div>
        
        <div className="message-icon">
          <FaEnvelope />
          <span className="badge">5</span>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role}</span>
          </div>
          <FaUserCircle className="profile-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
