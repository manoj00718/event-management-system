import React, { useState, useEffect } from 'react';
import { getOrganizerDashboard } from '../../utils/api';
import './Dashboard.css';

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="activity-item">
      <div className="activity-event">
        <h4>{activity.event.title}</h4>
        <span className="activity-date">{formatDate(activity.lastUpdated)}</span>
      </div>
      <div className="activity-stats">
        <div className="activity-stat">
          <span className="stat-label">Views</span>
          <span className="stat-number">{activity.views.total}</span>
        </div>
        <div className="activity-stat">
          <span className="stat-label">Registrations</span>
          <span className="stat-number">{activity.registrations.total}</span>
        </div>
        <div className="activity-stat">
          <span className="stat-label">Revenue</span>
          <span className="stat-number">${activity.revenue.total}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await getOrganizerDashboard();
      setData(data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!data) return null;

  const { summary, recentActivity } = data;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <button
          className="btn-secondary refresh-button"
          onClick={fetchDashboardData}
        >
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Events"
          value={summary.totalEvents}
          subtitle="Active events"
          icon="📅"
        />
        <StatCard
          title="Total Views"
          value={summary.totalViews}
          subtitle="Across all events"
          icon="👁️"
        />
        <StatCard
          title="Total Registrations"
          value={summary.totalRegistrations}
          subtitle="Confirmed attendees"
          icon="✅"
        />
        <StatCard
          title="Total Revenue"
          value={`$${summary.totalRevenue.toLocaleString()}`}
          subtitle="From ticket sales"
          icon="💰"
        />
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="no-activity">No recent activity</div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 