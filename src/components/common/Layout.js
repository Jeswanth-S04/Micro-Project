import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout">
      <Header onToggleSidebar={handleToggleSidebar} />
      
      <div className="layout-content">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
        
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="container-fluid p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
