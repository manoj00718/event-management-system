import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Payment.css';

const Payment = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to complete payment');
      navigate('/login', { state: { from: `/payment/${id}` } });
      return;
    }
    
    fetchEvent();
  }, [id, isAuthenticated, navigate]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to complete payment');
      navigate('/login', { state: { from: `/payment/${id}` } });
      return;
    }
    
    setProcessing(true);
    
    try {
      // In a real app, this would integrate with a payment gateway
      // This is a mock implementation
      setTimeout(async () => {
        try {
          // After payment is processed, register for the event
          const token = localStorage.getItem('token');
          await axios.post(
            `http://localhost:5000/api/events/${id}/register`, 
            { paymentMethod, paymentCompleted: true }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          toast.success('Payment successful! You are now registered for the event.');
          navigate(`/events/${id}`);
        } catch (error) {
          setError(error.response?.data?.error || 'Failed to complete registration');
          toast.error(error.response?.data?.error || 'Failed to complete registration');
        } finally {
          setProcessing(false);
        }
      }, 2000);
    } catch (error) {
      setError('Payment processing failed. Please try again.');
      toast.error('Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <FontAwesomeIcon icon="spinner" spin />
        <span>Loading payment details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
        Event not found
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h1>Complete Your Registration</h1>
        
        <div className="event-summary">
          <h2>{event.title}</h2>
          <div className="event-details">
            <div className="event-detail">
              <FontAwesomeIcon icon="calendar-day" className="detail-icon" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="event-detail">
              <FontAwesomeIcon icon="map-marker-alt" className="detail-icon" />
              <span>{event.location}</span>
            </div>
            <div className="event-detail">
              <FontAwesomeIcon icon="ticket-alt" className="detail-icon" />
              <span>1 Ticket</span>
            </div>
          </div>
        </div>
        
        <div className="payment-amount">
          <h3>Payment Amount</h3>
          <div className="price-breakdown">
            <div className="price-item">
              <span>Ticket Price</span>
              <span>${event.price.toFixed(2)}</span>
            </div>
            <div className="price-item">
              <span>Service Fee</span>
              <span>${(event.price * 0.05).toFixed(2)}</span>
            </div>
            <div className="price-item total">
              <span>Total</span>
              <span>${(event.price * 1.05).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handlePayment} className="payment-form">
          <h3>Payment Method</h3>
          
          <div className="payment-methods">
            <div 
              className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <FontAwesomeIcon icon="credit-card" className="payment-icon" />
              <span>Credit Card</span>
            </div>
            <div 
              className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <FontAwesomeIcon icon={['fab', 'paypal']} className="payment-icon" />
              <span>PayPal</span>
            </div>
          </div>
          
          {paymentMethod === 'card' && (
            <div className="card-details">
              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456" 
                  maxLength="19"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Name on Card</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/events/${id}`)} 
              className="cancel-button"
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="pay-button"
              disabled={processing}
            >
              {processing ? (
                <>
                  <FontAwesomeIcon icon="spinner" spin />
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="lock" />
                  Pay ${(event.price * 1.05).toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="payment-security">
          <FontAwesomeIcon icon="shield-alt" className="security-icon" />
          <p>Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Payment; 