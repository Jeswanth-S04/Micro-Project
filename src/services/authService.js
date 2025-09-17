import api from './api';

export const authService = {
  // Login user
  login: async (loginData) => {
    try {
      console.log('AuthService: Attempting login for:', loginData.email);
      
      const response = await api.post('/auth/login', {
        Email: loginData.email,  // Capital E to match backend DTO
        Password: loginData.password  // Capital P to match backend DTO
      });
      
      console.log('AuthService: Raw response:', response);
      
      // Check for backend response structure (with capital letters)
      if (response.data && response.data.Success && response.data.Data) {
        const { Token, Role, DepartmentId, Name } = response.data.Data;
        
        console.log('AuthService: Login successful:', {
          Name,
          Role,
          DepartmentId,
          hasToken: !!Token
        });
        
        // Store auth data
        localStorage.setItem('budget_token', Token);
        localStorage.setItem('budget_user', JSON.stringify({
          name: Name,
          email: loginData.email,
          role: Role,
          departmentId: DepartmentId
        }));
        
        // Return normalized response for frontend
        return {
          success: true,
          message: response.data.Message,
          data: {
            token: Token,
            role: Role,
            departmentId: DepartmentId,
            name: Name
          }
        };
      } else {
        console.error('AuthService: Unexpected response structure:', response.data);
        throw new Error(response.data?.Message || response.data?.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('AuthService: Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        const message = errorData?.Message || errorData?.message || 'Invalid credentials';
        throw new Error(message);
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        throw new Error('Cannot connect to server. Please check if backend is running on http://localhost:5022');
      } else {
        // Other error
        throw new Error(error.message || 'Login failed');
      }
    }
  },

  logout: () => {
    localStorage.removeItem('budget_token');
    localStorage.removeItem('budget_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('budget_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('budget_token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('budget_token');
    const user = localStorage.getItem('budget_user');
    return !!(token && user);
  }
};

export default authService;
