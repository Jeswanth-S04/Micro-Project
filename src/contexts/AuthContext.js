import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

// Create and export the context
export const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getCurrentUser();
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Login attempt for:', email);
      
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        const userData = {
          name: response.data.name,
          email: email,
          role: response.data.role,
          departmentId: response.data.departmentId
        };
        
        setToken(response.data.token);
        setUser(userData);
        
        console.log('AuthContext: Login successful for:', userData.name);
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('AuthContext: Login failed:', error.message);
      throw error; // Re-throw to let Login component handle it
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Initializing...</div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
