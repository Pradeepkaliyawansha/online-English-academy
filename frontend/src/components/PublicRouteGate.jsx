import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// This component automatically logs out users who try to access public routes while logged in
const PublicRouteGate = ({ children }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handlePublicRouteAccess = async () => {
      if (currentUser) {
        // User is logged in but accessing a public route
        await logout();
        // Reload the page to ensure all state is cleared
        window.location.reload();
      }
    };
    
    handlePublicRouteAccess();
  }, [currentUser, logout]);
  
  // Render the children (public route content)
  return children;
};

export default PublicRouteGate;
