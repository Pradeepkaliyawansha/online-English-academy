import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import HomePage from './pages/public/HomePage';

// This component redirects logged-in users to dashboard from the home page
const HomeRedirect = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  // Wait until auth state is loaded before deciding
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise show the home page
  return <HomePage />;
};

export default HomeRedirect;
