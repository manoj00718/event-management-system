import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import './EventAnalytics.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const EventAnalytics = ({ eventId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view analytics');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/analytics/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event analytics:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [eventId]);
  
  if (loading) {
    return <div className="analytics-loading">Loading analytics data...</div>;
  }
  
  if (error) {
    return <div className="analytics-error">{error}</div>;
  }
  
  if (!analytics) {
    return <div className="analytics-error">No analytics data available</div>;
  }
  
  // Prepare data for attendance pie chart
  const attendanceData = {
    labels: ['Checked In', 'Not Checked In'],
    datasets: [
      {
        data: [analytics.checkedInCount, analytics.registeredCount - analytics.checkedInCount],
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for registration timeline bar chart
  const registrationData = {
    labels: analytics.registrationTimeline.map(item => item.date),
    datasets: [
      {
        label: 'Registrations',
        data: analytics.registrationTimeline.map(item => item.count),
        backgroundColor: '#007bff',
        borderColor: '#0069d9',
        borderWidth: 1
      }
    ]
  };
  
  const registrationOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Registration Timeline'
      }
    }
  };

  return (
    <div className="event-analytics">
      <h3>Event Analytics</h3>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-header">
            <h4>Event Summary</h4>
          </div>
          <div className="analytics-content">
            <div className="analytics-stat">
              <div className="stat-label">Views</div>
              <div className="stat-value">{analytics.viewCount}</div>
            </div>
            <div className="analytics-stat">
              <div className="stat-label">Registrations</div>
              <div className="stat-value">{analytics.registeredCount}</div>
            </div>
            <div className="analytics-stat">
              <div className="stat-label">Capacity</div>
              <div className="stat-value">{analytics.capacity}</div>
            </div>
            <div className="analytics-stat">
              <div className="stat-label">Waitlist</div>
              <div className="stat-value">{analytics.waitlistCount}</div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-header">
            <h4>Conversion Rate</h4>
          </div>
          <div className="analytics-content">
            <div className="analytics-stat large">
              <div className="stat-value">{analytics.conversionRate}%</div>
              <div className="stat-label">Views to Registrations</div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analytics.conversionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-header">
            <h4>Attendance</h4>
          </div>
          <div className="analytics-content chart-container">
            <Pie data={attendanceData} />
            <div className="analytics-stat centered">
              <div className="stat-value">{analytics.checkInRate}%</div>
              <div className="stat-label">Check-in Rate</div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card full-width">
          <div className="analytics-header">
            <h4>Registration Timeline</h4>
          </div>
          <div className="analytics-content chart-container">
            <Bar data={registrationData} options={registrationOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics; 