import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    console.log('Layout: Toggle sidebar called, current state:', sidebarCollapsed);
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="layout">
      <Header onToggleSidebar={handleToggleSidebar} />
      
      <div className="layout-content d-flex" style={{ marginTop: '60px' }}>
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={handleToggleSidebar} 
        />
        
        <main 
          className="main-content flex-grow-1 bg-light" 
          style={{ 
            marginLeft: sidebarCollapsed ? '60px' : '250px',
            transition: 'margin-left 0.3s ease',
            minHeight: 'calc(100vh - 60px)',
            overflow: 'auto'
          }}
        >
          <div className="container-fluid p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
