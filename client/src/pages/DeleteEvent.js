import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import '../styles/EventForm.css';
import { safeApiCall } from '../utils/errorHandler';
import ErrorState from '../components/ErrorState';

// Sample event for when backend is not available
const SAMPLE_EVENT = {
  _id: '1',
  title: 'Tech Conference 2024',
  description: 'Annual technology conference featuring the latest innovations',
  date: new Date('2024-06-15T09:00:00Z').toISOString(),
  location: 'Convention Center',
  capacity: 500,
  price: 299.99,
  category: 'conference',
  status: 'upcoming',
  image: {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    alt: 'Tech Conference Hall'
  }
};

const DeleteEvent = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user && user.role === 'user') {
      toast.error('You do not have permission to delete events');
      navigate('/events');
      return;
    }
    
    fetchEvent();
  }, [id, user, navigate]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      
      const { data, isMockData } = await safeApiCall(
        () => api.events.getById(id), 
        { ...SAMPLE_EVENT, _id: id },
        {
          onNetworkError: () => {
            setUseMockData(true);
          }
        }
      );
      
      setEvent(data);
      setUseMockData(isMockData);
      
      if (isMockData) {
        toast.info('Using demo data as the server is not available', {
          toastId: 'mock-data-notice',
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      if (useMockData) {
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await api.events.delete(id);
      }
      
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/events/${id}`);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <LoadingSpinner />
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <ErrorState 
        title="Event Not Found"
        message="The event you're trying to delete does not exist or has been removed."
        actionText="Go Back to Events"
        onAction={() => navigate('/events')}
      />
    );
  }

  return (
    <div className="container mt-4">
      <div className="card delete-event-card">
        <div className="card-header bg-danger text-white">
          <h2>
            <FontAwesomeIcon icon="trash-alt" className="me-2" />
            Delete Event
          </h2>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <FontAwesomeIcon icon="exclamation-triangle" className="me-2" />
            Warning: This action cannot be undone
          </div>
          
          <h3>Are you sure you want to delete the following event?</h3>
          
          <div className="event-summary mt-4">
            {event.image && (
              <div className="event-image-container">
                <img 
                  src={event.image.url} 
                  alt={event.image.alt || event.title} 
                  className="event-image"
                />
              </div>
            )}
            
            <div className="event-details">
              <h4>{event.title}</h4>
              <p className="text-muted">
                <FontAwesomeIcon icon="calendar-alt" className="me-2" />
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p>
                <FontAwesomeIcon icon="map-marker-alt" className="me-2" />
                {event.location}
              </p>
              <p>
                <FontAwesomeIcon icon="users" className="me-2" />
                Capacity: {event.capacity} attendees
              </p>
              <p>
                <FontAwesomeIcon icon="tags" className="me-2" />
                Category: {event.category}
              </p>
            </div>
          </div>
          
          <div className="mt-4 d-flex justify-content-end">
            <button 
              className="btn btn-secondary me-2" 
              onClick={handleCancel}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <FontAwesomeIcon icon="spinner" spin className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="trash-alt" className="me-2" />
                  Delete Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEvent; 