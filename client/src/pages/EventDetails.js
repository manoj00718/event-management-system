import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/EventDetails.css';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
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
      if (!user) {
        navigate('/login');
        return;
      }

      await axios.post(`http://localhost:5000/api/events/${id}/register`);
      fetchEvent();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register for event');
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await axios.post(`http://localhost:5000/api/events/${id}/cancel`);
      fetchEvent();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to cancel registration');
    }
  };

  const isRegistered = event?.attendees.some(
    attendee => attendee.user._id === user?._id
  );

  const isOrganizer = event?.organizer._id === user?._id;

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div className="error-message">Event not found</div>;
  }

  return (
    <div className="event-details-container">
      <div className="event-details-card">
        <div className="event-header">
          <h1>{event.title}</h1>
          <span className={`event-status ${event.status}`}>{event.status}</span>
        </div>

        {event.image && event.image.url && (
          <div className="event-image-container">
            <img 
              src={event.image.url} 
              alt={event.image.alt || "Event image"} 
              className="event-image"
            />
          </div>
        )}

        <div className="event-info-grid">
          <div className="event-info-item">
            <span className="label">Date</span>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="event-info-item">
            <span className="label">Time</span>
            <span>{new Date(event.date).toLocaleTimeString()}</span>
          </div>
          <div className="event-info-item">
            <span className="label">Location</span>
            <span>{event.location}</span>
          </div>
          <div className="event-info-item">
            <span className="label">Price</span>
            <span>${event.price}</span>
          </div>
          <div className="event-info-item">
            <span className="label">Category</span>
            <span>{event.category}</span>
          </div>
          <div className="event-info-item">
            <span className="label">Capacity</span>
            <span>{event.attendees.length} / {event.capacity}</span>
          </div>
        </div>

        <div className="event-description">
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-organizer">
          <h2>Organizer</h2>
          <p>{event.organizer.name}</p>
        </div>

        {!isOrganizer && event.status === 'upcoming' && (
          <div className="event-actions">
            {isRegistered ? (
              <button
                onClick={handleCancelRegistration}
                className="cancel-button"
              >
                Cancel Registration
              </button>
            ) : (
              <button
                onClick={handleRegister}
                className="register-button"
                disabled={event.attendees.length >= event.capacity}
              >
                {event.attendees.length >= event.capacity
                  ? 'Event Full'
                  : 'Register for Event'}
              </button>
            )}
          </div>
        )}

        {isOrganizer && (
          <div className="event-actions">
            <button
              onClick={() => navigate(`/events/${id}/edit`)}
              className="edit-button"
            >
              Edit Event
            </button>
          </div>
        )}

        <div className="attendees-section">
          <h2>Attendees ({event.attendees.length})</h2>
          <div className="attendees-list">
            {event.attendees.map(attendee => (
              <div key={attendee.user._id} className="attendee-item">
                <span>{attendee.user.name}</span>
                <span className="registration-date">
                  Registered on {new Date(attendee.registeredAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 