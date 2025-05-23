import React from 'react';
import { useAuth } from '../context/AuthContext';
import OrganizerDashboard from './dashboards/OrganizerDashboard';
import AttendeeDashboard from './dashboards/AttendeeDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Render different dashboards based on user role
  if (user.role === 'organizer') {
    return <OrganizerDashboard />;
  } else if (user.role === 'admin') {
    return <AdminDashboard />;
  } else {
    // Default to attendee dashboard for 'user' role
    return <AttendeeDashboard />;
  }
};

export default Dashboard; 