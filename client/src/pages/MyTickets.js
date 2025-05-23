import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/MyTickets.css';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:5000/api/profile/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setTickets(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load your tickets. Please try again later.');
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchTickets();
    }
  }, [user]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterTickets = (filter) => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return tickets.filter(ticket => new Date(ticket.date) > now);
      case 'past':
        return tickets.filter(ticket => new Date(ticket.date) < now);
      default:
        return tickets;
    }
  };

  const getStatusClass = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    return eventDate > now ? 'status-upcoming' : 'status-completed';
  };

  const getStatusText = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    return eventDate > now ? 'Upcoming' : 'Past';
  };

  const filteredTickets = filterTickets(activeTab);

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon="spinner" spin />
        <span>Loading your tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="my-tickets-container">
      <div className="tickets-header">
        <h1>My Tickets</h1>
        <p>Manage all your event registrations in one place</p>
        
        <div className="tickets-tabs">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} 
            onClick={() => setActiveTab('upcoming')}
          >
            <FontAwesomeIcon icon="calendar-alt" /> Upcoming
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} 
            onClick={() => setActiveTab('past')}
          >
            <FontAwesomeIcon icon="history" /> Past
          </button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="no-tickets">
          <div className="no-tickets-icon">
            <FontAwesomeIcon icon="ticket-alt" size="3x" />
          </div>
          <h3>No {activeTab} tickets found</h3>
          <p>You don't have any {activeTab} events.</p>
          <Link to="/events" className="browse-events-btn">
            <FontAwesomeIcon icon="search" /> Browse Events
          </Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {filteredTickets.map(ticket => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-event-details">
                  <h3>{ticket.title}</h3>
                  <span className={`ticket-status ${getStatusClass(ticket.date)}`}>
                    {getStatusText(ticket.date)}
                  </span>
                </div>
              </div>
              
              <div className="ticket-details">
                <div className="ticket-detail">
                  <FontAwesomeIcon icon="calendar-day" className="detail-icon" />
                  <span>{formatDate(ticket.date)}</span>
                </div>
                <div className="ticket-detail">
                  <FontAwesomeIcon icon="clock" className="detail-icon" />
                  <span>{formatTime(ticket.date)}</span>
                </div>
                <div className="ticket-detail">
                  <FontAwesomeIcon icon="map-marker-alt" className="detail-icon" />
                  <span>{ticket.location}</span>
                </div>
                <div className="ticket-detail">
                  <FontAwesomeIcon icon="user-friends" className="detail-icon" />
                  <span>{ticket.attendees ? ticket.attendees.length : 0} / {ticket.capacity} Attendees</span>
                </div>
                <div className="ticket-detail">
                  <FontAwesomeIcon icon="tag" className="detail-icon" />
                  <span>{ticket.category}</span>
                </div>
                {ticket.price > 0 ? (
                  <div className="ticket-detail">
                    <FontAwesomeIcon icon="money-bill-alt" className="detail-icon" />
                    <span>${ticket.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="ticket-detail">
                    <FontAwesomeIcon icon="gift" className="detail-icon" />
                    <span>Free</span>
                  </div>
                )}
              </div>
              
              <div className="ticket-footer">
                <Link to={`/events/${ticket._id}`} className="view-event-btn">
                  <FontAwesomeIcon icon="eye" /> View Event
                </Link>
                {new Date(ticket.date) > new Date() && (
                  <button className="ticket-details-btn" onClick={() => window.print()}>
                    <FontAwesomeIcon icon="print" /> Print Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets; 