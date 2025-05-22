import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    date: '',
    search: '',
    status: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await axios.get(`http://localhost:5000/api/events?${queryParams}`);
      setEvents(response.data.events);
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const categories = ['All', 'Conference', 'Workshop', 'Seminar', 'Networking', 'Other'];
  const statuses = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Events</h1>
        <button 
          className="create-event-btn"
          onClick={() => navigate('/events/create')}
        >
          Create Event
        </button>
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search events..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="filter-controls">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category === 'All' ? '' : category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            {statuses.map(status => (
              <option key={status} value={status === 'All' ? '' : status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="date-filter"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => (
              <div 
                key={event._id} 
                className="event-card"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  <span className={`event-status ${event.status}`}>
                    {event.status}
                  </span>
                </div>
                <div className="event-card-body">
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>📍 {event.location}</span>
                    <span>💰 ${event.price}</span>
                    <span>👥 {event.attendees.length}/{event.capacity}</span>
                  </div>
                </div>
                <div className="event-card-footer">
                  <span className="event-category">{event.category}</span>
                  <span className="event-organizer">
                    By {event.organizer.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              No events found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events; 