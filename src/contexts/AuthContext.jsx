import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8080';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      
      // Auto fetch user info when token exists
      const fetchUserInfo = async () => {
        try {
          const userResponse = await axios.get('/api/v1/users/me');
          const userInfo = userResponse.data;
          setUser(userInfo);
        } catch (error) {
          console.error('Failed to fetch user info on refresh:', error);
          // Token might be expired, clean up
          logout();
        }
      };
      
      fetchUserInfo();
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/v1/auth/login', credentials);
      const { access_token, refresh_token } = response.data;
      
      // Store tokens in session storage
      sessionStorage.setItem('access_token', access_token);
      sessionStorage.setItem('refresh_token', refresh_token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user info
      const userResponse = await axios.get('/api/v1/users/me');
      const userInfo = userResponse.data;
      
      setIsAuthenticated(true);
      setUser(userInfo);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh_token = sessionStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/api/v1/auth/refresh-token', {
        refresh_token
      });

      const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data;
      
      // Update tokens
      sessionStorage.setItem('access_token', newAccessToken);
      sessionStorage.setItem('refresh_token', newRefreshToken);
      
      // Update axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    refreshToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};