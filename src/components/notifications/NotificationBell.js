import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getMyNotifications();
      
      if (response?.success && Array.isArray(response.data)) {
        // Map the data to handle property name differences
        const mappedNotifications = response.data.map(notification => ({
          id: notification.id || notification.Id,
          title: notification.title || notification.Title || 'Notification',
          message: notification.message || notification.Message || 'No message',
          isRead: notification.isRead ?? notification.IsRead ?? false,
          createdAt: notification.createdAt || notification.CreatedAt
        }));
        
        setNotifications(mappedNotifications.slice(0, 5)); // Show only latest 5
      } else if (response?.Success && Array.isArray(response.Data)) {
        // Handle direct uppercase response
        const mappedNotifications = response.Data.map(notification => ({
          id: notification.Id,
          title: notification.Title || 'Notification',
          message: notification.Message || 'No message',
          isRead: notification.IsRead ?? false,
          createdAt: notification.CreatedAt
        }));
        
        setNotifications(mappedNotifications.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading notifications for bell:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length, 
    [notifications]
  );

  const handleMarkAsRead = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (title) => {
    if (!title) return '';
    
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('request')) return '';
    if (titleLower.includes('approved')) return '';
    if (titleLower.includes('rejected')) return '';
    if (titleLower.includes('threshold') || titleLower.includes('alert')) return '';
    if (titleLower.includes('allocation')) return '';
    return '';
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return formatDate(dateString);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle 
        variant="link" 
        className="text-decoration-none border-0 p-0 position-relative"
        id="notifications-dropdown"
      >
        <span className="fs-5"></span>
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle badge-sm rounded-pill"
            style={{ fontSize: '0.6rem', minWidth: '18px', height: '18px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="shadow" style={{ minWidth: '350px' }}>
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge bg="primary" className="small">
              {unreadCount} new
            </Badge>
          )}
        </Dropdown.Header>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <div className="fs-1">🔕</div>
              <div className="mt-2">No notifications</div>
            </div>
          ) : (
            notifications.map(notification => (
              <Dropdown.Item 
                key={notification.id} 
                className={`py-3 ${notification.isRead ? '' : 'bg-light'}`}
                style={{ whiteSpace: 'normal' }}
              >
                <div className="d-flex">
                  <div className="me-2 mt-1">
                    <span>{getNotificationIcon(notification.title)}</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small mb-1 d-flex justify-content-between align-items-start">
                      <span>{notification.title}</span>
                      {!notification.isRead && (
                        <button
                          className="btn btn-link btn-sm p-0 ms-2"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Mark as read"
                          style={{ fontSize: '12px' }}
                        >
                          ✓
                        </button>
                      )}
                    </div>
                    <div className="text-muted small mb-1" style={{ fontSize: '0.875rem' }}>
                      {notification.message}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {getTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
        
        <Dropdown.Divider />
        <Dropdown.Item as={Link} to="/notifications" className="text-center text-primary">
          <span className="me-1"></span>
          View All Notifications
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default React.memo(NotificationBell);
