import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/MobileNavbar.css';

const MobileNavbar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="mobile-navbar">
        <Link to="/" className="mobile-brand">
          <div className="logo-icon">🎉</div>
          <div className="logo-text">EventHub</div>
        </Link>
        
        <button className="menu-toggle" onClick={toggleMenu}>
          <FontAwesomeIcon icon={isMenuOpen ? "times" : "bars"} />
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-user-info">
          <div className="user-avatar">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Guest'}</div>
          </div>
        </div>

        <nav className="mobile-nav">
          <Link 
            to="/dashboard" 
            className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon="th-large" className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/events" 
            className={`mobile-nav-item ${isActive('/events') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon="calendar-check" className="nav-icon" />
            <span>Events</span>
          </Link>
          
          {user?.role === 'organizer' && (
            <Link 
              to="/events/create" 
              className={`mobile-nav-item ${isActive('/events/create') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon="plus" className="nav-icon" />
              <span>Create Event</span>
            </Link>
          )}
          
          <Link 
            to="/calendar" 
            className={`mobile-nav-item ${isActive('/calendar') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon="calendar-alt" className="nav-icon" />
            <span>Calendar</span>
          </Link>
          
          <Link 
            to="/my-tickets" 
            className={`mobile-nav-item ${isActive('/my-tickets') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon="ticket-alt" className="nav-icon" />
            <span>My Tickets</span>
          </Link>
          
          <Link 
            to="/notifications" 
            className={`mobile-nav-item ${isActive('/notifications') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon="bell" className="nav-icon" />
            <span>Notifications</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon="user" className="nav-icon" />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default MobileNavbar; 