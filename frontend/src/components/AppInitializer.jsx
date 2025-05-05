import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AppInitializer = () => {
  const { currentUser, refreshToken } = useContext(AuthContext);

  useEffect(() => {
    // Handle window focus - refresh token when window is focused
    const handleFocus = () => {
      if (currentUser) {
        refreshToken();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser, refreshToken]);

  // Component doesn't render anything
  return null;
};

export default AppInitializer;
