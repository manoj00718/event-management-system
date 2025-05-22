import React from 'react';
import { Navigate } from 'react-router-dom';
import CreateEventForm from '../components/CreateEventForm';
import { useAuth } from '../context/AuthContext';

const CreateEvent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect if not authenticated or not an organizer
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <CreateEventForm />
      </div>
    </div>
  );
};

export default CreateEvent; 