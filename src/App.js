import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';



// Dashboard Components
import DepartmentDashboard from './components/dashboard/DepartmentDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ManagementDashboard from './components/dashboard/ManagementDashboard';

// Other Components
import CategoryList from './components/categories/CategoryList';
import AllocationList from './components/allocations/AllocationList';
import RequestList from './components/requests/RequestList';
import Analytics from './components/analytics/Analytics';
import Reports from './components/reports/Reports';
import NotificationList from './components/notifications/NotificationList';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
// Remove this line: import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/custom.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard Routes */}
                <Route path="dashboard" element={<DashboardRouter />} />
                
                {/* Feature Routes */}
                <Route path="categories" element={<CategoryList />} />
                <Route path="allocations" element={<AllocationList />} />
                <Route path="requests" element={<RequestList />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reports" element={<Reports />} />
                <Route path="notifications" element={<NotificationList />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                {/* <Route path="/users" element={<UserManagement />} /> */}
              </Route>
            </Routes>
            
            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Dashboard Router Component
const DashboardRouter = () => {
  return (
    <ProtectedRoute>
      <DashboardSelector />
    </ProtectedRoute>
  );
};

// Dashboard Selector based on user role
const DashboardSelector = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 1: // Finance Admin
      return <AdminDashboard />;
    case 2: // Department Head
      return <DepartmentDashboard />;
    case 3: // Management
      return <ManagementDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default App;
