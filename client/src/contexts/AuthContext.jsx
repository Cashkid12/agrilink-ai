import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem('adminToken');
      console.log('🔄 Auth check - Token in storage:', !!savedToken);
      
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log('✅ Auto-login successful:', response.data.user.username);
        } catch (error) {
          console.error('❌ Auto-login failed:', error.message);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('🚨 Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Login attempt started for:', email);
      console.log('📱 Device type:', /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
      
      const response = await authAPI.login({ email, password });
      console.log('📨 Login API response:', response);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        console.log('✅ Login successful, saving token...');
        
        // Save to localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('🎉 Login completed for user:', user.username);
        return { success: true, user };
      } else {
        console.error('❌ Login failed - API returned false:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('💥 Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        console.log('🔧 Server error details:', error.response.data);
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Network error. Please check your internet connection.';
        console.log('🌐 Network error - no response received');
      } else {
        // Other errors
        console.log('⚡ Other error:', error.message);
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
