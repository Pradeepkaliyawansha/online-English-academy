import { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const refreshTimerRef = useRef(null);
  const initialLoadRef = useRef(true);

  // Function to refresh the token
  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const response = await axios.post('http://localhost:5555/api/auth/refresh-token', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { token: newToken, user } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      // Don't clear user on first failed refresh attempt
      if (!initialLoadRef.current) {
        logout();
      }
      return false;
    }
  };
  
  // Setup the refresh timer
  const setupRefreshTimer = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    // Refresh every 25 minutes to ensure token doesn't expire
    // Assuming JWT_EXPIRE is 30 minutes or more
    refreshTimerRef.current = setInterval(async () => {
      await refreshToken();
    }, 25 * 60 * 1000);
  };

  // Initialize auth state from localStorage
  const initializeFromStorage = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCurrentUser(user);
        return true;
      } catch (e) {
        console.error('Error parsing stored user data', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return false;
  };
  
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // First immediately set user from localStorage - don't wait for API
      const hasStoredUser = initializeFromStorage();
      
      // Then try to refresh the token if we have stored credentials
      if (hasStoredUser) {
        try {
          await refreshToken();
          // Set up timer regardless of refresh success (we'll use stored credentials if refresh fails)
          setupRefreshTimer();
        } catch (err) {
          console.error('Error refreshing token during initialization', err);
          // Still continue with stored user even if refresh fails
        }
      }
      
      setLoading(false);
      setAuthInitialized(true);
    };
    
    initialize();
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser) {
        refreshToken();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5555/api/auth/login', { 
        email, 
        password 
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      setError(null);
      
      // Set up the auto-refresh timer
      setupRefreshTimer();
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5555/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      setError(null);
      
      // Set up the auto-refresh timer
      setupRefreshTimer();
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    
    // Clear the refresh timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    authInitialized,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
