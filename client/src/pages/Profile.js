import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      let response;
      if (user.role === 'organizer') {
        // Fetch organized events
        response = await axios.get(`http://localhost:5000/api/events?organizer=${user._id}`);
      } else {
        // Fetch registered events
        response = await axios.get(`http://localhost:5000/api/events?attendee=${user._id}`);
      }
      setEvents(response.data.events);
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        <div className="profile-card">
          <h2>Profile Information</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={user?.role}
                disabled
                className="disabled-input"
              />
            </div>

            <button type="submit" className="update-button">
              Update Profile
            </button>
          </form>
        </div>

        <div className="events-card">
          <h2>{user?.role === 'organizer' ? 'My Events' : 'Registered Events'}</h2>
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : events.length > 0 ? (
            <div className="events-list">
              {events.map(event => (
                <div
                  key={event._id}
                  className="event-item"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="event-item-header">
                    <h3>{event.title}</h3>
                    <span className={`event-status ${event.status}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="event-item-details">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>👥 {event.attendees.length} / {event.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              {user?.role === 'organizer'
                ? "You haven't created any events yet"
                : "You haven't registered for any events yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 