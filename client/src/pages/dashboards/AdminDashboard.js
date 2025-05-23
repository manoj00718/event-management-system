import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalBookings: 0,
    revenue: 0
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Get all events
      const eventsResponse = await axios.get('http://localhost:5000/api/events?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Get admin stats
      const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setEvents(eventsResponse.data.events || []);
      setUsers(usersResponse.data || []);
      
      // Calculate stats
      const totalEvents = eventsResponse.data.totalEvents || eventsResponse.data.events.length;
      const totalUsers = usersResponse.data.length || 0;
      const totalBookings = eventsResponse.data.events.reduce(
        (sum, event) => sum + (event.attendees ? event.attendees.length : 0), 0
      );
      const revenue = eventsResponse.data.events.reduce(
        (sum, event) => sum + (event.price * (event.attendees ? event.attendees.length : 0)), 0
      );

      setStats({
        totalEvents,
        totalUsers,
        totalBookings,
        revenue
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Set fallback data for development
      setStats({
        totalEvents: 15,
        totalUsers: 48,
        totalBookings: 237,
        revenue: 42580
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-breadcrumb">
          <span>Admin Dashboard</span>
        </div>
        <div className="dashboard-welcome">
          <h2>Hello {user?.name || 'Admin'}, welcome to the admin dashboard!</h2>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="stat-card total-events">
          <div className="stat-icon">
            <FontAwesomeIcon icon="calendar-alt" />
          </div>
          <div className="stat-info">
            <h3>Total Events</h3>
            <p className="stat-value">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="stat-card total-users">
          <div className="stat-icon">
            <FontAwesomeIcon icon="users" />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card total-bookings">
          <div className="stat-icon">
            <FontAwesomeIcon icon="ticket-alt" />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
          </div>
        </div>

        <div className="stat-card total-revenue">
          <div className="stat-icon">
            <FontAwesomeIcon icon="chart-line" />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="ticket-sales-section">
          <div className="section-header">
            <h2>Ticket Sales</h2>
            <div className="section-filter">
              <span>Last 30 days</span>
              <FontAwesomeIcon icon="chevron-down" />
            </div>
          </div>
          <div className="donut-chart-container">
            <div className="donut-chart">
              <div className="donut-placeholder"></div>
              <div className="donut-center">
                <p className="donut-value">237</p>
                <p className="donut-label">Tickets</p>
              </div>
            </div>
            <div className="ticket-stats">
              <div className="ticket-stat">
                <div className="stat-color sold"></div>
                <div className="stat-details">
                  <p className="stat-title">Sold</p>
                  <p className="stat-count">175</p>
                </div>
                <span className="stat-percentage">45%</span>
              </div>
              <div className="ticket-stat">
                <div className="stat-color booked"></div>
                <div className="stat-details">
                  <p className="stat-title">Booked</p>
                  <p className="stat-count">62</p>
                </div>
                <span className="stat-percentage">30%</span>
              </div>
              <div className="ticket-stat">
                <div className="stat-color available"></div>
                <div className="stat-details">
                  <p className="stat-title">Available</p>
                  <p className="stat-count">113</p>
                </div>
                <span className="stat-percentage">25%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="revenue-section">
          <div className="section-header">
            <h2>Revenue Overview</h2>
            <div className="section-filter">
              <span>This Month</span>
              <FontAwesomeIcon icon="chevron-down" />
            </div>
          </div>
          <div className="revenue-details">
            <div className="revenue-stats">
              <div>
                <p className="stats-label">Total Revenue</p>
                <p className="revenue-value">{formatCurrency(stats.revenue)}</p>
              </div>
              <div>
                <p className="stats-label">This Month</p>
                <p className="revenue-amount">{formatCurrency(Math.round(stats.revenue * 0.42))}</p>
              </div>
              <div>
                <p className="stats-label">Profit</p>
                <p className="profit-amount">{formatCurrency(Math.round(stats.revenue * 0.3))}</p>
              </div>
            </div>
            <div className="chart-placeholder"></div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Recent Events</h2>
          <Link to="/events" className="view-all-link">View All</Link>
        </div>
        <div className="events-grid">
          {events.slice(0, 3).map((event, index) => (
            <div key={event._id || index} className="event-card">
              <div className="event-image">
                <span className="category-badge">{event.category}</span>
                <img 
                  src={event.image || `https://source.unsplash.com/random/600x400/?event,${index}`} 
                  alt={event.title} 
                />
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <div className="event-location">
                  <FontAwesomeIcon icon="map-marker-alt" className="event-icon" />
                  {event.location}
                </div>
                <div className="event-footer">
                  <div className="event-date">
                    <FontAwesomeIcon icon="calendar" className="event-icon" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="event-price">
                    {event.price > 0 ? formatCurrency(event.price) : 'Free'}
                  </div>
                </div>
                <div className="booking-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${Math.min(((event.attendees ? event.attendees.length : 0) / event.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="booking-details">
                  <span>Booked {event.attendees ? event.attendees.length : 0} / {event.capacity}</span>
                  <span className="booking-percentage">
                    {Math.round(((event.attendees ? event.attendees.length : 0) / event.capacity) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="section-footer">
          <Link to="/events" className="view-all-btn">View All Events</Link>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>User Management</h2>
        </div>
        <div className="users-table">
          <div className="table-header">
            <div className="table-cell">Name</div>
            <div className="table-cell">Email</div>
            <div className="table-cell">Role</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Joined</div>
            <div className="table-cell">Actions</div>
          </div>
          <div className="table-body">
            {users.slice(0, 5).map((user, index) => (
              <div key={user._id || index} className="table-row">
                <div className="table-cell">{user.name}</div>
                <div className="table-cell">{user.email}</div>
                <div className="table-cell">{user.role}</div>
                <div className="table-cell">
                  <span className="status-badge active">Active</span>
                </div>
                <div className="table-cell">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
                <div className="table-cell actions">
                  <button className="action-btn view">
                    <FontAwesomeIcon icon="eye" />
                  </button>
                  <button className="action-btn edit">
                    <FontAwesomeIcon icon="pencil-alt" />
                  </button>
                  <button className="action-btn block">
                    <FontAwesomeIcon icon="user-shield" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 