import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './EventRecommendations.css';

const EventRecommendations = ({ limit = 3 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return; // Don't show recommendations if not logged in
        }
        
        const response = await axios.get(`/api/recommendations?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setRecommendations(response.data.events);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [limit]);
  
  if (loading) {
    return <div className="recommendations-loading">Loading recommendations...</div>;
  }
  
  if (error) {
    return null; // Don't show error state to users
  }
  
  if (recommendations.length === 0) {
    return null; // Don't show empty recommendations
  }

  return (
    <div className="event-recommendations">
      <h3>Recommended for You</h3>
      <div className="recommendations-container">
        {recommendations.map(event => (
          <div key={event._id} className="recommendation-card">
            <div 
              className="recommendation-image" 
              style={{ backgroundImage: `url(${event.image?.url || 'https://via.placeholder.com/300x150'})` }}
            >
              {event.isPaid && event.price > 0 && (
                <span className="recommendation-price">${event.price.toFixed(2)}</span>
              )}
            </div>
            <div className="recommendation-content">
              <h4>{event.title}</h4>
              <p className="recommendation-date">
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="recommendation-location">{event.location}</p>
              <div className="recommendation-metrics">
                <div className="metric">
                  <span className="metric-label">Match:</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ width: `${Math.round(event.recommendationScore * 100)}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{Math.round(event.recommendationScore * 100)}%</span>
                </div>
              </div>
              <Link to={`/events/${event._id}`} className="view-event-btn">View Event</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventRecommendations; 