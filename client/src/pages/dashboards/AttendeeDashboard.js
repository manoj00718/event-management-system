import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/Dashboard.css';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myEvents, setMyEvents] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('attending');

  useEffect(() => {
    fetchAttendeeData();
  }, []);

  const fetchAttendeeData = async () => {
    try {
      setLoading(true);
      // Get events that the attendee is registered for
      console.log('Fetching registered events...');
      const myEventsResponse = await axios.get('http://localhost:5000/api/profile/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Received registered events:', myEventsResponse.data);
      
      // Get favorite events
      const favoritesResponse = await axios.get('http://localhost:5000/api/profile/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Get upcoming events
      const upcomingResponse = await axios.get('http://localhost:5000/api/events?limit=6', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMyEvents(myEventsResponse.data || []);
      setFavoriteEvents(favoritesResponse.data || []);
      setUpcomingEvents(upcomingResponse.data.events || []);
    } catch (error) {
      console.error('Error fetching attendee data:', error.response || error);
      // Set some fallback data
      setMyEvents([]);
      setFavoriteEvents([]);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderEventsList = () => {
    let displayEvents = [];
    
    if (activeTab === 'attending') {
      displayEvents = myEvents.filter(event => new Date(event.date) > new Date());
    } else if (activeTab === 'attended') {
      displayEvents = myEvents.filter(event => new Date(event.date) <= new Date());
    } else if (activeTab === 'favorites') {
      displayEvents = favoriteEvents;
    } else if (activeTab === 'discover') {
      displayEvents = upcomingEvents.filter(event => 
        !myEvents.find(myEvent => myEvent._id === event._id)
      );
    }

    if (displayEvents.length === 0) {
      return (
        <div className="no-events-message">
          {activeTab === 'discover' ? (
            <>
              <p>No recommended events at the moment.</p>
              <Link to="/events" className="view-details-btn">
                Browse All Events
              </Link>
            </>
          ) : activeTab === 'favorites' ? (
            <>
              <p>You haven't added any events to favorites yet.</p>
              <Link to="/events" className="view-details-btn">
                Browse Events
              </Link>
            </>
          ) : (
            <>
              <p>No {activeTab} events found.</p>
              <Link to="/events" className="view-details-btn">
                Discover Events
              </Link>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="events-grid">
        {displayEvents.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-card-header">
              <h3>{event.title}</h3>
              <span className={`event-status ${event.status || 'upcoming'}`}>
                {event.status || 'Upcoming'}
              </span>
            </div>
            
            <div className="event-card-details">
              <div className="event-detail">
                <FontAwesomeIcon icon="calendar-day" className="detail-icon" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="event-detail">
                <FontAwesomeIcon icon="clock" className="detail-icon" />
                <span>{formatTime(event.date)}</span>
              </div>
              <div className="event-detail">
                <FontAwesomeIcon icon="map-marker-alt" className="detail-icon" />
                <span>{event.location}</span>
              </div>
              <div className="event-detail">
                <FontAwesomeIcon icon="users" className="detail-icon" />
                <span>{event.attendees ? event.attendees.length : 0} / {event.capacity} attendees</span>
              </div>
              <div className="event-detail">
                <FontAwesomeIcon icon="tag" className="detail-icon" />
                <span>{event.category || 'Other'}</span>
              </div>
              {event.price > 0 ? (
                <div className="event-detail">
                  <FontAwesomeIcon icon="money-bill-alt" className="detail-icon" />
                  <span>${event.price.toFixed(2)}</span>
                </div>
              ) : (
                <div className="event-detail">
                  <FontAwesomeIcon icon="gift" className="detail-icon" />
                  <span>Free</span>
                </div>
              )}
            </div>
            
            <div className="event-card-actions">
              <button 
                className="view-details-btn"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                <FontAwesomeIcon icon="eye" /> View Details
              </button>
              {activeTab === 'attending' && (
                <button 
                  className="ticket-btn"
                  onClick={() => navigate(`/tickets/${event._id}`)}
                >
                  <FontAwesomeIcon icon="ticket-alt" /> View Ticket
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon="spinner" spin />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <span>Attendee Dashboard</span>
        </div>
        <div className="dashboard-welcome">
          <h2>Hello {user?.name || 'Attendee'}, welcome to your events dashboard!</h2>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="stat-card attending-events">
          <div className="stat-icon">
            <FontAwesomeIcon icon="calendar-check" />
          </div>
          <div className="stat-info">
            <h3>Attending</h3>
            <p className="stat-value">{myEvents.filter(event => new Date(event.date) > new Date()).length}</p>
          </div>
        </div>

        <div className="stat-card past-events">
          <div className="stat-icon">
            <FontAwesomeIcon icon="calendar-day" />
          </div>
          <div className="stat-info">
            <h3>Attended</h3>
            <p className="stat-value">{myEvents.filter(event => new Date(event.date) <= new Date()).length}</p>
          </div>
        </div>

        <div className="stat-card favorite-events">
          <div className="stat-icon">
            <FontAwesomeIcon icon="heart" />
          </div>
          <div className="stat-info">
            <h3>Favorites</h3>
            <p className="stat-value">{favoriteEvents.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/events" className="action-btn">
          <FontAwesomeIcon icon="search" /> Browse Events
        </Link>
        <Link to="/calendar" className="action-btn">
          <FontAwesomeIcon icon="calendar-alt" /> View Calendar
        </Link>
        <Link to="/my-tickets" className="action-btn primary">
          <FontAwesomeIcon icon="ticket-alt" /> My Tickets
        </Link>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'attending' ? 'active' : ''}`}
          onClick={() => setActiveTab('attending')}
        >
          Upcoming Events
        </button>
        <button 
          className={`tab-btn ${activeTab === 'attended' ? 'active' : ''}`}
          onClick={() => setActiveTab('attended')}
        >
          Past Events
        </button>
        <button 
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button 
          className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
      </div>

      <div className="dashboard-content">
        {renderEventsList()}
      </div>

      {activeTab === 'attending' && myEvents.filter(event => new Date(event.date) > new Date()).length > 0 && (
        <div className="view-all-container">
          <Link to="/my-tickets" className="view-all-btn">
            View All My Tickets <FontAwesomeIcon icon="arrow-right" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AttendeeDashboard; 