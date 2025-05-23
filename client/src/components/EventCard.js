import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="event-card">
      <div className="event-image-container">
        <img 
          src={event.image?.url || 'https://via.placeholder.com/800x400'} 
          alt={event.image?.alt || event.title} 
          className="event-image"
        />
        <div className="event-badges">
          <span className={`event-category ${event.category}`}>
            {event.category}
          </span>
          <span className={`event-status ${getStatusClass(event.status)}`}>
            {event.status}
          </span>
        </div>
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="event-detail">
            <span className="icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="event-detail">
            <span className="icon">🕒</span>
            <span>{formatTime(event.date)}</span>
          </div>
          <div className="event-detail">
            <span className="icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="event-detail">
            <span className="icon">👥</span>
            <span>{event.attendees.length} / {event.capacity}</span>
          </div>
        </div>
        
        <div className="event-footer">
          <div className="event-price">
            {event.price === 0 ? (
              <span className="price-free">Free</span>
            ) : (
              <span className="price-amount">${event.price.toFixed(2)}</span>
            )}
          </div>
          <Link to={`/events/${event._id}`} className="view-event-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 