import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoadingScreen from './shared/LoadingScreen';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser, loading, authInitialized } = useContext(AuthContext);

  console.log('Protected Route Check:', { 
    currentUser, 
    allowedRoles, 
    loading, 
    authInitialized 
  });

  // Show loading indicator while initializing auth
  if (loading || !authInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role if roles are specified
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If we have children, return them directly, otherwise use Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
