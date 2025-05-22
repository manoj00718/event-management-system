import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, getUnreadCount } from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('system');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data } = await getProfile();
        setUser(data);
        setTheme(data.preferences?.displayMode || 'system');
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await getUnreadCount();
        setUnreadNotifications(data.count);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute(
      'data-theme',
      theme === 'system' ? systemTheme : theme
    );
  }, [theme]);

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const updateUnreadCount = (count) => {
    setUnreadNotifications(count);
  };

  const value = {
    user,
    updateUser,
    theme,
    updateTheme,
    unreadNotifications,
    updateUnreadCount,
    loading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 