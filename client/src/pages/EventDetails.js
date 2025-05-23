import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/EventDetails.css';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!isAuthenticated) {
        toast.info('Please login to register for this event');
        navigate('/login', { state: { from: `/events/${id}`, action: 'register' } });
        return;
      }

      setRegistering(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:5000/api/events/${id}/register`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.requiresPayment) {
        toast.info('This event requires payment to complete registration');
        navigate(`/payment/${id}`);
        return;
      }
      
      toast.success('Successfully registered for event!');
      await fetchEvent(); // Refresh the event data
      
      // Redirect to calendar to see the registered event
      setTimeout(() => {
        navigate('/calendar');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login', { state: { from: `/events/${id}`, action: 'register' } });
      } else {
        setError(error.response?.data?.error || 'Failed to register for event');
        toast.error(error.response?.data?.error || 'Failed to register for event');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/events/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Registration cancelled successfully');
      fetchEvent();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to cancel registration');
      toast.error(error.response?.data?.error || 'Failed to cancel registration');
    }
  };

  const isRegistered = event?.attendees.some(
    attendee => attendee.user._id === user?._id
  );

  const isOrganizer = event?.organizer._id === user?._id;
  const isAdmin = user?.role === 'admin';

  // Function to get event image based on category
  const getEventImage = () => {
    if (event.image?.url) return event.image.url;
    
    // Use local default images based on category
    const category = event.category?.toLowerCase() || 'other';
    switch (category) {
      case 'conference':
        return '/images/event-conference.jpg';
      case 'workshop':
        return '/images/event-workshop.jpg';
      case 'seminar':
        return '/images/event-seminar.jpg';
      case 'networking':
        return '/images/event-networking.jpg';
      default:
        return '/images/event-other.jpg';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon="spinner" spin />
        <span>Loading event details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
        Event not found
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-card">
        <div className="event-header">
          <h1>{event.title}</h1>
          <span className={`event-status ${event.status}`}>{event.status}</span>
        </div>

        <div className="event-image-container">
          <img 
            src={getEventImage()} 
            alt={event.image?.alt || event.title || "Event image"} 
            className="event-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/event-other.jpg';
            }}
          />
        </div>

        <div className="event-info-grid">
          <div className="event-info-item">
            <span className="label">
              <FontAwesomeIcon icon="calendar-alt" className="info-icon" />
              Date
            </span>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="event-info-item">
            <span className="label">
              <FontAwesomeIcon icon="clock" className="info-icon" />
              Time
            </span>
            <span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="event-info-item">
            <span className="label">
              <FontAwesomeIcon icon="map-marker-alt" className="info-icon" />
              Location
            </span>
            <span>{event.location}</span>
          </div>
          <div className="event-info-item">
            <span className="label">
              <FontAwesomeIcon icon="money-bill-alt" className="info-icon" />
              Price
            </span>
            <span>${event.price.toFixed(2)}</span>
          </div>
          <div className="event-info-item">
            <span className="label">
              <FontAwesomeIcon icon="tags" className="info-icon" />
              Category
            </span>
            <span>{event.category}</span>
          </div>
          <div className="event-info-item">
            <span className="label">
              <FontAwesomeIcon icon="users" className="info-icon" />
              Capacity
            </span>
            <span>{event.attendees.length} / {event.capacity}</span>
          </div>
        </div>

        <div className="event-description">
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-organizer">
          <h2>Organizer</h2>
          <p>
            <FontAwesomeIcon icon="user-tie" className="info-icon" />
            {event.organizer.name}
          </p>
        </div>

        <div className="event-actions-container">
          {(isOrganizer || isAdmin) && (
            <div className="event-actions organizer-actions">
              <button
                onClick={() => navigate(`/events/${id}/edit`)}
                className="action-button edit-button"
              >
                <FontAwesomeIcon icon="pencil-alt" />
                Edit Event
              </button>
              <button
                onClick={() => navigate(`/events/${id}/delete`)}
                className="action-button delete-button"
              >
                <FontAwesomeIcon icon="trash-alt" />
                Delete Event
              </button>
            </div>
          )}

          {!isOrganizer && event.status === 'upcoming' && (
            <div className="event-actions attendee-actions">
              {isRegistered ? (
                <button
                  onClick={handleCancelRegistration}
                  className="action-button cancel-button"
                  disabled={registering}
                >
                  {registering ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="times" />
                      Cancel Registration
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  className="action-button register-button"
                  disabled={registering || event.attendees.length >= event.capacity}
                >
                  {registering ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="calendar-check" />
                      {event.attendees.length >= event.capacity
                        ? 'Event Full'
                        : 'Register for Event'}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="attendees-section">
          <h2>Attendees ({event.attendees.length})</h2>
          <div className="attendees-list">
            {event.attendees.length === 0 ? (
              <p className="no-attendees-message">No attendees yet</p>
            ) : (
              event.attendees.map(attendee => (
                <div key={attendee.user._id} className="attendee-item">
                  <FontAwesomeIcon icon="user" className="attendee-icon" />
                  <span>{attendee.user.name}</span>
                  <span className="registration-date">
                    Registered on {new Date(attendee.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 