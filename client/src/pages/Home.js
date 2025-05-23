import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EventCard from '../components/EventCard';
import FAQ from '../components/FAQ/FAQ';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, devLogin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filters.category, filters.status, currentPage]);

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
    if (name === 'search') {
      setSearchTerm(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1);
    fetchEvents();
  };

  const handleRoleSelect = (role) => {
    if (devLogin) {
      devLogin(role);
      navigate('/dashboard');
    }
  };

  const handleQuickFilter = (category) => {
    setFilters(prev => ({ ...prev, category }));
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="home">
      {!user && (
        <div className="home-navbar">
          <div className="home-logo">
            <Link to="/">
              <div className="logo-container">
                <div className="logo-icon">🎉</div>
                <div className="logo-text">EventHub</div>
              </div>
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/events" className="nav-link">Explore Events</Link>
          </div>
          <div className="nav-actions">
            <button onClick={toggleDarkMode} className="btn-icon-only">
              <FontAwesomeIcon icon={darkMode ? "sun" : "moon"} />
            </button>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </div>
        </div>
      )}

      <div className="hero-section">
        <div className="hero-content">
          <h1>Find & Join Amazing Events</h1>
          <p>Discover conferences, workshops, seminars and networking events. Connect with like-minded people and expand your horizons.</p>
          
          {!user && (
            <div className="hero-buttons">
              <Link to="/register" className="create-event-btn">
                <FontAwesomeIcon icon="user-plus" className="btn-icon" /> Create Account
              </Link>
              <Link to="/login" className="login-btn">
                <FontAwesomeIcon icon="sign-in-alt" className="btn-icon" /> Sign In
              </Link>

              {process.env.NODE_ENV === 'development' && (
                <div className="demo-options">
                  <p>Quick demo access:</p>
                  <div className="demo-buttons">
                    <button onClick={() => handleRoleSelect('attendee')} className="demo-btn attendee">
                      Try as Attendee
                    </button>
                    <button onClick={() => handleRoleSelect('organizer')} className="demo-btn organizer">
                      Try as Organizer
                    </button>
                    <button onClick={() => handleRoleSelect('admin')} className="demo-btn admin">
                      Try as Admin
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <button 
              className="create-event-btn"
              onClick={() => navigate('/events/create')}
            >
              <FontAwesomeIcon icon="plus" className="btn-icon" /> Create New Event
            </button>
          )}
          
          {user && user.role === 'user' && (
            <Link to="/events" className="browse-events-btn">
              <FontAwesomeIcon icon="search" className="btn-icon" /> Browse Events
            </Link>
          )}
        </div>
        
        {!user && (
          <div className="hero-image">
            <img src="/images/event-illustration.svg" alt="Event Illustration" />
          </div>
        )}
      </div>

      <div className="quick-filters">
        <h2>Find Events By Category</h2>
        <div className="quick-filter-buttons">
          <button 
            className={`filter-btn ${filters.category === '' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('')}
          >
            <FontAwesomeIcon icon="calendar-alt" />
            <span>All</span>
          </button>
          <button 
            className={`filter-btn ${filters.category === 'conference' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('conference')}
          >
            <FontAwesomeIcon icon="users" />
            <span>Conferences</span>
          </button>
          <button 
            className={`filter-btn ${filters.category === 'workshop' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('workshop')}
          >
            <FontAwesomeIcon icon="laptop" />
            <span>Workshops</span>
          </button>
          <button 
            className={`filter-btn ${filters.category === 'seminar' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('seminar')}
          >
            <FontAwesomeIcon icon="chalkboard-teacher" />
            <span>Seminars</span>
          </button>
          <button 
            className={`filter-btn ${filters.category === 'networking' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('networking')}
          >
            <FontAwesomeIcon icon="handshake" />
            <span>Networking</span>
          </button>
        </div>
      </div>

      <div className="featured-categories">
        <h2>Browse Events by Category</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => {
            setFilters(prev => ({ ...prev, category: 'conference' }));
            fetchEvents();
            window.scrollTo({ top: document.querySelector('.events-grid').offsetTop - 100, behavior: 'smooth' });
          }}>
            <div className="category-icon conference">
              <FontAwesomeIcon icon="users" />
            </div>
            <h3>Conferences</h3>
            <p>Large-scale events with speakers and sessions</p>
          </div>
          
          <div className="category-card" onClick={() => {
            setFilters(prev => ({ ...prev, category: 'workshop' }));
            fetchEvents();
            window.scrollTo({ top: document.querySelector('.events-grid').offsetTop - 100, behavior: 'smooth' });
          }}>
            <div className="category-icon workshop">
              <FontAwesomeIcon icon="laptop" />
            </div>
            <h3>Workshops</h3>
            <p>Hands-on learning and skill development</p>
          </div>
          
          <div className="category-card" onClick={() => {
            setFilters(prev => ({ ...prev, category: 'seminar' }));
            fetchEvents();
            window.scrollTo({ top: document.querySelector('.events-grid').offsetTop - 100, behavior: 'smooth' });
          }}>
            <div className="category-icon seminar">
              <FontAwesomeIcon icon="chalkboard-teacher" />
            </div>
            <h3>Seminars</h3>
            <p>Educational presentations by experts</p>
          </div>
          
          <div className="category-card" onClick={() => {
            setFilters(prev => ({ ...prev, category: 'networking' }));
            fetchEvents();
            window.scrollTo({ top: document.querySelector('.events-grid').offsetTop - 100, behavior: 'smooth' });
          }}>
            <div className="category-icon networking">
              <FontAwesomeIcon icon="handshake" />
            </div>
            <h3>Networking</h3>
            <p>Connect with professionals in your field</p>
          </div>
        </div>
      </div>

      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <FontAwesomeIcon icon="search" className="search-icon" />
            <input
              type="text"
              name="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>
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
          <button type="submit" className="search-btn">
            <FontAwesomeIcon icon="search" /> Search
          </button>
        </form>
      </div>

      <h2 className="section-title">Explore Events</h2>
      <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event._id} event={event} />
          ))
        ) : (
          <div className="no-events">
            <div className="no-events-icon">
              <FontAwesomeIcon icon="calendar-alt" />
            </div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or come back later for new events</p>
            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <button 
                className="create-event-btn"
                onClick={() => navigate('/events/create')}
              >
                <FontAwesomeIcon icon="plus" /> Create New Event
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
            className="pagination-btn prev"
          >
            <FontAwesomeIcon icon="chevron-left" /> Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn next"
          >
            Next <FontAwesomeIcon icon="chevron-right" />
          </button>
        </div>
      )}

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <p className="subtitle">Hear from organizers and attendees who have used our platform</p>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-content">
              EventHub made it incredibly easy to organize our tech conference. The attendee management features saved us countless hours.
            </p>
            <div className="testimonial-author">
              <div className="author-image">
                <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah Johnson" />
              </div>
              <div className="author-details">
                <span className="author-name">Sarah Johnson</span>
                <span className="author-role">Event Organizer</span>
                <div className="testimonial-rating">
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <p className="testimonial-content">
              I've attended multiple events through EventHub and love how easy it is to find events in my area. The ticket management is super convenient!
            </p>
            <div className="testimonial-author">
              <div className="author-image">
                <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="Michael Chen" />
              </div>
              <div className="author-details">
                <span className="author-name">Michael Chen</span>
                <span className="author-role">Regular Attendee</span>
                <div className="testimonial-rating">
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon={['far', 'star']} className="star" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <p className="testimonial-content">
              As a speaker at multiple conferences, I appreciate how EventHub connects me with my audience before and after events.
            </p>
            <div className="testimonial-author">
              <div className="author-image">
                <img src="https://randomuser.me/api/portraits/women/58.jpg" alt="Priya Sharma" />
              </div>
              <div className="author-details">
                <span className="author-name">Priya Sharma</span>
                <span className="author-role">Professional Speaker</span>
                <div className="testimonial-rating">
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                  <FontAwesomeIcon icon="star" className="star" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics-section">
        <h2>EventHub by the Numbers</h2>
        
        <div className="statistics-grid">
          <div className="statistic-item">
            <div className="statistic-value">
              <FontAwesomeIcon icon="calendar-check" />
              <span>10,000+</span>
            </div>
            <div className="statistic-label">Events Hosted</div>
          </div>
          
          <div className="statistic-item">
            <div className="statistic-value">
              <FontAwesomeIcon icon="users" />
              <span>500,000+</span>
            </div>
            <div className="statistic-label">Attendees</div>
          </div>
          
          <div className="statistic-item">
            <div className="statistic-value">
              <FontAwesomeIcon icon="globe" />
              <span>120+</span>
            </div>
            <div className="statistic-label">Countries</div>
          </div>
          
          <div className="statistic-item">
            <div className="statistic-value">
              <FontAwesomeIcon icon="user-tie" />
              <span>5,000+</span>
            </div>
            <div className="statistic-label">Organizers</div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />

      {!user && (
        <>
          <div className="cta-section">
            <div className="cta-content">
              <h2>Ready to host your own event?</h2>
              <p>Sign up as an organizer and start creating and managing events today.</p>
              <Link to="/register" className="cta-button">Get Started</Link>
            </div>
          </div>

          <div className="home-footer">
            <div className="footer-content">
              <div className="footer-logo">
                <div className="logo-container">
                  <div className="logo-icon">🎉</div>
                  <div className="logo-text">EventHub</div>
                </div>
                <p>Your all-in-one platform for discovering and managing events.</p>
                <div className="social-links">
                  <a href="#" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'facebook']} />
                  </a>
                  <a href="#" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'twitter']} />
                  </a>
                  <a href="#" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'instagram']} />
                  </a>
                  <a href="#" className="social-link">
                    <FontAwesomeIcon icon={['fab', 'linkedin']} />
                  </a>
                </div>
              </div>
              
              <div className="footer-links">
                <div className="footer-column">
                  <h4>Quick Links</h4>
                  <Link to="/events">Explore Events</Link>
                  <Link to="/register">Sign Up</Link>
                  <Link to="/login">Login</Link>
                </div>
                <div className="footer-column">
                  <h4>Legal</h4>
                  <Link to="/terms">Terms of Service</Link>
                  <Link to="/privacy">Privacy Policy</Link>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>© {new Date().getFullYear()} EventHub. All rights reserved.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home; 