import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth status, token:', token ? 'exists' : 'not found');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set token in apiService
      apiService.setAuthToken(token);
      
      // Verify token and get user data
      console.log('Verifying token with API...');
      const response = await apiService.getProfile();
      console.log('Profile response:', response);
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      apiService.clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await apiService.login(email, password);
      console.log('Login response:', response);
      
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      apiService.setAuthToken(token);
      setUser(user);
      
      console.log('Login successful, user set:', user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiService.register(name, email, password);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      apiService.setAuthToken(token);
      setUser(user);
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiService.clearAuthToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};