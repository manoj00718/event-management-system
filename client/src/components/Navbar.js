import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('👋 Successfully logged out!');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">🎉 EventHub</Link>
        </div>

        {/* Mobile menu button */}
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          <span className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Desktop navigation */}
        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>
            Browse Events
          </Link>

          {user ? (
            <>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/events/create" className="nav-link">
                  + Create Event
                </Link>
              )}
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-link">
                Logout
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 