import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have a redirect path from the state
  const from = location.state?.from || '/dashboard';
  const action = location.state?.action;
  
  useEffect(() => {
    // Show message if redirected from event registration
    if (action === 'register') {
      toast.info('Please login to register for the event');
    }
  }, [action]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // After login, redirect to the original page if there was one
        navigate(from);
        
        // If the user came from event registration, show success message
        if (action === 'register') {
          toast.success('Login successful! Complete your event registration now.');
        }
      }
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = (role) => {
    devLogin(role);
    
    // Redirect to the original page if there was one
    navigate(from);
    
    // If the user came from event registration, show success message
    if (action === 'register') {
      toast.success('Login successful! Complete your event registration now.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to EventHub</h2>
        <p className="auth-subtitle">
          {action === 'register' 
            ? 'Login to continue with event registration' 
            : 'Enter your credentials to access your account'}
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon="envelope" className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon="lock" className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
            </div>
          </div>
          
          <div className="form-extras">
            <label className="checkbox-container">
              <input type="checkbox" name="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon="spinner" spin /> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>or login with demo account</span>
        </div>
        
        <div className="demo-buttons">
          <button 
            className="demo-button demo-user"
            onClick={() => handleDemoLogin('user')}
          >
            <FontAwesomeIcon icon="user" /> User Demo
          </button>
          <button 
            className="demo-button demo-organizer"
            onClick={() => handleDemoLogin('organizer')}
          >
            <FontAwesomeIcon icon="user-tie" /> Organizer Demo
          </button>
          <button 
            className="demo-button demo-admin"
            onClick={() => handleDemoLogin('admin')}
          >
            <FontAwesomeIcon icon="user-shield" /> Admin Demo
          </button>
        </div>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 