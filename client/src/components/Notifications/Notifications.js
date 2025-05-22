import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../../utils/api';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const { updateUnreadCount } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await getNotifications(page);
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
      updateUnreadCount(data.unreadCount);
    } catch (error) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, read: true } : notification
      ));
      const unreadCount = notifications.filter(n => !n.read).length - 1;
      updateUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
      updateUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(notification => notification._id !== id));
      const unreadCount = notifications.filter(n => !n.read && n._id !== id).length;
      updateUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-error">{error}</div>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <button
            className="btn-secondary"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          No notifications yet
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                    <span className={`notification-type ${notification.type}`}>
                      {notification.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notification._id);
                      }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-icon delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="notifications-pagination">
              <button
                className="btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="btn-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications; 