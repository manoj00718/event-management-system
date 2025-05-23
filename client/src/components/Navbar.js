import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('👋 Successfully logged out!');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Render the appropriate navbar based on user role
  const renderNavLinks = () => {
    if (!user) return null;

    // Admin navbar
    if (user.role === 'admin') {
      return (
        <>
          <Link to="/dashboard" className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="th-large" />
            </div>
            <span>Admin Dashboard</span>
          </Link>
          
          <Link to="/events" className={`menu-item ${isActive('/events') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="calendar-check" />
            </div>
            <span>All Events</span>
          </Link>
        </>
      );
    }
    
    // Organizer navbar
    if (user.role === 'organizer') {
      return (
        <>
          <Link to="/dashboard" className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="th-large" />
            </div>
            <span>Organizer Dashboard</span>
          </Link>
          
          <Link to="/events/create" className={`menu-item ${isActive('/events/create') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="plus" />
            </div>
            <span>Create Event</span>
          </Link>

          <Link to="/events" className={`menu-item ${isActive('/events') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="calendar-check" />
            </div>
            <span>Manage Events</span>
          </Link>
          
          <Link to="/calendar" className={`menu-item ${isActive('/calendar') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="calendar-alt" />
            </div>
            <span>Calendar</span>
          </Link>
          
          <Link to="/notifications" className={`menu-item ${isActive('/notifications') ? 'active' : ''}`}>
            <div className="menu-icon">
              <FontAwesomeIcon icon="bell" />
            </div>
            <span>Notifications</span>
          </Link>
        </>
      );
    }
    
    // Default attendee navbar
    return (
      <>
        <Link to="/dashboard" className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="th-large" />
          </div>
          <span>My Dashboard</span>
        </Link>
        
        <Link to="/events" className={`menu-item ${isActive('/events') ? 'active' : ''}`}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="calendar-check" />
          </div>
          <span>Explore Events</span>
        </Link>
        
        <Link to="/calendar" className={`menu-item ${isActive('/calendar') ? 'active' : ''}`}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="calendar-alt" />
          </div>
          <span>My Calendar</span>
        </Link>

        <Link to="/my-tickets" className={`menu-item ${isActive('/my-tickets') ? 'active' : ''}`}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="ticket-alt" />
          </div>
          <span>My Tickets</span>
        </Link>
        
        <Link to="/notifications" className={`menu-item ${isActive('/notifications') ? 'active' : ''}`}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="bell" />
          </div>
          <span>Notifications</span>
        </Link>
      </>
    );
  };

  return (
    <div className="sidebar" data-role={user?.role || 'user'}>
      <div className="sidebar-logo">
        <Link to="/">
          <div className="logo-container">
            <div className="logo-icon">🎉</div>
            <div className="logo-text">EventHub</div>
          </div>
        </Link>
      </div>

      <div className="user-info">
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

      <div className="sidebar-menu">
        {renderNavLinks()}
      </div>

      <div className="sidebar-footer">
        <Link to="/profile" className={`menu-item ${isActive('/profile') ? 'active' : ''}`}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="user" />
          </div>
          <span>Profile</span>
        </Link>

        <button onClick={toggleDarkMode} className="theme-toggle">
          <FontAwesomeIcon icon={darkMode ? "sun" : "moon"} />
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button onClick={handleLogout} className="sign-out-btn">
          <FontAwesomeIcon icon="sign-out-alt" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar; 