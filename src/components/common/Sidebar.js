import React, { useMemo, useCallback } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Fixed import path
import { hasPermission, PERMISSIONS } from '../../utils/rolePermissions';

// Menu items configuration moved outside component for better performance
const MENU_ITEMS = [
  {
    path: '/dashboard',
    emoji: '',
    label: 'Dashboard',
    permission: [
      PERMISSIONS.VIEW_DEPARTMENT_DASHBOARD,
      PERMISSIONS.VIEW_ADMIN_DASHBOARD,
      PERMISSIONS.VIEW_MANAGEMENT_DASHBOARD
    ]
  },
  {
    path: '/categories',
    emoji: '',
    label: 'Categories',
    permission: [PERMISSIONS.VIEW_CATEGORIES]
  },
  {
    path: '/allocations',
    emoji: '',
    label: 'Allocations',
    permission: [PERMISSIONS.VIEW_ALLOCATIONS]
  },
  {
    path: '/requests',
    emoji: '',
    label: 'Requests',
    permission: [PERMISSIONS.VIEW_REQUESTS]
  },
  {
    path: '/analytics',
    emoji: '',
    label: 'Analytics',
    permission: [PERMISSIONS.VIEW_ANALYTICS]
  },
  {
    path: '/reports',
    emoji: '',
    label: 'Reports',
    permission: [PERMISSIONS.VIEW_REPORTS]
  },
  {
    path: '/notifications',
    emoji: '',
    label: 'Notifications',
    permission: [PERMISSIONS.VIEW_NOTIFICATIONS]
  }
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Memoized active path check
  const isActive = useCallback((path) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  }, [location.pathname]);

  // Memoized visible menu items based on user permissions
  const visibleItems = useMemo(() => 
    MENU_ITEMS.filter(item => 
      hasPermission(user?.role, item.permission)
    ), 
    [user?.role]
  );

  // Memoized toggle handler
  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle();
    }
  }, [onToggle]);

  // Get user role emoji
  const getUserRoleEmoji = useMemo(() => {
    switch (user?.role) {
      case 1: return ''; // Finance Admin
      case 2: return ''; // Department Head
      case 3: return '';   // Management
      default: return '';
    }
  }, [user?.role]);

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '60px' : '250px',
        transition: 'width 0.3s ease',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        minHeight: '100vh',
        position: 'fixed',
        top: '56px', // Account for header height
        left: 0,
        zIndex: 1020,
        overflowY: 'auto'
      }}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header p-3 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          {!isCollapsed && (
            <div className="d-flex align-items-center">
              <span className="fs-4 me-2"></span>
              <h6 className="mb-0 fw-bold text-light">Menu</h6>
            </div>
          )}
          
          <button 
            className="btn btn-outline-secondary border-0 p-1"
            onClick={handleToggle}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ fontSize: '0.875rem' }}
          >
            <span style={{color:'white'}}>{isCollapsed ? '▶' : '◀'}</span>
          </button>
        </div>
      </div>

      {/* User Info Section */}
      {!isCollapsed && (
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex align-items-center">
            <div 
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: '32px', height: '32px' }}
            >
              <span className="text-white fw-bold small">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold small text-dark">
                {user?.name || 'Unknown User'}
              </div>
              <div className="small text-muted d-flex align-items-center">
                <span className="me-1">{getUserRoleEmoji}</span>
                {user?.role === 1 && 'Admin'}
                {user?.role === 2 && 'Dept. Head'}
                {user?.role === 3 && 'Management'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <Nav className="flex-column p-2">
        {visibleItems.map((item) => {
          const isItemActive = isActive(item.path);
          
          return (
            <Nav.Item key={item.path} className="mb-1">
              <Nav.Link
                as={Link}
                to={item.path}
                className={`
                  d-flex align-items-center py-2 px-3 rounded text-decoration-none
                  ${isItemActive 
                    ? 'bg-primary text-white fw-semibold' 
                    : 'text-dark hover-bg-light'
                  }
                `}
                style={{
                  transition: 'all 0.2s ease',
                  border: 'none'
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <span 
                  className={`${isCollapsed ? 'fs-5' : 'me-2'}`}
                  style={{ 
                    minWidth: '24px',
                    textAlign: 'center'
                  }}
                >
                  {item.emoji}
                </span>
                
                {!isCollapsed && (
                  <span className="nav-text">{item.label}</span>
                )}

                {/* Active indicator */}
                {isItemActive && !isCollapsed && (
                  <span className="ms-auto">
                    <span className="badge bg-light text-primary"></span>
                  </span>
                )}
              </Nav.Link>
              
            </Nav.Item>
          );
        })}
      </Nav>
      

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="mt-auto p-3 border-top bg-light">
          <div className="small text-muted text-center">
            <div> </div>
            <div className="mt-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Sidebar);
