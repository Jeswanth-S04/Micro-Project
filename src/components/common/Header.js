import React, { useMemo, useCallback } from 'react';
import { Navbar, Nav, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import NotificationBell from '../notifications/NotificationBell';

// Constants moved outside component for better performance
const USER_ROLE_LABELS = {
  1: 'Finance Admin',
  2: 'Department Head', 
  3: 'Management'
};

const ROLE_BADGE_VARIANTS = {
  1: 'danger',   // Finance Admin
  2: 'primary',  // Department Head
  3: 'success',  // Management
};

const ROLE_QUICK_ACTIONS = {
  1: [ // Finance Admin
    { to: '/categories', emoji: '', label: 'Manage Categories' },
    { to: '/allocations', emoji: '', label: 'Manage Allocations' },
    { to: '/requests', emoji: '', label: 'Review Requests' }
  ],
  2: [ // Department Head
    { to: '/requests/new', emoji: '', label: 'New Request' },
    { to: '/requests', emoji: '', label: 'My Requests' }
  ],
  3: [ // Management
    { to: '/analytics', emoji: '', label: 'Analytics' },
    { to: '/reports', emoji: '', label: 'Executive Reports' }
  ]
};

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Memoized values for better performance
  const roleBadgeVariant = useMemo(() => 
    ROLE_BADGE_VARIANTS[user?.role] || 'secondary', 
    [user?.role]
  );

  const roleLabel = useMemo(() => 
    USER_ROLE_LABELS[user?.role] || 'Unknown', 
    [user?.role]
  );

  const quickActions = useMemo(() => 
    ROLE_QUICK_ACTIONS[user?.role] || [], 
    [user?.role]
  );

  // Memoized callbacks
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleSidebarToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Header: Sidebar toggle clicked'); // Debug log
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      console.warn('Header: onToggleSidebar prop is not provided');
    }
  }, [onToggleSidebar]);

  // User initials for avatar
  const userInitials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="border-bottom shadow-sm px-3"
      fixed="top"
      style={{ zIndex: 1030, height: '60px' }}
    >
      {/* Left Side - Brand and Toggle */}
      <div className="d-flex align-items-center">
        <button
          type="button"
          className="btn btn-outline-secondary border-0 me-3 d-flex align-items-center justify-content-center"
          onClick={handleSidebarToggle}
          title="Toggle Sidebar"
          aria-label="Toggle navigation sidebar"
          style={{ width: '40px', height: '40px' }}
        >
          <span className="fs-5">☰</span>
        </button>
        
        <Navbar.Brand 
          as={Link} 
          to="/dashboard" 
          className="fw-bold text-primary text-decoration-none d-flex align-items-center"
        >
          <span className="me-2 fs-4"></span>
          <span style={{color:'black'}}>Simple Budget Allocation Tool</span>
          <span className="d-sm-none">Budget</span>
        </Navbar.Brand>
      </div>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto d-flex align-items-center">
          
          {/* Notifications */}
          <span style={{color:'white'}}>🔔</span>
          <Nav.Item className="me-3">
            
            <NotificationBell />
            
          </Nav.Item>

          {/* Quick Actions Dropdown */}
          {quickActions.length > 0 && (
            <Dropdown className="me-3">
              <Dropdown.Toggle 
                variant="outline-primary" 
                id="quick-actions-dropdown"
                className="d-flex align-items-center border-0"
              >
                <span className="me-1"></span>
                <span className="d-none d-md-inline">Quick Actions</span>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Header>
                  <span className="me-1"></span>
                  Quick Actions
                </Dropdown.Header>
                
                {quickActions.map((action) => (
                  <Dropdown.Item 
                    key={action.to} 
                    as={Link} 
                    to={action.to}
                    className="d-flex align-items-center py-2"
                  >
                    <span className="me-2">{action.emoji}</span>
                    {action.label}
                  </Dropdown.Item>
                ))}
                
                <Dropdown.Divider />
                
                <Dropdown.Item as={Link} to="/reports" className="d-flex align-items-center py-2">
                  <span className="me-2"></span>
                  View Reports
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

          {/* User Profile Dropdown */}
          <Dropdown>
            <Dropdown.Toggle 
              variant="link" 
              id="user-dropdown"
              className="text-decoration-none border-0 p-0"
            >
              <div className="d-flex align-items-center">
                <div 
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                  style={{ width: '36px', height: '36px' }}
                >
                  <span className="text-white fw-semibold small">
                    {userInitials}
                  </span>
                </div>
                
                <div className="d-none d-lg-block text-start">
                  <div className="fw-semibold text-dark small mb-0">
                    {user?.name || 'User'}
                  </div>
                  <Badge bg={roleBadgeVariant} className="small">
                    {roleLabel}
                  </Badge>
                </div>
                
                <span className="ms-2 text-muted">⌄</span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="shadow">
              {/* User Info Header */}
              <div className="px-3 py-3 border-bottom bg-light">
                <div className="d-flex align-items-center">
                  <div 
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                    style={{ width: '48px', height: '48px' }}
                  >
                    <span className="text-white fw-bold">
                      {userInitials}
                    </span>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">
                      {user?.name || 'Unknown User'}
                    </div>
                    <div className="small text-muted mb-1">
                      {user?.email || 'No email'}
                    </div>
                    <Badge bg={roleBadgeVariant} className="small">
                      {roleLabel}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <Dropdown.Item 
                as={Link} 
                to="/profile" 
                className="d-flex align-items-center py-2"
              >
                <span className="me-2"></span>
                My Profile
              </Dropdown.Item>
              
              <Dropdown.Item 
                as={Link} 
                to="/dashboard" 
                className="d-flex align-items-center py-2"
              >
                <span className="me-2"></span>
                Dashboard
              </Dropdown.Item>
              
              <Dropdown.Item 
                as={Link} 
                to="/settings" 
                className="d-flex align-items-center py-2"
              >
                <span className="me-2"></span>
                Settings
              </Dropdown.Item>
              
              <Dropdown.Divider />
              
              <Dropdown.Item 
                onClick={handleLogout} 
                className="d-flex align-items-center py-2 text-danger"
              >
                <span className="me-2"></span>
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default React.memo(Header);
