import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EventCard.css';

const EventCard = ({ event }) => {
  // Determine which image to use based on category
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

  // Get category for the event with fallback
  const getCategory = () => {
    return (event.category?.toLowerCase() || 'other');
  };

  // Get status for the event with fallback
  const getStatus = () => {
    return (event.status?.toLowerCase() || 'upcoming');
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-upcoming';
    }
  };

  const category = getCategory();
  const status = getStatus();

  return (
    <Link to={`/events/${event._id || '1'}`} className="event-card-link">
      <div className="event-card">
        <div className="event-image-container">
          <img 
            src={getEventImage()} 
            alt={event.title || 'Event'} 
            className="event-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/event-other.jpg';
            }}
          />
          <div className="event-badges">
            <span className={`event-status-badge ${getStatusClass(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className={`event-category-badge ${category}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="event-content">
          <h3 className="event-title">{event.title || 'Untitled Event'}</h3>
          
          <div className="event-details">
            <div className="event-detail">
              <FontAwesomeIcon icon="calendar-alt" className="event-icon" />
              <span>{formatDate(event.date || new Date())}</span>
            </div>
            <div className="event-detail">
              <FontAwesomeIcon icon="clock" className="event-icon" />
              <span>{formatTime(event.date || new Date())}</span>
            </div>
            <div className="event-detail">
              <FontAwesomeIcon icon="map-marker-alt" className="event-icon" />
              <span>{event.location || 'Location TBD'}</span>
            </div>
            <div className="event-detail">
              <FontAwesomeIcon icon="users" className="event-icon" />
              <span>{(event.attendees && event.attendees.length) || 0} / {event.capacity || 100} attendees</span>
            </div>
          </div>
          
          <div className="event-footer">
            <div className="event-price">
              {!event.price || event.price === 0 ? (
                <span className="price-free">Free</span>
              ) : (
                <span className="price-amount">${(event.price || 0).toFixed(2)}</span>
              )}
            </div>
            <div className="view-event-btn">
              View Details <FontAwesomeIcon icon="arrow-right" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard; 