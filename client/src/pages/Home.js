import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filters, currentPage]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        ...filters,
        page: currentPage
      });

      const response = await axios.get(`http://localhost:5000/api/events?${params}`);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching events:', error);
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
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="home">
      <div className="hero-section">
        <h1>Discover Amazing Events</h1>
        <p>Join exciting events, meet new people, and create unforgettable memories</p>
        {user && (user.role === 'organizer' || user.role === 'admin') && (
          <button 
            className="create-event-btn"
            onClick={() => navigate('/events/create')}
          >
            Create New Event
          </button>
        )}
      </div>

      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search events..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="networking">Networking</option>
            <option value="other">Other</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </form>
      </div>

      <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => (
            <Link to={`/events/${event._id}`} key={event._id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`event-status ${event.status}`}>{event.status}</span>
              </div>
              <div className="event-details">
                <p>{event.description}</p>
                <div className="event-info">
                  <div className="event-info-item">
                    <span>📅 Date:</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="event-info-item">
                    <span>📍 Location:</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="event-info-item">
                    <span>💰 Price:</span>
                    <span>${event.price}</span>
                  </div>
                  <div className="event-info-item">
                    <span>👥 Capacity:</span>
                    <span>{event.attendees.length} / {event.capacity}</span>
                  </div>
                </div>
                <div className="event-capacity">
                  <div className="capacity-text">
                    {Math.round((event.attendees.length / event.capacity) * 100)}% Full
                  </div>
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill" 
                      style={{ width: `${(event.attendees.length / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-events">
            <h3>No events found</h3>
            <p>Try adjusting your filters or create a new event</p>
            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <button 
                className="create-event-btn"
                onClick={() => navigate('/events/create')}
              >
                Create New Event
              </button>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 