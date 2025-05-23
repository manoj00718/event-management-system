import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await api.auth.me();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.auth.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.auth.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Registration successful! Welcome to EventHub.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out.');
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await api.auth.updateProfile(userData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed.';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Mock function to simulate auth for development
  const devLogin = (role) => {
    const mockUsers = {
      admin: {
        _id: 'admin-user-id',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        profileImage: {
          url: 'https://randomuser.me/api/portraits/men/1.jpg'
        }
      },
      organizer: {
        _id: 'organizer-user-id',
        name: 'Event Organizer',
        email: 'organizer@example.com',
        role: 'organizer',
        profileImage: {
          url: 'https://randomuser.me/api/portraits/women/2.jpg'
        }
      },
      user: {
        _id: 'regular-user-id',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        profileImage: {
          url: 'https://randomuser.me/api/portraits/men/3.jpg'
        }
      }
    };
    
    const selectedUser = mockUsers[role] || mockUsers.user;
    setUser(selectedUser);
    setIsAuthenticated(true);
    localStorage.setItem('token', 'mock-token-for-development');
    toast.success(`Logged in as ${selectedUser.name} (${selectedUser.role})`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        devLogin, // Only for development
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 