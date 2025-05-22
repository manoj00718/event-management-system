import React from 'react';
import { useUser } from '../../context/UserContext';
import './NotificationBadge.css';

const NotificationBadge = () => {
  const { unreadNotifications } = useUser();

  if (!unreadNotifications) return null;

  return (
    <span className="notification-badge">
      {unreadNotifications > 99 ? '99+' : unreadNotifications}
    </span>
  );
};

export default NotificationBadge; 