import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/Dashboard.css';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    totalBookings: 0,
    ticketsSold: 0,
    revenue: 0
  });
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      // Get events created by this organizer
      const eventsResponse = await axios.get('http://localhost:5000/api/profile/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setEvents(eventsResponse.data);
      
      // Calculate stats from organizer's events
      const totalBookings = eventsResponse.data.reduce(
        (sum, event) => sum + (event.attendees ? event.attendees.length : 0), 0
      );
      
      const ticketsSold = totalBookings;
      
      const revenue = eventsResponse.data.reduce(
        (sum, event) => sum + (event.price * (event.attendees ? event.attendees.length : 0)), 0
      );
      
      const upcomingEvents = eventsResponse.data.filter(
        event => new Date(event.date) > new Date()
      ).length;

      setStats({
        upcomingEvents,
        totalBookings,
        ticketsSold,
        revenue
      });

    } catch (error) {
      console.error('Error fetching organizer data:', error);
      // Set some fallback data
      setStats({
        upcomingEvents: 0,
        totalBookings: 0,
        ticketsSold: 0,
        revenue: 0
      });
      setEvents([]);
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

  const renderEventsList = () => {
    let filteredEvents = events;

    if (activeTab === 'upcoming') {
      filteredEvents = events.filter(event => new Date(event.date) > new Date());
    } else if (activeTab === 'past') {
      filteredEvents = events.filter(event => new Date(event.date) <= new Date());
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="no-events-message">
          <p>No events found. Start creating events to manage them here.</p>
          <Link to="/events/create" className="create-event-btn">
            <FontAwesomeIcon icon="plus" /> Create New Event
          </Link>
        </div>
      );
    }

    return (
      <div className="events-grid">
        {filteredEvents.map((event, index) => (
          <div key={event._id || index} className="event-card">
            <div className="event-image">
              <span className="category-badge">{event.category}</span>
              <img 
                src={event.image || `https://source.unsplash.com/random/600x400/?event,${index}`} 
                alt={event.title} 
              />
            </div>
            <div className="event-content">
              <h3>{event.title}</h3>
              <div className="event-location">
                <FontAwesomeIcon icon="map-marker-alt" className="event-icon" />
                {event.location}
              </div>
              <div className="event-footer">
                <div className="event-date">
                  <FontAwesomeIcon icon="calendar" className="event-icon" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="event-price">
                  {event.price > 0 ? formatCurrency(event.price) : 'Free'}
                </div>
              </div>
              <div className="booking-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${Math.min(((event.attendees ? event.attendees.length : 0) / event.capacity) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="booking-details">
                <span>Booked {event.attendees ? event.attendees.length : 0} / {event.capacity}</span>
                <span className="booking-percentage">
                  {Math.round(((event.attendees ? event.attendees.length : 0) / event.capacity) * 100)}%
                </span>
              </div>
              <div className="event-actions">
                <Link to={`/events/${event._id}`} className="action-btn view">
                  <FontAwesomeIcon icon="eye" /> View
                </Link>
                <Link to={`/events/${event._id}/edit`} className="action-btn edit">
                  <FontAwesomeIcon icon="edit" /> Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading organizer dashboard...</div>;
  }

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <span>Organizer Dashboard</span>
        </div>
        <div className="dashboard-welcome">
          <h2>Hello {user?.name || 'Organizer'}, welcome to your events dashboard!</h2>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="stat-card upcoming-events">
          <div className="stat-icon">
            <FontAwesomeIcon icon="calendar-day" />
          </div>
          <div className="stat-info">
            <h3>Your Events</h3>
            <p className="stat-value">{stats.upcomingEvents}</p>
          </div>
        </div>

        <div className="stat-card total-bookings">
          <div className="stat-icon">
            <FontAwesomeIcon icon="clipboard-check" />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
          </div>
        </div>

        <div className="stat-card tickets-sold">
          <div className="stat-icon">
            <FontAwesomeIcon icon="ticket-alt" />
          </div>
          <div className="stat-info">
            <h3>Tickets Sold</h3>
            <p className="stat-value">{stats.ticketsSold}</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <FontAwesomeIcon icon="chart-line" />
          </div>
          <div className="stat-info">
            <h3>Revenue</h3>
            <p className="stat-value">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="ticket-sales-section">
          <div className="section-header">
            <h2>Ticket Sales</h2>
            <div className="section-filter">
              <span>Last 30 days</span>
              <FontAwesomeIcon icon="chevron-down" />
            </div>
          </div>
          <div className="donut-chart-container">
            <div className="donut-chart">
              <div className="donut-placeholder"></div>
              <div className="donut-center">
                <p className="donut-value">{stats.ticketsSold}</p>
                <p className="donut-label">Tickets</p>
              </div>
            </div>
            <div className="ticket-stats">
              <div className="ticket-stat">
                <div className="stat-color sold"></div>
                <div className="stat-details">
                  <p className="stat-title">Sold</p>
                  <p className="stat-count">{Math.floor(stats.ticketsSold * 0.75)}</p>
                </div>
                <span className="stat-percentage">75%</span>
              </div>
              <div className="ticket-stat">
                <div className="stat-color booked"></div>
                <div className="stat-details">
                  <p className="stat-title">Booked</p>
                  <p className="stat-count">{Math.floor(stats.ticketsSold * 0.25)}</p>
                </div>
                <span className="stat-percentage">25%</span>
              </div>
              <div className="ticket-stat">
                <div className="stat-color available"></div>
                <div className="stat-details">
                  <p className="stat-title">Available</p>
                  <p className="stat-count">{Math.max(200 - stats.ticketsSold, 0)}</p>
                </div>
                <span className="stat-percentage">{Math.max(Math.round(((200 - stats.ticketsSold) / 200) * 100), 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="revenue-section">
          <div className="section-header">
            <h2>Revenue Overview</h2>
            <div className="section-filter">
              <span>This Month</span>
              <FontAwesomeIcon icon="chevron-down" />
            </div>
          </div>
          <div className="revenue-details">
            <div className="revenue-stats">
              <div>
                <p className="stats-label">Total Revenue</p>
                <p className="revenue-value">{formatCurrency(stats.revenue)}</p>
              </div>
              <div>
                <p className="stats-label">This Month</p>
                <p className="revenue-amount">{formatCurrency(Math.round(stats.revenue * 0.7))}</p>
              </div>
              <div>
                <p className="stats-label">Profit</p>
                <p className="profit-amount">{formatCurrency(Math.round(stats.revenue * 0.6))}</p>
              </div>
            </div>
            <div className="chart-placeholder"></div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Your Events</h2>
          <div className="bookings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
          </div>
        </div>
        {renderEventsList()}
        <div className="section-footer">
          <Link to="/events/create" className="create-event-btn">
            <FontAwesomeIcon icon="plus" /> Create New Event
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard; 