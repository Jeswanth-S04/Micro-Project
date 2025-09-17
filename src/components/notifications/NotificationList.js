import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ListGroup, Badge, Button, Alert, ButtonGroup } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [markingRead, setMarkingRead] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  console.log('🔍 NotificationList: Current notifications:', notifications);

  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications(false); // Refresh without showing loader
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      console.log('🔍 Loading notifications...');
      
      const response = await notificationService.getMyNotifications();
      console.log('✅ Notifications API Response:', response);
      
      if (response?.success && Array.isArray(response.data)) {
        const mappedNotifications = response.data.map(notification => ({
          id: notification.id || notification.Id,
          userId: notification.userId || notification.UserId,
          targetRole: notification.targetRole || notification.TargetRole || '',
          title: notification.title || notification.Title || 'Notification',
          message: notification.message || notification.Message || 'No message',
          isRead: notification.isRead ?? notification.IsRead ?? false,
          createdAt: notification.createdAt || notification.CreatedAt
        }));
        
        console.log('✅ Mapped notifications:', mappedNotifications);
        setNotifications(mappedNotifications);
        setLastUpdated(new Date());
      } else if (response?.Success && Array.isArray(response.Data)) {
        const mappedNotifications = response.Data.map(notification => ({
          id: notification.Id,
          userId: notification.UserId,
          targetRole: notification.TargetRole || '',
          title: notification.Title || 'Notification',
          message: notification.Message || 'No message',
          isRead: notification.IsRead ?? false,
          createdAt: notification.CreatedAt
        }));
        
        console.log('✅ Mapped notifications (uppercase):', mappedNotifications);
        setNotifications(mappedNotifications);
        setLastUpdated(new Date());
      } else {
        console.log('❌ Invalid notifications response:', response);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]);
      toast.error('Failed to load notifications');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingRead(prev => new Set(prev).add(notificationId));
      console.log('🔍 Marking notification as read:', notificationId);
      
      await notificationService.markAsRead(notificationId);
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      
      toast.success('✅ Marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    } finally {
      setMarkingRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      console.log('🔍 Marking all as read:', unreadNotifications.length, 'notifications');
      
      if (unreadNotifications.length === 0) {
        toast.info('No unread notifications to mark');
        return;
      }

      setMarkingRead(new Set(unreadNotifications.map(n => n.id)));
      
      await Promise.all(
        unreadNotifications.map(n => notificationService.markAsRead(n.id))
      );
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success(`✅ Marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingRead(new Set());
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (title) => {
    if (!title) return '';
    
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('approved')) {
      return '';
    } else if (titleLower.includes('rejected')) {
      return '';
    } else if (titleLower.includes('request') || titleLower.includes('adjustment')) {
      return '';
    } else if (titleLower.includes('threshold') || titleLower.includes('alert') || titleLower.includes('warning')) {
      return '';
    } else if (titleLower.includes('allocation') || titleLower.includes('budget')) {
      return '';
    } else if (titleLower.includes('exceeded') || titleLower.includes('limit')) {
      return '';
    } else {
      return '';
    }
  };

  const getNotificationPriority = (title, message) => {
    const text = `${title} ${message}`.toLowerCase();
    
    if (text.includes('exceeded') || text.includes('critical')) {
      return 'danger';
    } else if (text.includes('threshold') || text.includes('warning') || text.includes('near')) {
      return 'warning';
    } else if (text.includes('approved') || text.includes('success')) {
      return 'success';
    } else if (text.includes('rejected') || text.includes('denied')) {
      return 'danger';
    } else {
      return 'info';
    }
  };

  const formatNotificationMessage = (message) => {
    // Clean up the message formatting
    return message
      .replace(/(\d+\.?\d*)\s*in\s+/g, '$1 for ') // Better formatting
      .replace(/Your request #(\d+) for/, 'Your request for') // Remove request ID
      .replace(/\.000000000000000000000000/g, '') // Remove trailing zeros
      .replace(/(\$\d+)\.0+(\s)/g, '$1$2'); // Clean up currency formatting
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = getFilteredNotifications();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <span className="me-2"></span>
                Notifications
              </h2>
              <p className="text-muted">
                Stay updated with important budget management activities
                {unreadCount > 0 && (
                  <Badge bg="primary" className="ms-2">{unreadCount} unread</Badge>
                )}
              </p>
              <small className="text-muted">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </small>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => loadNotifications()}
                size="sm"
              >
                <span className="me-1"></span>
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="primary" 
                  onClick={handleMarkAllAsRead}
                  disabled={markingRead.size > 0}
                  size="sm"
                >
                  <span className="me-1"></span>
                  Mark All Read ({unreadCount})
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Filter Tabs */}
      <Row className="mb-3">
        <Col>
          <ButtonGroup>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('all')}
            >
              <span className="me-1"></span>
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'warning' : 'outline-warning'}
              onClick={() => setFilter('unread')}
            >
              <span className="me-1"></span>
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'success' : 'outline-success'}
              onClick={() => setFilter('read')}
            >
              <span className="me-1"></span>
              Read ({notifications.length - unreadCount})
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-5">
                  <span className="fs-1">
                    {filter === 'unread' ? '' : filter === 'read' ? '' : ''}
                  </span>
                  <h5 className="mt-3 text-muted">
                    {filter === 'unread' ? 'All caught up!' : 
                     filter === 'read' ? 'No read notifications' : 
                     'No notifications yet'}
                  </h5>
                  <p className="text-muted">
                    {filter === 'all' && notifications.length === 0 && "You'll receive notifications about budget requests, approvals, and alerts here"}
                    {filter === 'unread' && "No new notifications to show"}
                    {filter === 'read' && "Read notifications will appear here"}
                  </p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {filteredNotifications.map((notification, index) => {
                    const priority = getNotificationPriority(notification.title, notification.message);
                    const isMarking = markingRead.has(notification.id);
                    
                    return (
                      <ListGroup.Item 
                        key={notification.id}
                        className={`p-3 ${!notification.isRead ? 'bg-light border-start border-4' : ''} ${
                          !notification.isRead && priority === 'danger' ? 'border-danger' :
                          !notification.isRead && priority === 'warning' ? 'border-warning' :
                          !notification.isRead && priority === 'success' ? 'border-success' :
                          !notification.isRead ? 'border-primary' : ''
                        }`}
                        style={{ 
                          transition: 'all 0.3s ease',
                          opacity: isMarking ? 0.7 : 1 
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <div className="me-3 fs-4">
                                {getNotificationIcon(notification.title)}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-bold d-flex align-items-center">
                                  {notification.title}
                                  {!notification.isRead && (
                                    <Badge 
                                      bg={priority} 
                                      className="ms-2" 
                                      style={{ fontSize: '10px' }}
                                    >
                                      NEW
                                    </Badge>
                                  )}
                                </h6>
                                <small className="text-muted">
                                  <span className="me-1"></span>
                                  {formatDate(notification.createdAt)}
                                </small>
                              </div>
                            </div>
                            
                            <p className="mb-0 text-dark" style={{ lineHeight: '1.5' }}>
                              {formatNotificationMessage(notification.message)}
                            </p>
                          </div>
                          
                          <div className="ms-3">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={isMarking}
                                style={{ minWidth: '100px' }}
                              >
                                {isMarking ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" />
                                    Reading...
                                  </>
                                ) : (
                                  <>
                                    <span className="me-1">✓</span>
                                    Mark Read
                                  </>
                                )}
                              </Button>
                            )}
                            {notification.isRead && (
                              <Badge bg="success" className="px-3 py-2">
                                <span className="me-1"></span>
                                Read
                              </Badge>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
            
            {/* Summary Footer */}
            {notifications.length > 0 && (
              <Card.Footer className="bg-light text-center">
                <small className="text-muted">
                  <span className="me-3">
                    <span className="me-1"></span>
                    Total: {notifications.length}
                  </span>
                  <span className="me-3">
                    <span className="me-1"></span>
                    Unread: {unreadCount}
                  </span>
                  <span>
                    <span className="me-1"></span>
                    Read: {notifications.length - unreadCount}
                  </span>
                </small>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Row className="mt-4">
          <Col className="text-center">
            <div className="d-flex justify-content-center gap-3">
              <Button 
                variant="outline-primary" 
                onClick={() => loadNotifications()}
                size="sm"
              >
                <span className="me-1"></span>
                Refresh All
              </Button>
              
              {unreadCount > 0 && (
                <Button 
                  variant="outline-success" 
                  onClick={handleMarkAllAsRead}
                  disabled={markingRead.size > 0}
                  size="sm"
                >
                  <span className="me-1"></span>
                  Clear All Unread
                </Button>
              )}

              <Button 
                variant="outline-secondary"
                onClick={() => {
                  setFilter('all');
                  loadNotifications();
                }}
                size="sm"
              >
                <span className="me-1"></span>
                Show All
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default NotificationList;
